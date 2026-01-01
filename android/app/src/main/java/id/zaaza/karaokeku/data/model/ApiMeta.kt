package id.zaaza.karaokeku.data.model

data class ApiMeta(
    val page: Int = 1,
    val limit: Int = 20,
    val total: Int = 0,
    val totalPages: Int = 0,
    val hasNextPage: Boolean = false,
    val hasPrevPage: Boolean = false
)
