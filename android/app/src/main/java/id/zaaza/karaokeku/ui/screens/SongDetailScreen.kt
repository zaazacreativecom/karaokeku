package id.zaaza.karaokeku.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.SimpleExoPlayer
import com.google.android.exoplayer2.ui.PlayerView
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun SongDetailScreen(viewModel: MainViewModel) {
    val detailState by viewModel.songDetailState.collectAsState()
    val song = detailState.song ?: return
    val context = LocalContext.current
    val player = remember { SimpleExoPlayer.Builder(context).build() }
    val videoUri = song.videoUrlInstrumental ?: song.videoUrlFull

    DisposableEffect(videoUri) {
        videoUri?.let { uri ->
            player.setMediaItem(MediaItem.fromUri(uri))
            player.prepare()
            player.playWhenReady = false
        }
        onDispose {
            player.release()
        }
    }

    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        AndroidView(factory = {
            PlayerView(it).apply {
                this.player = player
            }
        }, modifier = Modifier
            .fillMaxWidth()
            .height(220.dp))
        Spacer(modifier = Modifier.height(16.dp))
        Text(song.title, style = MaterialTheme.typography.headlineMedium)
        Text(song.artist, style = MaterialTheme.typography.bodyLarge)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Genre: ${song.genre ?: "-"}")
        Text("Bahasa: ${song.language ?: "-"}")
        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            Button(onClick = { viewModel.startPlayback(song.id) }) {
                Text("Mulai Karaoke")
            }
            Spacer(modifier = Modifier.width(12.dp))
            Button(onClick = { viewModel.toggleFavorite(song.id) }) {
                Text("Favorit")
            }
        }
    }
}
