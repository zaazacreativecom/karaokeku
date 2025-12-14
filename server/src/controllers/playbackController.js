/**
 * Playback Controller - Handle request playback dan score
 * File: src/controllers/playbackController.js
 */

const scoreService = require('../services/scoreService');
const { formatResponse, formatPagination } = require('../utils/helpers');

/**
 * POST /api/playback/start
 * Mulai sesi karaoke
 */
const startPlayback = async (req, res, next) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json(
        formatResponse(false, 'ID lagu wajib diisi.')
      );
    }
    
    const result = await scoreService.startPlayback(req.userId, songId);
    
    res.status(201).json(
      formatResponse(true, 'Sesi karaoke dimulai.', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/playback/end
 * Akhiri sesi karaoke dan simpan score
 */
const endPlayback = async (req, res, next) => {
  try {
    const { historyId, playedDuration, score } = req.body;
    
    if (!historyId) {
      return res.status(400).json(
        formatResponse(false, 'History ID wajib diisi.')
      );
    }
    
    const result = await scoreService.endPlayback(req.userId, historyId, {
      playedDuration: parseInt(playedDuration) || 0,
      score
    });
    
    res.json(formatResponse(true, 'Sesi karaoke selesai.', result));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me/scores
 * Dapatkan ringkasan score user
 */
const getMyScoreSummary = async (req, res, next) => {
  try {
    const summary = await scoreService.getUserScoreSummary(req.userId);
    
    res.json(formatResponse(true, 'Berhasil mendapatkan ringkasan score.', summary));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me/history
 * Dapatkan play history user
 */
const getMyPlayHistory = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    
    const result = await scoreService.getPlayHistory(req.userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json(formatResponse(
      true,
      'Berhasil mendapatkan riwayat pemutaran.',
      result.history,
      formatPagination(result.page, 20, result.total)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leaderboard
 * Dapatkan leaderboard
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { limit } = req.query;
    
    const leaderboard = await scoreService.getLeaderboard(parseInt(limit) || 10);
    
    res.json(formatResponse(true, 'Berhasil mendapatkan leaderboard.', leaderboard));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startPlayback,
  endPlayback,
  getMyScoreSummary,
  getMyPlayHistory,
  getLeaderboard
};
