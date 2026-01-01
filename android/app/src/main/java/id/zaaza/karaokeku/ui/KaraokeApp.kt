package id.zaaza.karaokeku.ui

import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.icons.Icons
import androidx.compose.material3.icons.filled.Chat
import androidx.compose.material3.icons.filled.Favorite
import androidx.compose.material3.icons.filled.Home
import androidx.compose.material3.icons.filled.LibraryMusic
import androidx.compose.material3.icons.filled.Person
import androidx.compose.material3.icons.filled.QueueMusic
import androidx.compose.material3.icons.filled.Upload
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import id.zaaza.karaokeku.ui.screens.AuthScreen
import id.zaaza.karaokeku.ui.screens.ChatScreen
import id.zaaza.karaokeku.ui.screens.DonationScreen
import id.zaaza.karaokeku.ui.screens.HomeScreen
import id.zaaza.karaokeku.ui.screens.PlaylistScreen
import id.zaaza.karaokeku.ui.screens.ProfileScreen
import id.zaaza.karaokeku.ui.screens.RequestScreen
import id.zaaza.karaokeku.ui.screens.SongDetailScreen
import id.zaaza.karaokeku.ui.screens.UploadScreen
import id.zaaza.karaokeku.ui.theme.KaraokeTheme
import id.zaaza.karaokeku.ui.viewmodel.MainViewModel

sealed class Screen(val route: String, val label: String, val icon: @Composable () -> Unit) {
    object Home : Screen("home", "Home", { Icon(Icons.Default.Home, contentDescription = null) })
    object Playlist : Screen("playlist", "Playlist", { Icon(Icons.Default.LibraryMusic, contentDescription = null) })
    object Chat : Screen("chat", "Chat", { Icon(Icons.Default.Chat, contentDescription = null) })
    object Donation : Screen("donation", "Donasi", { Icon(Icons.Default.Favorite, contentDescription = null) })
    object Request : Screen("request", "Request", { Icon(Icons.Default.QueueMusic, contentDescription = null) })
    object Upload : Screen("upload", "Upload", { Icon(Icons.Default.Upload, contentDescription = null) })
    object Profile : Screen("profile", "Profil", { Icon(Icons.Default.Person, contentDescription = null) })
    object SongDetail : Screen("songDetail", "Detail", { Icon(Icons.Default.Home, contentDescription = null) })
}

@Composable
fun KaraokeApp(viewModel: MainViewModel) {
    val authState by viewModel.authState.collectAsState()
    KaraokeTheme {
        if (authState.user == null) {
            AuthScreen(viewModel)
        } else {
            MainHost(viewModel, authState.user?.role == "admin")
        }
    }
}

@Composable
private fun MainHost(viewModel: MainViewModel, isAdmin: Boolean) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val bottomItems = listOf(Screen.Home, Screen.Playlist, Screen.Chat, Screen.Donation)

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("KaraokeKu", style = MaterialTheme.typography.titleLarge) },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Request.route) }) {
                        Screen.Request.icon()
                    }
                    if (isAdmin) {
                        IconButton(onClick = { navController.navigate(Screen.Upload.route) }) {
                            Screen.Upload.icon()
                        }
                    }
                    IconButton(onClick = { navController.navigate(Screen.Profile.route) }) {
                        Screen.Profile.icon()
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                bottomItems.forEach { screen ->
                    NavigationBarItem(
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                launchSingleTop = true
                            }
                        },
                        icon = screen.icon,
                        label = { Text(screen.label) }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel,
                    onSongSelect = {
                        viewModel.selectSong(it)
                        navController.navigate(Screen.SongDetail.route)
                    },
                    onPlay = { viewModel.startPlayback(it.id) },
                    onRequestSong = { navController.navigate(Screen.Request.route) },
                    onDonation = { navController.navigate(Screen.Donation.route) }
                )
            }
            composable(Screen.Playlist.route) {
                PlaylistScreen(viewModel)
            }
            composable(Screen.Chat.route) {
                ChatScreen(viewModel)
            }
            composable(Screen.Donation.route) {
                DonationScreen(viewModel)
            }
            composable(Screen.Request.route) {
                RequestScreen(viewModel)
            }
            composable(Screen.Upload.route) {
                UploadScreen(viewModel)
            }
            composable(Screen.Profile.route) {
                ProfileScreen(viewModel)
            }
            composable(Screen.SongDetail.route) {
                SongDetailScreen(viewModel)
            }
        }
    }
}
