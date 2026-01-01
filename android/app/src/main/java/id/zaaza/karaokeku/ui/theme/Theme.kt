package id.zaaza.karaokeku.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Purple40,
    secondary = Pink40,
    background = Background,
    surface = SurfaceColor,
    onSurface = OnSurfaceColor
)

private val DarkColors = darkColorScheme(
    primary = Purple80,
    secondary = Pink40,
    background = Color(0xFF0B0B0F),
    surface = Color(0xFF13111A),
    onSurface = Color(0xFFECE5FF)
)

@Composable
fun KaraokeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors
    MaterialTheme(
        colorScheme = colorScheme,
        typography = KaraokeTypography,
        content = content
    )
}
