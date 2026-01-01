package id.zaaza.karaokeku.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.icons.Icons
import androidx.compose.material3.icons.filled.Favorite
import androidx.compose.material3.icons.filled.PlayArrow
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import id.zaaza.karaokeku.data.model.Song
import androidx.compose.material3.icons.Icons
import androidx.compose.material3.icons.filled.Favorite
import androidx.compose.material3.icons.filled.PlayArrow

@Composable
fun SongCard(
    song: Song,
    onSelect: (Song) -> Unit,
    onPlay: (Song) -> Unit,
    onFavorite: (Song) -> Unit
) {
    Card(
        modifier = Modifier
            .padding(vertical = 8.dp)
            .clickable { onSelect(song) },
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = song.thumbnailUrl,
                contentDescription = null,
                modifier = Modifier
                    .width(80.dp)
                    .height(80.dp)
                    .background(Color.Gray, RoundedCornerShape(12.dp))
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(song.title, fontWeight = FontWeight.Bold)
                Text(song.artist, style = MaterialTheme.typography.bodySmall)
                Text("${song.genre ?: "-"} • ${song.language ?: "-"}", style = MaterialTheme.typography.bodySmall)
            }
            IconButton(onClick = { onPlay(song) }) {
                Icon(Icons.Default.PlayArrow, contentDescription = "Putar")
            }
            IconButton(onClick = { onFavorite(song) }) {
                Icon(Icons.Default.Favorite, contentDescription = "Favorit")
            }
        }
    }
}
