package id.zaaza.karaokeku.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import id.zaaza.karaokeku.data.model.*
import id.zaaza.karaokeku.data.prefs.TokenStorage
import id.zaaza.karaokeku.data.repository.KaraokeRepository
import id.zaaza.karaokeku.util.ChatSocketEvent
import id.zaaza.karaokeku.util.ChatSocketManager
import id.zaaza.karaokeku.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File

private const val PAGE_SIZE = 20

data class AuthState(
    val user: UserProfile? = null,
    val token: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

data class SongListState(
    val songs: List<Song> = emptyList(),
    val genres: List<String> = emptyList(),
    val languages: List<String> = emptyList(),
    val searchQuery: String = "",
    val genreFilter: String? = null,
    val languageFilter: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

data class SongDetailState(
    val song: Song? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

data class PlaylistState(
    val playlists: List<PlaylistDetails> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

data class ChatState(
    val conversations: List<ChatConversation> = emptyList(),
    val messages: List<ChatMessage> = emptyList(),
    val isConnected: Boolean = false,
    val error: String? = null
)

data class DonationState(
    val paymentMethods: List<PaymentMethod> = emptyList(),
    val donations: List<DonationHistoryEntry> = emptyList(),
    val isDonating: Boolean = false,
    val error: String? = null
)

data class RequestState(
    val requests: List<SongRequestEntry> = emptyList(),
    val isSubmitting: Boolean = false,
    val error: String? = null
)

data class UploadState(
    val uploads: List<UploadEntry> = emptyList(),
    val isUploading: Boolean = false,
    val error: String? = null
)

data class PlaybackState(
    val history: List<PlaybackHistoryEntry> = emptyList(),
    val summary: ScoreSummary? = null,
    val leaderboard: List<LeaderboardEntry> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class MainViewModel(
    private val repository: KaraokeRepository,
    private val tokenStorage: TokenStorage,
    private val chatSocketManager: ChatSocketManager
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _songState = MutableStateFlow(SongListState())
    val songState: StateFlow<SongListState> = _songState.asStateFlow()

    private val _songDetailState = MutableStateFlow(SongDetailState())
    val songDetailState: StateFlow<SongDetailState> = _songDetailState.asStateFlow()

    private val _playlistState = MutableStateFlow(PlaylistState())
    val playlistState: StateFlow<PlaylistState> = _playlistState.asStateFlow()

    private val _chatState = MutableStateFlow(ChatState())
    val chatState: StateFlow<ChatState> = _chatState.asStateFlow()

    private val _donationState = MutableStateFlow(DonationState())
    val donationState: StateFlow<DonationState> = _donationState.asStateFlow()

    private val _requestState = MutableStateFlow(RequestState())
    val requestState: StateFlow<RequestState> = _requestState.asStateFlow()

    private val _uploadState = MutableStateFlow(UploadState())
    val uploadState: StateFlow<UploadState> = _uploadState.asStateFlow()

    private val _playbackState = MutableStateFlow(PlaybackState())
    val playbackState: StateFlow<PlaybackState> = _playbackState.asStateFlow()

    init {
        viewModelScope.launch { loadSavedUser() }
        loadGenres()
        loadLanguages()
        loadSongs()
        viewModelScope.launch { collectChatEvents() }
        fetchPlaylists()
        fetchDonations()
        fetchPaymentMethods()
        fetchRequests()
        fetchPlayHistory()
        fetchLeaderboard()
    }

    private fun loadGenres() {
        viewModelScope.launch {
            when (val result = repository.fetchGenres()) {
                is Resource.Success -> {
                    _songState.update { it.copy(genres = result.data ?: emptyList()) }
                }
                is Resource.Error -> {
                    _songState.update { it.copy(error = result.message) }
                }
                else -> Unit
            }
        }
    }

    private fun loadLanguages() {
        viewModelScope.launch {
            when (val result = repository.fetchLanguages()) {
                is Resource.Success -> {
                    _songState.update { it.copy(languages = result.data ?: emptyList()) }
                }
                is Resource.Error -> {
                    _songState.update { it.copy(error = result.message) }
                }
                else -> Unit
            }
        }
    }

    private fun collectChatEvents() {
        viewModelScope.launch {
            chatSocketManager.events.collect { event ->
                when (event) {
                    ChatSocketEvent.Connected -> _chatState.update { it.copy(isConnected = true) }
                    ChatSocketEvent.Disconnected -> _chatState.update { it.copy(isConnected = false) }
                    is ChatSocketEvent.MessageReceived -> _chatState.update { state ->
                        state.copy(messages = state.messages + event.message)
                    }
                    is ChatSocketEvent.UserStatus -> Unit
                }
            }
        }
    }

    private suspend fun loadSavedUser() {
        val token = tokenStorage.getToken()
        if (!token.isNullOrBlank()) {
            _authState.update { it.copy(token = token, isLoading = true) }
            when (val result = repository.fetchProfile()) {
                is Resource.Success -> {
                    _authState.update { it.copy(user = result.data, isLoading = false, error = null) }
                    chatSocketManager.connect()
                }
                is Resource.Error -> {
                    _authState.update { it.copy(error = result.message, isLoading = false) }
                }
                else -> Unit
            }
        }
    }

    fun login(emailOrUsername: String, password: String) {
        viewModelScope.launch {
            _authState.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.login(emailOrUsername, password)) {
                is Resource.Success -> {
                    result.data?.token?.let { tokenStorage.saveToken(it); chatSocketManager.connect() }
                    _authState.update {
                        it.copy(
                            user = result.data?.user,
                            token = result.data?.token,
                            isLoading = false,
                            error = null
                        )
                    }
                }
                is Resource.Error -> {
                    _authState.update { it.copy(isLoading = false, error = result.message) }
                }
                else -> Unit
            }
        }
    }

    fun register(name: String, email: String, username: String, password: String, confirmPassword: String) {
        viewModelScope.launch {
            _authState.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.register(name, email, username, password, confirmPassword)) {
                is Resource.Success -> {
                    result.data?.token?.let { tokenStorage.saveToken(it); chatSocketManager.connect() }
                    _authState.update {
                        it.copy(
                            user = result.data?.user,
                            token = result.data?.token,
                            isLoading = false,
                            error = null
                        )
                    }
                }
                is Resource.Error -> {
                    _authState.update { it.copy(isLoading = false, error = result.message) }
                }
                else -> Unit
            }
        }
    }

    fun loginWithGoogle(idToken: String) {
        viewModelScope.launch {
            _authState.update { it.copy(isLoading = true, error = null) }
            when (val result = repository.loginWithGoogle(idToken)) {
                is Resource.Success -> {
                    result.data?.token?.let { tokenStorage.saveToken(it); chatSocketManager.connect() }
                    _authState.update {
                        it.copy(
                            user = result.data?.user,
                            token = result.data?.token,
                            isLoading = false,
                            error = null
                        )
                    }
                }
                is Resource.Error -> {
                    _authState.update { it.copy(isLoading = false, error = result.message) }
                }
                else -> Unit
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            tokenStorage.clearToken()
            _authState.value = AuthState()
            chatSocketManager.disconnect()
        }
    }

    fun loadSongs() {
        viewModelScope.launch {
            _songState.update { it.copy(isLoading = true, error = null) }
            val filters = mutableMapOf<String, Any?>()
            val current = _songState.value
            if (current.searchQuery.isNotBlank()) filters["search"] = current.searchQuery
            current.genreFilter?.let { filters["genre"] = it }
            current.languageFilter?.let { filters["language"] = it }
            filters["limit"] = PAGE_SIZE

            when (val result = repository.fetchSongs(filters)) {
                is Resource.Success -> {
                    _songState.update { it.copy(songs = result.data ?: emptyList(), isLoading = false, error = null) }
                }
                is Resource.Error -> {
                    _songState.update { it.copy(isLoading = false, error = result.message) }
                }
                else -> Unit
            }
        }
    }

    fun updateSearch(query: String) {
        _songState.update { it.copy(searchQuery = query) }
        loadSongs()
    }

    fun updateGenreFilter(genre: String?) {
        _songState.update { it.copy(genreFilter = genre) }
        loadSongs()
    }

    fun updateLanguageFilter(language: String?) {
        _songState.update { it.copy(languageFilter = language) }
        loadSongs()
    }

    fun selectSong(song: Song) {
        _songDetailState.value = SongDetailState(song = song)
    }

    fun toggleFavorite(songId: Int) {
        viewModelScope.launch {
            repository.toggleFavorite(songId)
        }
    }

    fun requestSong(payload: SongRequestPayload) {
        viewModelScope.launch {
            _requestState.update { it.copy(isSubmitting = true, error = null) }
            when (val result = repository.createRequest(payload)) {
                is Resource.Success -> {
                    _requestState.update {
                        it.copy(
                            isSubmitting = false,
                            requests = listOfNotNull(result.data) + it.requests,
                            error = null
                        )
                    }
                }
                is Resource.Error -> {
                    _requestState.update { it.copy(isSubmitting = false, error = result.message) }
                }
                else -> Unit
            }
        }
    }

    fun sendMessage(partnerId: Int, message: String) {
        viewModelScope.launch {
            when (val result = repository.sendMessage(partnerId, message)) {
                is Resource.Success -> Unit
                is Resource.Error -> _chatState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchConversations() {
        viewModelScope.launch {
            when (val result = repository.getChatConversations()) {
                is Resource.Success -> _chatState.update { it.copy(conversations = result.data ?: emptyList()) }
                is Resource.Error -> _chatState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchMessages(partnerId: Int) {
        viewModelScope.launch {
            when (val result = repository.getMessages(partnerId)) {
                is Resource.Success -> _chatState.update { it.copy(messages = result.data ?: emptyList()) }
                is Resource.Error -> _chatState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchPlaylists() {
        viewModelScope.launch {
            _playlistState.update { it.copy(isLoading = true) }
            when (val result = repository.getPlaylists()) {
                is Resource.Success -> _playlistState.update {
                    it.copy(playlists = result.data ?: emptyList(), isLoading = false, error = null)
                }
                is Resource.Error -> _playlistState.update { it.copy(isLoading = false, error = result.message) }
                else -> Unit
            }
        }
    }

    fun createPlaylist(request: PlaylistCreationRequest) {
        viewModelScope.launch {
            when (val result = repository.createPlaylist(request)) {
                is Resource.Success -> _playlistState.update {
                    it.copy(playlists = (result.data?.let { listOf(it) } ?: emptyList()) + it.playlists)
                }
                is Resource.Error -> _playlistState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchDonations() {
        viewModelScope.launch {
            when (val result = repository.getDonations()) {
                is Resource.Success -> _donationState.update { it.copy(donations = result.data ?: emptyList()) }
                is Resource.Error -> _donationState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchPaymentMethods() {
        viewModelScope.launch {
            when (val result = repository.getPaymentMethods()) {
                is Resource.Success -> _donationState.update { it.copy(paymentMethods = result.data ?: emptyList()) }
                is Resource.Error -> _donationState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun donate(payload: DonationRequestPayload) {
        viewModelScope.launch {
            _donationState.update { it.copy(isDonating = true, error = null) }
            when (val result = repository.createDonation(payload)) {
                is Resource.Success -> _donationState.update {
                    it.copy(
                        isDonating = false,
                        donations = (result.data?.let { listOf(it) } ?: emptyList()) + it.donations,
                        error = null
                    )
                }
                is Resource.Error -> _donationState.update { it.copy(isDonating = false, error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchRequests() {
        viewModelScope.launch {
            when (val result = repository.getRequests()) {
                is Resource.Success -> _requestState.update { it.copy(requests = result.data ?: emptyList()) }
                is Resource.Error -> _requestState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchPlayHistory() {
        viewModelScope.launch {
            _playbackState.update { it.copy(isLoading = true) }
            when (val result = repository.getPlayHistory(1, PAGE_SIZE)) {
                is Resource.Success -> _playbackState.update {
                    it.copy(history = result.data ?: emptyList(), isLoading = false, error = null)
                }
                is Resource.Error -> _playbackState.update { it.copy(isLoading = false, error = result.message) }
                else -> Unit
            }
        }
    }

    fun fetchLeaderboard(limit: Int = 5) {
        viewModelScope.launch {
            when (val result = repository.getLeaderboard(limit)) {
                is Resource.Success -> _playbackState.update { it.copy(leaderboard = result.data ?: emptyList()) }
                is Resource.Error -> _playbackState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun startPlayback(songId: Int) {
        viewModelScope.launch {
            repository.startPlayback(songId)
        }
    }

    fun completePlayback(historyId: Int, playedDuration: Int, score: Int) {
        viewModelScope.launch {
            repository.endPlayback(historyId, playedDuration, score)
        }
    }

    fun fetchScoreSummary() {
        viewModelScope.launch {
            when (val result = repository.getScoreSummary()) {
                is Resource.Success -> _playbackState.update { it.copy(summary = result.data) }
                is Resource.Error -> _playbackState.update { it.copy(error = result.message) }
                else -> Unit
            }
        }
    }

    fun uploadSong(
        title: String,
        artist: String,
        videoFile: File,
        thumbnail: File?,
        genre: String? = null,
        language: String? = null,
        lyrics: String? = null
    ) {
        viewModelScope.launch {
            _uploadState.update { it.copy(isUploading = true, error = null) }
            when (val result = repository.uploadSong(title, artist, videoFile, thumbnail, genre, language, lyrics)) {
                is Resource.Success -> _uploadState.update {
                    it.copy(
                        isUploading = false,
                        uploads = (result.data?.let { listOf(it) } ?: emptyList()) + it.uploads,
                        error = null
                    )
                }
                is Resource.Error -> _uploadState.update { it.copy(isUploading = false, error = result.message) }
                else -> Unit
            }
        }
    }

    class Factory(
        private val repository: KaraokeRepository,
        private val tokenStorage: TokenStorage,
        private val chatSocketManager: ChatSocketManager
    ) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(repository, tokenStorage, chatSocketManager) as T
            }
            throw IllegalArgumentException("Unknown viewmodel class ${modelClass.name}")
        }
    }
}
