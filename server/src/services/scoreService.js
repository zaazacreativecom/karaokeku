/**
 * Score Service - Business logic untuk score dan history
 * File: src/services/scoreService.js
 */

const { PlayHistory, UserScore, Song, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { calculateScore } = require('../utils/helpers');

/**
 * Mulai sesi karaoke (catat start playback)
 * @param {number} userId - ID user
 * @param {number} songId - ID lagu
 */
const startPlayback = async (userId, songId) => {
  // Validasi lagu
  const song = await Song.findByPk(songId);
  
  if (!song) {
    const error = new Error('Lagu tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Increment play count
  song.play_count += 1;
  await song.save();
  
  // Buat record play history
  const history = await PlayHistory.create({
    user_id: userId,
    song_id: songId,
    started_at: new Date()
  });
  
  return {
    historyId: history.id,
    song: song.toJSON()
  };
};

/**
 * Akhiri sesi karaoke dan simpan score
 * @param {number} userId - ID user
 * @param {number} historyId - ID play history
 * @param {Object} data - {playedDuration, score (optional)}
 */
const endPlayback = async (userId, historyId, data) => {
  const { playedDuration, score: providedScore } = data;
  
  // Cari history record
  const history = await PlayHistory.findOne({
    where: {
      id: historyId,
      user_id: userId
    },
    include: [
      {
        model: Song,
        as: 'song'
      }
    ]
  });
  
  if (!history) {
    const error = new Error('Play history tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Hitung score jika tidak diberikan
  let finalScore = providedScore;
  
  if ((finalScore === undefined || finalScore === null) && history.song && history.song.duration) {
    finalScore = calculateScore(playedDuration, history.song.duration);
  } else if (finalScore === undefined || finalScore === null) {
    // Default score berdasarkan durasi minimal
    finalScore = playedDuration > 60 ? Math.min(playedDuration / 3, 100) : 50;
  }
  
  finalScore = Math.round(finalScore);
  
  // Update play history
  history.ended_at = new Date();
  history.score = finalScore;
  history.duration_played = playedDuration;
  await history.save();
  
  // Simpan ke user_scores
  const userScore = await UserScore.create({
    user_id: userId,
    song_id: history.song_id,
    score: finalScore
  });
  
  // Cek apakah ini high score
  const maxScore = await UserScore.max('score', {
    where: {
      user_id: userId,
      song_id: history.song_id
    }
  });
  
  const isHighScore = finalScore >= maxScore;
  
  if (isHighScore) {
    userScore.is_high_score = true;
    await userScore.save();
    
    // Reset is_high_score pada score lama
    await UserScore.update(
      { is_high_score: false },
      {
        where: {
          user_id: userId,
          song_id: history.song_id,
          id: { [Op.ne]: userScore.id }
        }
      }
    );
  }
  
  // Update total score user
  const user = await User.findByPk(userId);
  if (user) {
    // Hitung ulang total score (rata-rata high scores)
    const avgScore = await UserScore.findOne({
      where: {
        user_id: userId,
        is_high_score: true
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('score')), 'avgScore'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSongs']
      ],
      raw: true
    });
    
    user.total_score = Math.round(avgScore?.avgScore || 0);
    user.total_songs_played = (user.total_songs_played || 0) + 1;
    await user.save();
  }
  
  return {
    score: finalScore,
    isHighScore,
    historyId: history.id
  };
};

/**
 * Dapatkan ringkasan score user
 * @param {number} userId - ID user
 */
const getUserScoreSummary = async (userId) => {
  // Total lagu yang dimainkan
  const totalPlayed = await PlayHistory.count({
    where: { user_id: userId }
  });
  
  // Total durasi bermain
  const totalDuration = await PlayHistory.sum('duration_played', {
    where: { user_id: userId }
  }) || 0;
  
  // Rata-rata score
  const avgScore = await UserScore.findOne({
    where: { user_id: userId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('score')), 'avgScore']
    ],
    raw: true
  });
  
  // High scores
  const highScores = await UserScore.findAll({
    where: {
      user_id: userId,
      is_high_score: true
    },
    include: [
      {
        model: Song,
        as: 'song',
        attributes: ['id', 'title', 'artist', 'thumbnail_url']
      }
    ],
    order: [['score', 'DESC']],
    limit: 10
  });
  
  // Recent plays
  const recentPlays = await PlayHistory.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Song,
        as: 'song',
        attributes: ['id', 'title', 'artist', 'thumbnail_url']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 10
  });
  
  // Level/badge berdasarkan total songs played
  let level = 'Pemula';
  let badge = '🎤';
  
  if (totalPlayed >= 100) {
    level = 'Superstar';
    badge = '⭐';
  } else if (totalPlayed >= 50) {
    level = 'Profesional';
    badge = '🏆';
  } else if (totalPlayed >= 20) {
    level = 'Hobi';
    badge = '🎵';
  } else if (totalPlayed >= 5) {
    level = 'Pemula';
    badge = '🎤';
  }
  
  return {
    totalSongsPlayed: totalPlayed,
    totalDurationMinutes: Math.round(totalDuration / 60),
    averageScore: Math.round(avgScore?.avgScore || 0),
    level,
    badge,
    highScores,
    recentPlays
  };
};

/**
 * Dapatkan play history user
 * @param {number} userId - ID user
 * @param {Object} options - Pagination options
 */
const getPlayHistory = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await PlayHistory.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: Song,
        as: 'song',
        attributes: ['id', 'title', 'artist', 'thumbnail_url', 'duration']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  return {
    history: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Dapatkan leaderboard (top users by score)
 * @param {number} limit - Jumlah user
 */
const getLeaderboard = async (limit = 10) => {
  const users = await User.findAll({
    where: {
      total_songs_played: { [Op.gt]: 0 }
    },
    attributes: ['id', 'name', 'username', 'avatar_url', 'total_score', 'total_songs_played'],
    order: [['total_score', 'DESC']],
    limit: parseInt(limit)
  });
  
  return users.map((user, index) => ({
    rank: index + 1,
    ...user.toJSON()
  }));
};

module.exports = {
  startPlayback,
  endPlayback,
  getUserScoreSummary,
  getPlayHistory,
  getLeaderboard
};
