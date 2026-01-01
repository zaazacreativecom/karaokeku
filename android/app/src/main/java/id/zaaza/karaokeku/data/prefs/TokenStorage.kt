package id.zaaza.karaokeku.data.prefs

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class TokenStorage(context: Context) {
    private val prefs = context.getSharedPreferences("karaoke_prefs", Context.MODE_PRIVATE)

    suspend fun saveToken(token: String) = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_JWT_TOKEN, token).apply()
    }

    suspend fun clearToken() = withContext(Dispatchers.IO) {
        prefs.edit().remove(KEY_JWT_TOKEN).apply()
    }

    suspend fun getToken(): String? = withContext(Dispatchers.IO) {
        prefs.getString(KEY_JWT_TOKEN, null)
    }

    fun peekToken(): String? {
        return prefs.getString(KEY_JWT_TOKEN, null)
    }

    companion object {
        private const val KEY_JWT_TOKEN = "key_jwt_token"
    }
}
