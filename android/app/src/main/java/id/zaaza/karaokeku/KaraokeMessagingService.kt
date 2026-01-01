package id.zaaza.karaokeku

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import id.zaaza.karaokeku.util.NotificationHelper

class KaraokeMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        val title = message.notification?.title ?: "KaraokeKu"
        val body = message.notification?.body ?: message.data["message"] ?: ""
        NotificationHelper.showNotification(this, title, body)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
    }
}
