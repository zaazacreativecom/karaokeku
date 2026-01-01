package id.zaaza.karaokeku.data.model

data class ApiResponse<T>(
    val success: Boolean = false,
    val message: String? = null,
    val data: T? = null,
    val meta: ApiMeta? = null
)
