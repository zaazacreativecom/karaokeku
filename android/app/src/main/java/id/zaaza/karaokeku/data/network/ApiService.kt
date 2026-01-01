package id.zaaza.karaokeku.data.network

import id.zaaza.karaokeku.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.QueryMap

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<AuthPayload>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<AuthPayload>

    @POST("auth/google")
    suspend fun loginWithGoogle(@Body request: GoogleLoginRequest): ApiResponse<AuthPayload>

    @GET("auth/me")
    suspend fun me(): ApiResponse<UserProfile>

    @GET("songs")
    suspend fun getSongs(@QueryMap filters: Map<String, @JvmSuppressWildcards Any?>): ApiResponse<List<Song>>

    @GET("songs/top")
    suspend fun getTopSongs(@Query("limit") limit: Int = 10): ApiResponse<List<Song>>

    @GET("songs/genres")
    suspend fun getGenres(): ApiResponse<List<String>>

    @GET("songs/languages")
    suspend fun getLanguages(): ApiResponse<List<String>>

    @GET("songs/{id}")
    suspend fun getSongById(@Path("id") id: Int): ApiResponse<Song>

    @GET("playlists")
    suspend fun getMyPlaylists(): ApiResponse<List<PlaylistDetails>>

    @POST("playlists")
    suspend fun createPlaylist(@Body request: PlaylistCreationRequest): ApiResponse<PlaylistDetails>

    @POST("playlists/{id}/songs")
    suspend fun addSongToPlaylist(@Path("id") playlistId: Int, @Body request: PlaylistSongRequest): ApiResponse<PlaylistItemDetails>

    @GET("favorites")
    suspend fun getFavorites(): ApiResponse<List<Song>>

    @POST("favorites/toggle")
    suspend fun toggleFavorite(@Body request: FavoriteToggleRequest): ApiResponse<Map<String, Any>>

    @GET("donations/my")
    suspend fun getMyDonations(): ApiResponse<List<DonationHistoryEntry>>

    @POST("donations")
    suspend fun createDonation(@Body request: DonationRequestPayload): ApiResponse<DonationHistoryEntry>

    @GET("payment-methods")
    suspend fun getPaymentMethods(): ApiResponse<List<PaymentMethod>>

    @GET("chat/conversations")
    suspend fun getConversations(): ApiResponse<List<ChatConversation>>

    @GET("chat/messages/{partnerId}")
    suspend fun getMessages(@Path("partnerId") partnerId: Int): ApiResponse<List<ChatMessage>>

    @POST("chat/send")
    suspend fun sendMessage(@Body request: SendMessageRequest): ApiResponse<ChatMessage>

    @GET("requests/my")
    suspend fun getMyRequests(): ApiResponse<List<SongRequestEntry>>

    @POST("requests")
    suspend fun createRequest(@Body request: SongRequestPayload): ApiResponse<SongRequestEntry>

    @GET("playback/me/scores")
    suspend fun getScoreSummary(): ApiResponse<ScoreSummary>

    @GET("playback/me/history")
    suspend fun getPlayHistory(@Query("page") page: Int, @Query("limit") limit: Int): ApiResponse<List<PlaybackHistoryEntry>>

    @GET("playback/leaderboard")
    suspend fun getLeaderboard(@Query("limit") limit: Int = 5): ApiResponse<List<LeaderboardEntry>>

    @POST("playback/start")
    suspend fun startPlayback(@Body request: PlaybackStartRequest): ApiResponse<Map<String, Any>>

    @POST("playback/end")
    suspend fun endPlayback(@Body request: PlaybackEndRequest): ApiResponse<Map<String, Any>>

    @Multipart
    @POST("uploads")
    suspend fun uploadSong(
        @Part("title") title: RequestBody,
        @Part("artist") artist: RequestBody,
        @Part("genre") genre: RequestBody?,
        @Part("language") language: RequestBody?,
        @Part("lyrics_data") lyricsData: RequestBody?,
        @Part video: MultipartBody.Part,
        @Part thumbnail: MultipartBody.Part?
    ): ApiResponse<UploadEntry>

    @GET("uploads/me")
    suspend fun getMyUploads(): ApiResponse<List<UploadEntry>>
}
