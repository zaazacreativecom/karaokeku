package id.zaaza.karaokeku.data.model

data class Song(
    val id: Int,
    val title: String,
    val artist: String,
    val genre: String?,
    val language: String?,
    val duration: Int?,
    val year: Int?,
    val videoUrlFull: String?,
    val videoUrlInstrumental: String?,
    val thumbnailUrl: String?,
    val lyricsData: List<LyricLine>?,
    val playCount: Int?
)

data class LyricLine(
    val time: Float,
    val text: String
)
