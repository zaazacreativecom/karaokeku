/**
 * Media Optimizer
 * File: src/utils/mediaOptimizer.js
 *
 * Tujuan:
 * - Kompres/transcode video saat upload supaya ukuran lebih kecil dan siap streaming (faststart)
 * - Optimasi gambar thumbnail (resize + convert ke WebP)
 *
 * Semua proses bersifat best-effort (boleh gagal tanpa menghentikan request) di level pemanggil.
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

const getFileSize = async (filePath) => {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.isFile() ? stat.size : null;
  } catch (_) {
    return null;
  }
};

const buildUploadVideoOptions = () => {
  const crf = process.env.UPLOAD_VIDEO_CRF || '23';
  const preset = process.env.UPLOAD_VIDEO_PRESET || 'veryfast';
  const maxHeight = parseIntOr(process.env.UPLOAD_VIDEO_MAX_HEIGHT, 0); // 0 = keep original
  const fps = parseIntOr(process.env.UPLOAD_VIDEO_FPS, 0); // 0 = keep original

  const audioMode = (process.env.UPLOAD_VIDEO_AUDIO || 'copy').toLowerCase(); // copy | aac
  const audioBitrate = process.env.UPLOAD_VIDEO_AUDIO_BITRATE || '192k';

  return {
    crf,
    preset,
    maxHeight,
    fps,
    audioMode,
    audioBitrate
  };
};

const transcodeUploadVideo = (inputPath, outputTmpPath, options) => {
  const { crf, preset, maxHeight, fps, audioMode, audioBitrate } = options;

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions(['-map 0:v:0', '-map 0:a:0?'])
      .videoCodec('libx264')
      .outputOptions([
        `-preset ${preset}`,
        `-crf ${crf}`,
        '-pix_fmt yuv420p',
        '-profile:v main',
        '-movflags +faststart',
        '-f mp4'
      ]);

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

    if (audioMode === 'aac') {
      command.audioCodec('aac').outputOptions([`-b:a ${audioBitrate}`]);
    } else {
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
 * Optimize/transcode video file to MP4 (H.264) and replace/rename file.
 * @param {string} inputPath Absolute path
 * @returns {Promise<{outputPath: string, originalBytes: number|null, optimizedBytes: number|null}>}
 */
const optimizeUploadedVideo = async (inputPath) => {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('inputPath tidak valid');
  }
  if (!fs.existsSync(inputPath)) {
    throw new Error(`File video tidak ditemukan: ${inputPath}`);
  }

  const originalBytes = await getFileSize(inputPath);
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  const base = path.basename(inputPath, ext);

  // Always normalize to .mp4 (browser-friendly)
  const outputPath = path.join(dir, `${base}.mp4`);
  const tmpPath = `${outputPath}.tmp`;

  const options = buildUploadVideoOptions();

  // Clean stale tmp if any
  await safeUnlink(tmpPath);

  try {
    await transcodeUploadVideo(inputPath, tmpPath, options);
    await fs.promises.rename(tmpPath, outputPath);

    // Remove original if it was a different path (e.g., .mkv -> .mp4)
    if (outputPath !== inputPath) {
      await safeUnlink(inputPath);
    }

    const optimizedBytes = await getFileSize(outputPath);
    return { outputPath, originalBytes, optimizedBytes };
  } catch (error) {
    // If "copy" audio fails for some codecs/containers, fallback to AAC re-encode
    if (options.audioMode === 'copy') {
      await safeUnlink(tmpPath);

      const fallbackOptions = { ...options, audioMode: 'aac' };
      await transcodeUploadVideo(inputPath, tmpPath, fallbackOptions);
      await fs.promises.rename(tmpPath, outputPath);

      if (outputPath !== inputPath) {
        await safeUnlink(inputPath);
      }

      const optimizedBytes = await getFileSize(outputPath);
      return { outputPath, originalBytes, optimizedBytes };
    }

    throw error;
  } finally {
    await safeUnlink(tmpPath);
  }
};

const buildThumbnailOptions = () => {
  const maxWidth = parseIntOr(process.env.THUMBNAIL_MAX_WIDTH, 1280);
  const maxHeight = parseIntOr(process.env.THUMBNAIL_MAX_HEIGHT, 1280);
  const quality = parseIntOr(process.env.THUMBNAIL_WEBP_QUALITY, 80);
  const compressionLevel = parseIntOr(process.env.THUMBNAIL_WEBP_COMPRESSION_LEVEL, 4);

  return {
    maxWidth,
    maxHeight,
    quality,
    compressionLevel
  };
};

const transcodeThumbnailToWebp = (inputPath, outputTmpPath, options) => {
  const { maxWidth, maxHeight, quality, compressionLevel } = options;

  // Keep within bounding box without upscaling
  const scaleFilter = `scale='min(iw,${maxWidth})':'min(ih,${maxHeight})':force_original_aspect_ratio=decrease`;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-vframes 1'])
      .videoCodec('libwebp')
      .outputOptions([
        '-lossless 0',
        `-quality ${quality}`,
        `-compression_level ${compressionLevel}`
      ])
      .videoFilters([scaleFilter])
      .output(outputTmpPath)
      .on('end', () => resolve(outputTmpPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

/**
 * Optimize thumbnail image: resize + convert to WebP and replace original file.
 * @param {string} inputPath Absolute path
 * @returns {Promise<{outputPath: string, originalBytes: number|null, optimizedBytes: number|null}>}
 */
const optimizeUploadedThumbnail = async (inputPath) => {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('inputPath tidak valid');
  }
  if (!fs.existsSync(inputPath)) {
    throw new Error(`File thumbnail tidak ditemukan: ${inputPath}`);
  }

  const originalBytes = await getFileSize(inputPath);
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const base = path.basename(inputPath, ext);

  const outputPath = path.join(dir, `${base}.webp`);
  const tmpPath = `${outputPath}.tmp`;

  const options = buildThumbnailOptions();

  await safeUnlink(tmpPath);

  try {
    await transcodeThumbnailToWebp(inputPath, tmpPath, options);
    await fs.promises.rename(tmpPath, outputPath);

    if (outputPath !== inputPath) {
      await safeUnlink(inputPath);
    }

    const optimizedBytes = await getFileSize(outputPath);
    return { outputPath, originalBytes, optimizedBytes };
  } finally {
    await safeUnlink(tmpPath);
  }
};

module.exports = {
  optimizeUploadedVideo,
  optimizeUploadedThumbnail
};

