package id.zaaza.karaokeku.data.model

data class ScoreSummary(
    val totalScore: Double,
    val totalSongs: Int,
    val averageScore: Double
)

data class PlaybackHistoryEntry(
    val id: Int,
    val songTitle: String,
    val score: Int,
    val playedAt: String?
)

data class LeaderboardEntry(
    val userId: Int,
    val username: String,
    val totalScore: Int
)
