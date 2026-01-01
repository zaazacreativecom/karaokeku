package id.zaaza.karaokeku

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import id.zaaza.karaokeku.di.AppContainer
import id.zaaza.karaokeku.ui.KaraokeApp
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    private val container by lazy { AppContainer(this) }
    private val viewModel: MainViewModel by viewModels { container.provideViewModelFactory() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KaraokeApp(viewModel = viewModel)
        }
    }
}
