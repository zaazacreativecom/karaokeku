package id.zaaza.karaokeku.ui.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import id.zaaza.karaokeku.R
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

@Composable
fun AuthScreen(viewModel: MainViewModel) {
    val authState = viewModel.authState.collectAsState().value
    val isLogin = remember { mutableStateOf(true) }
    val name = remember { mutableStateOf("") }
    val email = remember { mutableStateOf("") }
    val username = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val confirmPassword = remember { mutableStateOf("") }

    val context = LocalContext.current
    val googleSignInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken(context.getString(R.string.default_web_client_id))
        .requestEmail()
        .build()
    val googleSignInClient = GoogleSignIn.getClient(context, googleSignInOptions)
    val googleLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                account?.idToken?.let { viewModel.loginWithGoogle(it) }
            } catch (error: ApiException) {
                // ignore: rely on viewmodel error
            }
        }
    }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text(
                text = if (isLogin.value) "Selamat datang kembali" else "Buat akun baru",
                style = MaterialTheme.typography.headlineLarge
            )
            Spacer(modifier = Modifier.height(16.dp))
            if (!isLogin.value) {
                OutlinedTextField(
                    value = name.value,
                    onValueChange = { name.value = it },
                    label = { Text("Nama lengkap") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            OutlinedTextField(
                value = email.value,
                onValueChange = { email.value = it },
                label = { Text("Email / Username") },
                modifier = Modifier.fillMaxWidth()
            )
            if (!isLogin.value) {
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = username.value,
                    onValueChange = { username.value = it },
                    label = { Text("Username") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = password.value,
                onValueChange = { password.value = it },
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation()
            )
            if (!isLogin.value) {
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = confirmPassword.value,
                    onValueChange = { confirmPassword.value = it },
                    label = { Text("Konfirmasi password") },
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = PasswordVisualTransformation()
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    if (isLogin.value) {
                        viewModel.login(email.value, password.value)
                    } else {
                        viewModel.register(name.value, email.value, username.value, password.value, confirmPassword.value)
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                if (authState.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.height(24.dp))
                } else {
                    Text(if (isLogin.value) "Masuk" else "Daftar")
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            TextButton(onClick = { isLogin.value = !isLogin.value }) {
                Text(if (isLogin.value) "Belum punya akun? Daftar" else "Sudah punya akun? Masuk")
            }
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = { googleLauncher.launch(googleSignInClient.signInIntent) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Login dengan Google")
            }
            authState.error?.let { errorText ->
                Spacer(modifier = Modifier.height(12.dp))
                Text(text = errorText, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}
