/**
 * Thumbnail Generator Utility
 * File: src/utils/thumbnailGenerator.js
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path (env override supported).
const configuredFfmpegPath = process.env.FFMPEG_PATH || ffmpegPath;
if (configuredFfmpegPath) {
  ffmpeg.setFfmpegPath(configuredFfmpegPath);
}

const inflight = new Map();

/**
 * Generate thumbnail from video file
 * @param {string} videoPath - Absolute path to video file
 * @param {string} outputDir - Directory to save thumbnail
 * @param {string} filename - Output filename (without extension)
 * @returns {Promise<string>} - Relative path to generated thumbnail
 */
const generateThumbnail = (videoPath, outputDir, filename) => {
  const outputFilename = `${filename}.jpg`;
  const outputPath = path.join(outputDir, outputFilename);
  const publicUrl = `/uploads/thumbnails/${outputFilename}`;

  if (inflight.has(outputPath)) {
    return inflight.get(outputPath);
  }

  const job = new Promise((resolve, reject) => {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if video exists
    if (!fs.existsSync(videoPath)) {
      return reject(new Error(`Video file not found: ${videoPath}`));
    }

    // Skip if already exists (and looks valid)
    try {
      const stat = fs.statSync(outputPath);
      if (stat.isFile() && stat.size > 0) {
        return resolve(publicUrl);
      }
    } catch (_) {
      // Not exists - continue
    }
    
    const takeScreenshotAt = (timemark) =>
      new Promise((resolveShot, rejectShot) => {
        ffmpeg(videoPath)
          .screenshots({
            count: 1,
            folder: outputDir,
            filename: outputFilename,
            timemarks: [timemark], // Fixed timestamp (avoids ffprobe dependency from % timemarks)
            fastSeek: true,
            size: '320x180' // 16:9 thumbnail
          })
          .on('end', resolveShot)
          .on('error', rejectShot);
      });

    // Generate thumbnail from a fixed timestamp (configurable). Fallback if needed.
    const primaryTimemark = process.env.THUMBNAIL_TIMEMARK || '00:00:05';
    const fallbackTimemark = process.env.THUMBNAIL_FALLBACK_TIMEMARK || '00:00:01';

    takeScreenshotAt(primaryTimemark)
      .catch(async (primaryErr) => {
        try {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (_) {
          // Ignore cleanup errors
        }

        try {
          await takeScreenshotAt(fallbackTimemark);
        } catch (fallbackErr) {
          // Surface primary error context for debugging, but reject with fallback error as final
          console.error('Error generating thumbnail (primary):', primaryErr);
          throw fallbackErr;
        }
      })
      .then(() => resolve(publicUrl))
      .catch((err) => {
        console.error('Error generating thumbnail:', err);
        reject(err);
      });
  });

  inflight.set(outputPath, job);
  job.then(
    () => inflight.delete(outputPath),
    () => inflight.delete(outputPath)
  );
  return job;
};

module.exports = { generateThumbnail };
