package id.zaaza.karaokeku.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import id.zaaza.karaokeku.data.model.PlaylistDetails
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun PlaylistScreen(viewModel: MainViewModel) {
    val playlistState by viewModel.playlistState.collectAsState()
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        Text("Playlist Saya", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        LazyColumn {
            items(playlistState.playlists) { playlist ->
                PlaylistCard(playlist)
            }
        }
    }
}

@Composable
private fun PlaylistCard(playlist: PlaylistDetails) {
    Card(modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 6.dp)) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(playlist.name, style = MaterialTheme.typography.titleMedium)
            Text(playlist.description ?: "Tidak ada deskripsi", style = MaterialTheme.typography.bodySmall)
            Row(modifier = Modifier.fillMaxWidth()) {
                Text("Lagu: ${playlist.items?.size ?: 0}")
                Spacer(modifier = Modifier.width(8.dp))
            }
        }
    }
}
