package id.zaaza.karaokeku.data.model

data class AuthPayload(
    val user: UserProfile?,
    val token: String?
)
