package id.zaaza.karaokeku.data.model

data class LoginRequest(
    val emailOrUsername: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val username: String,
    val password: String,
    val confirmPassword: String
)

data class GoogleLoginRequest(
    val idToken: String
)
