package id.zaaza.karaokeku.data.repository

import id.zaaza.karaokeku.data.model.AuthPayload
import id.zaaza.karaokeku.data.model.ChatConversation
import id.zaaza.karaokeku.data.model.ChatMessage
import id.zaaza.karaokeku.data.model.DonationHistoryEntry
import id.zaaza.karaokeku.data.model.DonationRequestPayload
import id.zaaza.karaokeku.data.model.FavoriteToggleRequest
import id.zaaza.karaokeku.data.model.GoogleLoginRequest
import id.zaaza.karaokeku.data.model.LeaderboardEntry
import id.zaaza.karaokeku.data.model.LoginRequest
import id.zaaza.karaokeku.data.model.PlaybackEndRequest
import id.zaaza.karaokeku.data.model.PlaybackHistoryEntry
import id.zaaza.karaokeku.data.model.PlaybackStartRequest
import id.zaaza.karaokeku.data.model.PlaylistCreationRequest
import id.zaaza.karaokeku.data.model.PlaylistDetails
import id.zaaza.karaokeku.data.model.PlaylistItemDetails
import id.zaaza.karaokeku.data.model.PlaylistSongRequest
import id.zaaza.karaokeku.data.model.PaymentMethod
import id.zaaza.karaokeku.data.model.RegisterRequest
import id.zaaza.karaokeku.data.model.ScoreSummary
import id.zaaza.karaokeku.data.model.SendMessageRequest
import id.zaaza.karaokeku.data.model.Song
import id.zaaza.karaokeku.data.model.SongRequestEntry
import id.zaaza.karaokeku.data.model.SongRequestPayload
import id.zaaza.karaokeku.data.model.UploadEntry
import id.zaaza.karaokeku.data.model.UserProfile
import id.zaaza.karaokeku.data.model.ApiResponse
import id.zaaza.karaokeku.data.network.ApiService
import id.zaaza.karaokeku.util.Resource
import okhttp3.MultipartBody
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class KaraokeRepository(
    private val api: ApiService
) {

    suspend fun login(emailOrUsername: String, password: String): Resource<AuthPayload> {
        return safeApiCall { api.login(LoginRequest(emailOrUsername, password)) }
    }

    suspend fun register(
        name: String,
        email: String,
        username: String,
        password: String,
        confirmPassword: String
    ): Resource<AuthPayload> {
        return safeApiCall {
            api.register(
                RegisterRequest(
                    name = name,
                    email = email,
                    username = username,
                    password = password,
                    confirmPassword = confirmPassword
                )
            )
        }
    }

    suspend fun loginWithGoogle(idToken: String): Resource<AuthPayload> {
        return safeApiCall { api.loginWithGoogle(GoogleLoginRequest(idToken)) }
    }

    suspend fun fetchProfile(): Resource<UserProfile> {
        return safeApiCall { api.me() }
    }

    suspend fun fetchSongs(filters: Map<String, Any?>): Resource<List<Song>> {
        return safeApiCall { api.getSongs(filters) }
    }

    suspend fun fetchGenres(): Resource<List<String>> = safeApiCall { api.getGenres() }

    suspend fun fetchLanguages(): Resource<List<String>> = safeApiCall { api.getLanguages() }

    suspend fun fetchSongDetail(songId: Int): Resource<Song> = safeApiCall { api.getSongById(songId) }

    suspend fun getPlaylists(): Resource<List<PlaylistDetails>> = safeApiCall { api.getMyPlaylists() }

    suspend fun createPlaylist(request: PlaylistCreationRequest): Resource<PlaylistDetails> {
        return safeApiCall { api.createPlaylist(request) }
    }

    suspend fun addSongToPlaylist(playlistId: Int, songId: Int): Resource<PlaylistItemDetails> {
        return safeApiCall { api.addSongToPlaylist(playlistId, PlaylistSongRequest(songId)) }
    }

    suspend fun toggleFavorite(songId: Int): Resource<Any> {
        return safeApiCall { api.toggleFavorite(FavoriteToggleRequest(songId)) }
    }

    suspend fun getChatConversations(): Resource<List<ChatConversation>> = safeApiCall { api.getConversations() }

    suspend fun getMessages(partnerId: Int): Resource<List<ChatMessage>> = safeApiCall { api.getMessages(partnerId) }

    suspend fun sendMessage(partnerId: Int, message: String): Resource<ChatMessage> {
        return safeApiCall { api.sendMessage(SendMessageRequest(partnerId, message)) }
    }

    suspend fun getDonations(): Resource<List<DonationHistoryEntry>> = safeApiCall { api.getMyDonations() }

    suspend fun createDonation(request: DonationRequestPayload): Resource<DonationHistoryEntry> {
        return safeApiCall { api.createDonation(request) }
    }

    suspend fun getPaymentMethods(): Resource<List<PaymentMethod>> = safeApiCall { api.getPaymentMethods() }

    suspend fun getRequests(): Resource<List<SongRequestEntry>> = safeApiCall { api.getMyRequests() }

    suspend fun createRequest(request: SongRequestPayload): Resource<SongRequestEntry> {
        return safeApiCall { api.createRequest(request) }
    }

    suspend fun getScoreSummary(): Resource<ScoreSummary> = safeApiCall { api.getScoreSummary() }

    suspend fun getPlayHistory(page: Int, limit: Int): Resource<List<PlaybackHistoryEntry>> {
        return safeApiCall { api.getPlayHistory(page, limit) }
    }

    suspend fun getLeaderboard(limit: Int): Resource<List<LeaderboardEntry>> = safeApiCall { api.getLeaderboard(limit) }

    suspend fun startPlayback(songId: Int): Resource<Any> = safeApiCall { api.startPlayback(PlaybackStartRequest(songId)) }

    suspend fun endPlayback(historyId: Int, playedDuration: Int, score: Int): Resource<Any> {
        return safeApiCall { api.endPlayback(PlaybackEndRequest(historyId, playedDuration, score)) }
    }

    suspend fun uploadSong(
        title: String,
        artist: String,
        videoFile: File,
        thumbnailFile: File?,
        genre: String? = null,
        language: String? = null,
        lyrics: String? = null
    ): Resource<UploadEntry> {
        val titlePart = title.toRequestBody("text/plain".toMediaTypeOrNull())
        val artistPart = artist.toRequestBody("text/plain".toMediaTypeOrNull())
        val genrePart = genre?.toRequestBody("text/plain".toMediaTypeOrNull())
        val languagePart = language?.toRequestBody("text/plain".toMediaTypeOrNull())
        val lyricsPart = lyrics?.toRequestBody("text/plain".toMediaTypeOrNull())

        val videoPart = MultipartBody.Part.createFormData(
            "video",
            videoFile.name,
            videoFile.asRequestBody("video/*".toMediaTypeOrNull())
        )

        val thumbnailPart = thumbnailFile?.let {
            MultipartBody.Part.createFormData(
                "thumbnail",
                it.name,
                it.asRequestBody("image/*".toMediaTypeOrNull())
            )
        }

        return safeApiCall {
            api.uploadSong(
                titlePart,
                artistPart,
                genrePart,
                languagePart,
                lyricsPart,
                videoPart,
                thumbnailPart
            )
        }
    }

    private suspend fun <T> safeApiCall(call: suspend () -> ApiResponse<T>): Resource<T> {
        return try {
            val response = call()
            if (response.success) {
                Resource.Success(response.data)
            } else {
                Resource.Error(response.message ?: "Terjadi kesalahan")
            }
        } catch (error: Exception) {
            Resource.Error(error.message ?: "Tidak dapat menghubungi server")
        }
    }
}
