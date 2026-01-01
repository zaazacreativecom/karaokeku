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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import id.zaaza.karaokeku.data.model.Song
import id.zaaza.karaokeku.ui.components.SongCard
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun HomeScreen(
    viewModel: MainViewModel,
    onSongSelect: (Song) -> Unit,
    onPlay: (Song) -> Unit,
    onRequestSong: () -> Unit,
    onDonation: () -> Unit
) {
    val songState by viewModel.songState.collectAsState()
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        OutlinedTextField(
            value = songState.searchQuery,
            onValueChange = { viewModel.updateSearch(it) },
            label = { Text("Cari lagu") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            songState.genres.take(4).forEach { genre ->
                FilterChip(
                    selected = songState.genreFilter == genre,
                    onClick = {
                        viewModel.updateGenreFilter(if (songState.genreFilter == genre) null else genre)
                    },
                    label = { Text(genre) }
                )
                Spacer(modifier = Modifier.width(4.dp))
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            songState.languages.take(4).forEach { language ->
                FilterChip(
                    selected = songState.languageFilter == language,
                    onClick = {
                        viewModel.updateLanguageFilter(if (songState.languageFilter == language) null else language)
                    },
                    label = { Text(language) }
                )
                Spacer(modifier = Modifier.width(4.dp))
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        if (songState.isLoading) {
            CircularProgressIndicator()
        } else if (songState.songs.isEmpty()) {
            Text("Tidak ada lagu", style = MaterialTheme.typography.bodyLarge)
        } else {
            LazyColumn {
                items(songState.songs) { song ->
                    SongCard(song, onSelect = onSongSelect, onPlay = onPlay, onFavorite = { viewModel.toggleFavorite(song.id) })
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            TextButton(onClick = onRequestSong) {
                Text("Request Lagu")
            }
            Spacer(modifier = Modifier.width(12.dp))
            TextButton(onClick = onDonation) {
                Text("Donasi")
            }
        }
    }
}
