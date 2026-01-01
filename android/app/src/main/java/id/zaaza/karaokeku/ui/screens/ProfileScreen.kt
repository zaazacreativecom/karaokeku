package id.zaaza.karaokeku.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun ProfileScreen(viewModel: MainViewModel) {
    val authState by viewModel.authState.collectAsState()
    val playback by viewModel.playbackState.collectAsState()
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        val user = authState.user
        Text("Profil", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        Text("Nama: ${user?.name ?: "-"}")
        Text("Email: ${user?.email ?: "-"}")
        Text("Skor total: ${user?.totalScore ?: 0}")
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { viewModel.logout() }, modifier = Modifier.fillMaxWidth()) {
            Text("Keluar")
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text("Riwayat Skor", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        LazyColumn {
            items(playback.history) { item ->
                Text("${item.songTitle} • ${item.score} pts")
            }
        }
    }
}
