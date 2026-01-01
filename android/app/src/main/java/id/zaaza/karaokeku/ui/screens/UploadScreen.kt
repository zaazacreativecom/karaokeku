package id.zaaza.karaokeku.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel
import id.zaaza.karaokeku.util.FileUtils

@Composable
fun UploadScreen(viewModel: MainViewModel) {
    val state by viewModel.uploadState.collectAsState()
    val context = LocalContext.current
    val title = remember { mutableStateOf("") }
    val artist = remember { mutableStateOf("") }
    val genre = remember { mutableStateOf("") }
    val language = remember { mutableStateOf("") }
    val lyrics = remember { mutableStateOf("") }
    val videoUri = remember { mutableStateOf<Uri?>(null) }
    val thumbnailUri = remember { mutableStateOf<Uri?>(null) }

    val videoLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        videoUri.value = uri
    }
    val thumbnailLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        thumbnailUri.value = uri
    }

    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        Text("Upload Lagu/Video", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = title.value, onValueChange = { title.value = it }, label = { Text("Judul") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(value = artist.value, onValueChange = { artist.value = it }, label = { Text("Artis") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(value = genre.value, onValueChange = { genre.value = it }, label = { Text("Genre") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(value = language.value, onValueChange = { language.value = it }, label = { Text("Bahasa") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(value = lyrics.value, onValueChange = { lyrics.value = it }, label = { Text("Lirik (JSON) opsional") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(12.dp))
        Button(onClick = { videoLauncher.launch(arrayOf("video/*")) }, modifier = Modifier.fillMaxWidth()) {
            Text(if (videoUri.value == null) "Pilih file video" else "Video siap")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { thumbnailLauncher.launch(arrayOf("image/*")) }, modifier = Modifier.fillMaxWidth()) {
            Text(if (thumbnailUri.value == null) "Pilih thumbnail" else "Thumbnail siap")
        }
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = {
            val videoFile = videoUri.value?.let { FileUtils.createFileFromUri(context, it, "video") }
            val thumbFile = thumbnailUri.value?.let { FileUtils.createFileFromUri(context, it, "thumb") }
            if (videoFile != null) {
                viewModel.uploadSong(
                    title = title.value,
                    artist = artist.value,
                    videoFile = videoFile,
                    thumbnail = thumbFile,
                    genre = genre.value.ifBlank { null },
                    language = language.value.ifBlank { null },
                    lyrics = lyrics.value.ifBlank { null }
                )
            }
        }, modifier = Modifier.fillMaxWidth()) {
            if (state.isUploading) {
                CircularProgressIndicator()
            } else {
                Text("Unggah")
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text("Riwayat Upload", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(8.dp))
        Text("(${state.uploads.size} upload tersimpan)")
    }
}
