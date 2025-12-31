/**
 * Score Service - Business logic untuk score dan history
 * File: src/services/scoreService.js
 */

const { PlayHistory, UserScore, Song, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { randomInt } = require('crypto');

const SCORE_MIN = 80;
const SCORE_MAX = 100;

const DEFAULT_LEVEL_SCORE_RANGES = Object.freeze({
  Pemula: { min: 80, max: 88 },
  Hobi: { min: 85, max: 92 },
  Profesional: { min: 90, max: 97 },
  Superstar: { min: 95, max: 100 }
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeScoreRange = (range) => {
  if (!range) return null;

  const minRaw = Number(range.min);
  const maxRaw = Number(range.max);
  if (!Number.isFinite(minRaw) || !Number.isFinite(maxRaw)) return null;

  const min = clamp(Math.round(minRaw), SCORE_MIN, SCORE_MAX);
  const max = clamp(Math.round(maxRaw), SCORE_MIN, SCORE_MAX);
  if (min > max) return null;

  return { min, max };
};

const parseLevelScoreRanges = () => {
  const raw = process.env.SCORE_LEVEL_RANGES;
  if (!raw) return DEFAULT_LEVEL_SCORE_RANGES;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_LEVEL_SCORE_RANGES;

    const normalizeKey = (key) => String(key || '').trim().toLowerCase();
    const toRange = (value) => {
      if (Array.isArray(value) && value.length >= 2) {
        return normalizeScoreRange({ min: value[0], max: value[1] });
      }
      if (value && typeof value === 'object') {
        return normalizeScoreRange({ min: value.min, max: value.max });
      }
      return null;
    };

    const merged = { ...DEFAULT_LEVEL_SCORE_RANGES };
    for (const [key, value] of Object.entries(parsed)) {
      const k = normalizeKey(key);
      const range = toRange(value);
      if (!range) continue;

      if (k === 'pemula') merged.Pemula = range;
      if (k === 'hobi') merged.Hobi = range;
      if (k === 'profesional') merged.Profesional = range;
      if (k === 'superstar') merged.Superstar = range;
    }

    return merged;
  } catch {
    return DEFAULT_LEVEL_SCORE_RANGES;
  }
};

const getUserLevelInfo = (totalSongsPlayed) => {
  const total = Number(totalSongsPlayed) || 0;

  let level = 'Pemula';
  let badge = '🎤';

  if (total >= 100) {
    level = 'Superstar';
    badge = '⭐';
  } else if (total >= 50) {
    level = 'Profesional';
    badge = '🏆';
  } else if (total >= 20) {
    level = 'Hobi';
    badge = '🎵';
  }

  const ranges = parseLevelScoreRanges();
  const scoreRange = ranges[level] ?? { min: SCORE_MIN, max: SCORE_MAX };

  return { level, badge, scoreRange };
};

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
 * @param {Object} data - {playedDuration} (score dihitung server)
 */
const endPlayback = async (userId, historyId, data) => {
  const { playedDuration } = data;
  
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
  
  // Score random berdasarkan level user (bukan durasi/timeline)
  const user = await User.findByPk(userId);
  const totalPlayedAfter = (Number(user?.total_songs_played) || 0) + 1;
  const levelInfo = getUserLevelInfo(totalPlayedAfter);

  const scoreRange = levelInfo.scoreRange || { min: SCORE_MIN, max: SCORE_MAX };
  const minScore = clamp(Number(scoreRange.min) || SCORE_MIN, SCORE_MIN, SCORE_MAX);
  const maxScoreInRange = clamp(Number(scoreRange.max) || SCORE_MAX, SCORE_MIN, SCORE_MAX);
  const low = Math.min(minScore, maxScoreInRange);
  const high = Math.max(minScore, maxScoreInRange);

  const finalScore = randomInt(low, high + 1);
  
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
    baseScore: finalScore,
    scoreMultiplier: 1,
    level: levelInfo.level,
    badge: levelInfo.badge,
    scoreMin: low,
    scoreMax: high,
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

  const levelInfo = getUserLevelInfo(totalPlayed);
  
  return {
    totalSongsPlayed: totalPlayed,
    totalDurationMinutes: Math.round(totalDuration / 60),
    averageScore: Math.round(avgScore?.avgScore || 0),
    level: levelInfo.level,
    badge: levelInfo.badge,
    scoreMultiplier: 1,
    scoreMin: levelInfo.scoreRange?.min ?? SCORE_MIN,
    scoreMax: levelInfo.scoreRange?.max ?? SCORE_MAX,
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
