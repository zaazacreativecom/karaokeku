package id.zaaza.karaokeku.data.model

data class PlaybackStartRequest(
    val songId: Int
)

data class PlaybackEndRequest(
    val historyId: Int,
    val playedDuration: Int,
    val score: Int
)
