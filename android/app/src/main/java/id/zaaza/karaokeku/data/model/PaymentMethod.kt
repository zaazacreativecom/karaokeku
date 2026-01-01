package id.zaaza.karaokeku.data.model

data class PaymentMethod(
    val id: Int,
    val type: String,
    val name: String,
    val icon: String?,
    val accountNumber: String?,
    val accountName: String?,
    val qrCodeUrl: String?
)
