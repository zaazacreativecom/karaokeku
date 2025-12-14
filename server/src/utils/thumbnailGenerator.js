/**
 * Thumbnail Generator Utility
 * File: src/utils/thumbnailGenerator.js
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Generate thumbnail from video file
 * @param {string} videoPath - Absolute path to video file
 * @param {string} outputDir - Directory to save thumbnail
 * @param {string} filename - Output filename (without extension)
 * @returns {Promise<string>} - Relative path to generated thumbnail
 */
const generateThumbnail = (videoPath, outputDir, filename) => {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFilename = `${filename}.jpg`;
    const outputPath = path.join(outputDir, outputFilename);

    // Check if video exists
    if (!fs.existsSync(videoPath)) {
      return reject(new Error(`Video file not found: ${videoPath}`));
    }
    
    // Generate thumbnail (take frame at 10%)
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: outputDir,
        filename: outputFilename,
        timestamps: ['10%'], // Take snapshot at 10% of video duration for better chance of content
        size: '320x180' // 16:9 thumbnail
      })
      .on('end', () => {
        // Return public relative path
        // Assuming outputDir is inside 'uploads', we need path relative to 'uploads' parent or root
        // Standardizing to return '/uploads/thumbnails/filename.jpg'
        resolve(`/uploads/thumbnails/${outputFilename}`);
      })
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err);
        reject(err);
      });
  });
};

module.exports = { generateThumbnail };
