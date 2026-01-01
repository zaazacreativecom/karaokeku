package id.zaaza.karaokeku.data.model

data class UserProfile(
    val id: Int,
    val name: String,
    val email: String,
    val username: String,
    val avatarUrl: String?,
    val role: String,
    val totalScore: Int,
    val totalSongsPlayed: Int
)
