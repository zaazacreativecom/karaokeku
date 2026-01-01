package id.zaaza.karaokeku.data.model

data class PlaylistItemDetails(
    val id: Int,
    val song: Song
)

data class PlaylistDetails(
    val id: Int,
    val name: String,
    val description: String?,
    val isPublic: Boolean,
    val coverUrl: String?,
    val items: List<PlaylistItemDetails>?
)

data class PlaylistCreationRequest(
    val name: String,
    val description: String? = null,
    val isPublic: Boolean = false,
    val coverUrl: String? = null
)

data class PlaylistSongRequest(
    val songId: Int
)
