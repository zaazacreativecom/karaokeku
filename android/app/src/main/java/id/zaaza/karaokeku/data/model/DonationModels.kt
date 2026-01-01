package id.zaaza.karaokeku.data.model

data class DonationHistoryEntry(
    val id: Int,
    val amount: Double,
    val method: String,
    val status: String,
    val createdAt: String?
)

data class DonationRequestPayload(
    val amount: Double,
    val method: String,
    val donorName: String? = null,
    val message: String? = null,
    val proofUrl: String? = null
)

data class DonationStats(
    val total: Int,
    val pending: Int,
    val verified: Int,
    val rejected: Int,
    val totalAmount: Double
)
