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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import id.zaaza.karaokeku.data.model.DonationRequestPayload
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun DonationScreen(viewModel: MainViewModel) {
    val state by viewModel.donationState.collectAsState()
    val amount = remember { mutableStateOf(0.0) }
    val selectedMethod = remember { mutableStateOf<String?>(null) }
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        Text("Donasi", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(12.dp))
        LazyColumn {
            items(state.paymentMethods) { method ->
                val isSelected = selectedMethod.value == method.type
                DonationMethodRow(method.type, method.name, isSelected) {
                    selectedMethod.value = method.type
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = if (amount.value == 0.0) "" else amount.value.toString(),
            onValueChange = { value -> amount.value = value.toDoubleOrNull() ?: 0.0 },
            label = { Text("Jumlah (IDR)") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = {
            val method = selectedMethod.value ?: return@Button
            viewModel.donate(
                DonationRequestPayload(
                    amount = amount.value,
                    method = method
                )
            )
        }, modifier = Modifier.fillMaxWidth()) {
            Text("Kirim Donasi")
        }
    }
}

@Composable
private fun DonationMethodRow(type: String, label: String, isSelected: Boolean, onSelect: () -> Unit) {
    Row(modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 4.dp)) {
        RadioButton(selected = isSelected, onClick = onSelect)
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "$label ($type)")
    }
}
