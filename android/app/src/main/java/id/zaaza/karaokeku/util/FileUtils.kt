package id.zaaza.karaokeku.util

import android.content.Context
import android.net.Uri
import java.io.File

object FileUtils {
    fun createFileFromUri(context: Context, uri: Uri, prefix: String): File? {
        return try {
            val file = File(context.cacheDir, "${prefix}_${System.currentTimeMillis()}")
            context.contentResolver.openInputStream(uri)?.use { input ->
                file.outputStream().use { output -> input.copyTo(output) }
            }
            file
        } catch (exception: Exception) {
            null
        }
    }
}
