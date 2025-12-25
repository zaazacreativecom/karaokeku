/**
 * Generate low-quality variants for existing videos.
 * File: src/utils/generateLowVideos.js
 *
 * Usage:
 *   node src/utils/generateLowVideos.js            # process all mp4 in uploads/videos
 *   node src/utils/generateLowVideos.js --file <filename-or-path>
 *
 * Output:
 *   uploads/videos/low/<filename>
 */

const fs = require('fs');
const path = require('path');
const { VIDEOS_PATH } = require('../config/paths');
const { ensureLowVideoVariant } = require('./videoLowVariant');

const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  return args[idx + 1] || null;
};

const isSupportedVideo = (filename) => filename.toLowerCase().endsWith('.mp4');

const processOne = async (inputPath) => {
  const filename = path.basename(inputPath);
  console.log(`🎬  Generating low variant: ${filename}`);
  const out = await ensureLowVideoVariant(inputPath, filename);
  console.log(`✅  Done: ${out}`);
};

const processAll = async () => {
  const entries = await fs.promises.readdir(VIDEOS_PATH, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => isSupportedVideo(name));

  if (files.length === 0) {
    console.log('⚠️  Tidak ada file .mp4 di uploads/videos');
    return;
  }

  console.log(`📦  Ditemukan ${files.length} video. Mulai generate varian low...`);

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const inputPath = path.join(VIDEOS_PATH, filename);
    console.log(`\n[${i + 1}/${files.length}] ${filename}`);
    try {
      await ensureLowVideoVariant(inputPath, filename);
      console.log('✅  OK');
    } catch (error) {
      console.error('❌  Gagal:', error.message || error);
    }
  }
};

const main = async () => {
  const fileArg = getArgValue('--file');
  if (fileArg) {
    const resolved = path.isAbsolute(fileArg) ? fileArg : path.resolve(process.cwd(), fileArg);
    if (!fs.existsSync(resolved)) {
      console.error(`❌  File tidak ditemukan: ${resolved}`);
      process.exit(1);
    }
    await processOne(resolved);
    return;
  }

  await processAll();
};

main().catch((err) => {
  console.error('❌  Fatal:', err);
  process.exit(1);
});

