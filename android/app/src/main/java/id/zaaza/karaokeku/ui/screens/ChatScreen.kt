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
import id.zaaza.karaokeku.data.model.ChatConversation
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun ChatScreen(viewModel: MainViewModel) {
    val state by viewModel.chatState.collectAsState()
    val message = remember { mutableStateOf("") }
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        Text("Chat", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(state.conversations) { conversation ->
                ConversationCard(conversation)
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = message.value,
            onValueChange = { message.value = it },
            label = { Text("Kirim pesan") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = {
            val partnerId = state.conversations.firstOrNull()?.partnerId ?: return@Button
            viewModel.sendMessage(partnerId, message.value)
            message.value = ""
        }, modifier = Modifier.fillMaxWidth()) {
            Text("Kirim")
        }
    }
}

@Composable
private fun ConversationCard(conversation: ChatConversation) {
    Column(modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 6.dp)) {
        Text(conversation.partnerName, style = MaterialTheme.typography.titleMedium)
        Text(conversation.lastMessage?.message ?: "Tidak ada pesan", style = MaterialTheme.typography.bodySmall)
    }
}
