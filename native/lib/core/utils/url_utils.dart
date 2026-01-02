import '../config/app_config.dart';

class UrlUtils {
  static String? resolveMediaUrl(String? url) {
    if (url == null || url.trim().isEmpty) return null;
    final raw = url.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return _normalizeUrl(raw);
    }
    final base = AppConfig.apiBaseUrl;
    final root = base.replaceAll(RegExp(r'/api/?$'), '');
    final joined = '$root${raw.startsWith('/') ? '' : '/'}$raw';
    return _normalizeUrl(joined);
  }

  static String _normalizeUrl(String url) {
    try {
      final uri = Uri.parse(url);
      final hasFragment = uri.fragment.isNotEmpty;
      final path = hasFragment ? '${uri.path}#${uri.fragment}' : uri.path;
      return uri.replace(path: path, fragment: '').toString();
    } catch (_) {
      return url.replaceAll('#', '%23').replaceAll(' ', '%20');
    }
  }
}
