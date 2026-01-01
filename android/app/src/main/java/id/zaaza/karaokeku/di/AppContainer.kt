package id.zaaza.karaokeku.di

import android.content.Context
import id.zaaza.karaokeku.data.network.NetworkModule
import id.zaaza.karaokeku.data.prefs.TokenStorage
import id.zaaza.karaokeku.data.repository.KaraokeRepository
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel
import id.zaaza.karaokeku.util.ChatSocketManager

class AppContainer(context: Context) {
    private val tokenStorage = TokenStorage(context)
    private val okHttpClient = NetworkModule.provideOkHttpClient(tokenStorage)
    private val retrofit = NetworkModule.provideRetrofit(okHttpClient)
    private val apiService = NetworkModule.provideApiService(retrofit)
    private val repository = KaraokeRepository(apiService)
    private val socketManager = ChatSocketManager(tokenStorage)

    fun provideViewModelFactory(): MainViewModel.Factory {
        return MainViewModel.Factory(repository, tokenStorage, socketManager)
    }
}
