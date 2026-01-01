package id.zaaza.karaokeku.data.model

data class SongRequestPayload(
    val title: String,
    val artist: String,
    val genre: String? = null,
    val language: String? = null,
    val link: String? = null,
    val notes: String? = null
)

data class SongRequestEntry(
    val id: Int,
    val title: String,
    val artist: String,
    val status: String,
    val createdAt: String?
)
