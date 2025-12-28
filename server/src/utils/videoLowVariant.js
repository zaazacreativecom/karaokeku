/**
 * Low-Quality Video Variant Generator
 * File: src/utils/videoLowVariant.js
 *
 * Tujuan:
 * - Mengurangi bitrate/resolusi video agar start lebih cepat di koneksi lambat
 * - Menjaga kualitas suara (audio stream tetap / copy jika memungkinkan)
 *
 * Output disimpan ke: uploads/videos/low/<filename>
 * dan bisa diakses via: /videos/low/<filename>
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { VIDEOS_LOW_PATH } = require('../config/paths');

// Set ffmpeg path (env override supported).
const configuredFfmpegPath = process.env.FFMPEG_PATH || ffmpegPath;
if (configuredFfmpegPath) {
  ffmpeg.setFfmpegPath(configuredFfmpegPath);
}

const inflight = new Map();

const parseIntOr = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildLowVariantOptions = () => {
  const height = parseIntOr(process.env.LOW_VIDEO_HEIGHT, 480);
  const fps = parseIntOr(process.env.LOW_VIDEO_FPS, 30);
  const crf = process.env.LOW_VIDEO_CRF || '28';
  const preset = process.env.LOW_VIDEO_PRESET || 'veryfast';

  // Optional caps (can help stabilize bandwidth spikes)
  const maxRate = process.env.LOW_VIDEO_MAXRATE || '1200k';
  const bufSize = process.env.LOW_VIDEO_BUFSIZE || '2400k';

  // Prefer keeping original audio without re-encoding
  const audioMode = (process.env.LOW_VIDEO_AUDIO || 'copy').toLowerCase(); // copy | aac
  const audioBitrate = process.env.LOW_VIDEO_AUDIO_BITRATE || '192k';

  return {
    height,
    fps,
    crf,
    preset,
    maxRate,
    bufSize,
    audioMode,
    audioBitrate
  };
};

const transcodeLowVariant = (inputPath, outputTmpPath, options) => {
  const {
    height,
    fps,
    crf,
    preset,
    maxRate,
    bufSize,
    audioMode,
    audioBitrate
  } = options;

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      // Keep only first video + first audio (if exists)
      .outputOptions(['-map 0:v:0', '-map 0:a:0?'])
      // Video settings: lower quality + keep compatibility
      .videoCodec('libx264')
      .outputOptions([
        `-preset ${preset}`,
        `-crf ${crf}`,
        '-pix_fmt yuv420p',
        '-profile:v main',
        '-level 3.1',
        '-f mp4',
        '-movflags +faststart',
        `-maxrate ${maxRate}`,
        `-bufsize ${bufSize}`
      ])
      // Avoid upscaling: only scale down if source > target height
      .videoFilters([
        `scale='if(gt(ih,${height}),-2,iw)':'if(gt(ih,${height}),${height},ih)'`,
        `fps=${fps}`
      ]);

    if (audioMode === 'aac') {
      command.audioCodec('aac').outputOptions([`-b:a ${audioBitrate}`]);
    } else {
      // Default: keep audio unchanged
      command.outputOptions(['-c:a copy']);
    }

    command
      .output(outputTmpPath)
      .on('end', () => resolve(outputTmpPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

/**
 * Ensure low-quality variant exists for a given video.
 * @param {string} inputPath - Absolute path to source video file
 * @param {string} filename - Filename used for output under VIDEOS_LOW_PATH
 * @returns {Promise<string>} - Absolute output path
 */
const ensureLowVideoVariant = async (inputPath, filename) => {
  if (!inputPath || !filename) {
    throw new Error('inputPath dan filename wajib diisi');
  }

  const outputPath = path.join(VIDEOS_LOW_PATH, filename);

  if (inflight.has(outputPath)) {
    return inflight.get(outputPath);
  }

  const job = (async () => {
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

    // Skip if already exists (and looks valid)
    try {
      const stat = await fs.promises.stat(outputPath);
      if (stat.isFile() && stat.size > 0) return outputPath;
    } catch (_) {
      // Not exists - continue
    }

    // Validate input exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Video file not found: ${inputPath}`);
    }

    const options = buildLowVariantOptions();
    const tmpPath = `${outputPath}.tmp`;

    // Clean up stale tmp file if any
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch (_) {
      // Ignore
    }

    try {
      await transcodeLowVariant(inputPath, tmpPath, options);
      fs.renameSync(tmpPath, outputPath);
      return outputPath;
    } catch (error) {
      // If "copy" audio fails for some codecs, fallback to AAC re-encode
      if (options.audioMode === 'copy') {
        try {
          if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        } catch (_) {
          // Ignore
        }

        const fallbackOptions = { ...options, audioMode: 'aac' };
        await transcodeLowVariant(inputPath, tmpPath, fallbackOptions);
        fs.renameSync(tmpPath, outputPath);
        return outputPath;
      }

      throw error;
    } finally {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch (_) {
        // Ignore
      }
    }
  })();

  inflight.set(outputPath, job);
  job.then(
    () => inflight.delete(outputPath),
    () => inflight.delete(outputPath)
  );
  return job;
};

module.exports = {
  ensureLowVideoVariant
};
