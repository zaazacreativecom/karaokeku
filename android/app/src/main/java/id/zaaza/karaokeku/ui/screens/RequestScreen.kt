package id.zaaza.karaokeku.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import id.zaaza.karaokeku.data.model.SongRequestPayload
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun RequestScreen(viewModel: MainViewModel) {
    val state by viewModel.requestState.collectAsState()
    val title = remember { mutableStateOf("") }
    val artist = remember { mutableStateOf("") }
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        Text("Request Lagu", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = title.value,
            onValueChange = { title.value = it },
            label = { Text("Judul") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = artist.value,
            onValueChange = { artist.value = it },
            label = { Text("Artis") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(12.dp))
        Button(onClick = {
            viewModel.requestSong(SongRequestPayload(title = title.value, artist = artist.value))
        }, modifier = Modifier.fillMaxWidth()) {
            Text("Kirim Request")
        }
        Spacer(modifier = Modifier.height(16.dp))
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(state.requests) { request ->
                Text("${request.title} • ${request.artist} (${request.status})")
            }
        }
    }
}
