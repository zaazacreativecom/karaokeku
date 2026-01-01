package id.zaaza.karaokeku.util

import com.google.gson.Gson
import id.zaaza.karaokeku.data.model.ChatMessage
import id.zaaza.karaokeku.data.prefs.TokenStorage
import id.zaaza.karaokeku.BuildConfig
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.engineio.client.transports.WebSocket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.URISyntaxException

sealed class ChatSocketEvent {
    object Connected : ChatSocketEvent()
    object Disconnected : ChatSocketEvent()
    data class MessageReceived(val message: ChatMessage) : ChatSocketEvent()
    data class UserStatus(val userId: Int, val online: Boolean) : ChatSocketEvent()
}

class ChatSocketManager(private val tokenStorage: TokenStorage) {
    private var socket: Socket? = null
    private val gson = Gson()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val _events = MutableSharedFlow<ChatSocketEvent>(extraBufferCapacity = 64)
    val events = _events.asSharedFlow()

    fun connect() {
        val token = tokenStorage.peekToken() ?: return
        if (socket?.connected() == true) return

        try {
            val options = IO.Options().apply {
                transports = arrayOf(WebSocket.NAME)
                query = "token=$token"
            }

            socket = IO.socket(BuildConfig.SOCKET_URL, options)
            socket?.on(Socket.EVENT_CONNECT) { emit(ChatSocketEvent.Connected) }
            socket?.on(Socket.EVENT_DISCONNECT) { emit(ChatSocketEvent.Disconnected) }
            socket?.on("receive_message") { args ->
                args.firstOrNull()?.let { raw ->
                    val json = JSONObject(raw.toString())
                    val message = gson.fromJson(json.getJSONObject("message").toString(), ChatMessage::class.java)
                    emit(ChatSocketEvent.MessageReceived(message))
                }
            }
            socket?.on("user_online") { args ->
                args.firstOrNull()?.let { raw ->
                    val json = JSONObject(raw.toString())
                    val userId = json.optInt("userId")
                    emit(ChatSocketEvent.UserStatus(userId, true))
                }
            }
            socket?.on("user_offline") { args ->
                args.firstOrNull()?.let { raw ->
                    val json = JSONObject(raw.toString())
                    val userId = json.optInt("userId")
                    emit(ChatSocketEvent.UserStatus(userId, false))
                }
            }
            socket?.connect()
        } catch (exception: URISyntaxException) {
            emit(ChatSocketEvent.Disconnected)
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket = null
        emit(ChatSocketEvent.Disconnected)
    }

    private fun emit(event: ChatSocketEvent) {
        scope.launch {
            _events.emit(event)
        }
    }
}
