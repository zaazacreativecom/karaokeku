/**
 * MP4 Variant Generator (for legacy/non-browser-friendly formats like .mpg)
 * File: src/utils/videoMp4Variant.js
 *
 * Tujuan:
 * - Mengubah file .mpg menjadi .mp4 (H.264 + AAC, faststart) agar bisa diputar di browser.
 * - Output disimpan berdampingan dengan input (nama sama, ekstensi .mp4).
 *
 * Catatan:
 * - Proses dibuat idempotent + ada lock (inflight) supaya tidak double transcode.
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

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

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (_) {
    // Ignore
  }
};

const fileLooksValid = async (filePath) => {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.isFile() && stat.size > 0;
  } catch (_) {
    return false;
  }
};

const buildOptions = () => {
  const crf = process.env.MPG_TO_MP4_CRF || process.env.UPLOAD_VIDEO_CRF || '23';
  const preset = process.env.MPG_TO_MP4_PRESET || process.env.UPLOAD_VIDEO_PRESET || 'veryfast';
  const maxHeight = parseIntOr(process.env.MPG_TO_MP4_MAX_HEIGHT || process.env.UPLOAD_VIDEO_MAX_HEIGHT, 0);
  const fps = parseIntOr(process.env.MPG_TO_MP4_FPS || process.env.UPLOAD_VIDEO_FPS, 0);
  const audioBitrate = process.env.MPG_TO_MP4_AUDIO_BITRATE || process.env.UPLOAD_VIDEO_AUDIO_BITRATE || '192k';

  return {
    crf,
    preset,
    maxHeight,
    fps,
    audioBitrate
  };
};

const transcodeToMp4 = (inputPath, outputTmpPath, options) => {
  const { crf, preset, maxHeight, fps, audioBitrate } = options;

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      // Keep only first video + first audio (if exists)
      .outputOptions(['-map 0:v:0', '-map 0:a:0?'])
      // Video: browser-friendly H.264
      .videoCodec('libx264')
      .outputOptions([
        `-preset ${preset}`,
        `-crf ${crf}`,
        '-pix_fmt yuv420p',
        '-profile:v main',
        '-movflags +faststart',
        '-f mp4'
      ])
      // Audio: always AAC for browser compatibility
      .audioCodec('aac')
      .outputOptions([`-b:a ${audioBitrate}`]);

    const filters = [];
    if (maxHeight > 0) {
      filters.push(`scale='if(gt(ih,${maxHeight}),-2,iw)':'if(gt(ih,${maxHeight}),${maxHeight},ih)'`);
    }
    if (fps > 0) {
      filters.push(`fps=${fps}`);
    }
    if (filters.length > 0) {
      command.videoFilters(filters);
    }

    command
      .output(outputTmpPath)
      .on('end', () => resolve(outputTmpPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

/**
 * Ensure MP4 variant exists next to inputPath (same basename).
 * @param {string} inputPath Absolute path to source video
 * @returns {Promise<string>} Absolute path to MP4 output (may equal inputPath if already .mp4)
 */
const ensureMp4Variant = async (inputPath) => {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('inputPath tidak valid');
  }
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Video file not found: ${inputPath}`);
  }

  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.mp4') return inputPath;

  // Only generate for legacy .mpg (scanner supports .mpg, browsers often don't).
  if (ext !== '.mpg') return inputPath;

  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, ext);
  const outputPath = path.join(dir, `${base}.mp4`);

  if (inflight.has(outputPath)) {
    return inflight.get(outputPath);
  }

  const job = (async () => {
    // Skip if already exists (and looks valid)
    if (await fileLooksValid(outputPath)) return outputPath;

    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    const tmpPath = `${outputPath}.tmp`;
    await safeUnlink(tmpPath);

    try {
      const options = buildOptions();
      await transcodeToMp4(inputPath, tmpPath, options);
      await fs.promises.rename(tmpPath, outputPath);
      return outputPath;
    } finally {
      await safeUnlink(tmpPath);
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
  ensureMp4Variant
};
