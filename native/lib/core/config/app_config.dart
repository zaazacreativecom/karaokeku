import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl => _get('API_BASE_URL', fallback: 'http://localhost:5000/api');
  static String get socketUrl => _get('SOCKET_URL', fallback: 'http://localhost:5000');

  static FirebaseOptions get firebaseOptions {
    final apiKey = _require('FIREBASE_API_KEY');
    final projectId = _require('FIREBASE_PROJECT_ID');
    final messagingSenderId = _require('FIREBASE_MESSAGING_SENDER_ID');
    final storageBucket = _get('FIREBASE_STORAGE_BUCKET');
    final appId = _platformAppId();

    return FirebaseOptions(
      apiKey: apiKey,
      appId: appId,
      messagingSenderId: messagingSenderId,
      projectId: projectId,
      storageBucket: storageBucket.isEmpty ? null : storageBucket,
      iosBundleId: _iosBundleId(),
    );
  }

  static String? googleIosClientId() => _nullable('GOOGLE_IOS_CLIENT_ID');
  static String? googleWebClientId() => _nullable('GOOGLE_WEB_CLIENT_ID');

  static String _platformAppId() {
    if (kIsWeb) {
      return _require('FIREBASE_APP_ID');
    }
    if (Platform.isAndroid) {
      return _firstNonEmpty(['FIREBASE_ANDROID_APP_ID', 'FIREBASE_APP_ID']);
    }
    if (Platform.isIOS) {
      return _firstNonEmpty(['FIREBASE_IOS_APP_ID', 'FIREBASE_APP_ID']);
    }
    if (Platform.isMacOS) {
      return _firstNonEmpty(['FIREBASE_MACOS_APP_ID', 'FIREBASE_APP_ID']);
    }
    if (Platform.isWindows) {
      return _firstNonEmpty(['FIREBASE_WINDOWS_APP_ID', 'FIREBASE_APP_ID']);
    }
    if (Platform.isLinux) {
      return _firstNonEmpty(['FIREBASE_LINUX_APP_ID', 'FIREBASE_APP_ID']);
    }

    return _require('FIREBASE_APP_ID');
  }

  static String? _iosBundleId() {
    if (kIsWeb) return null;
    if (Platform.isIOS || Platform.isMacOS) {
      return _nullable('FIREBASE_IOS_BUNDLE_ID');
    }
    return null;
  }

  static String _firstNonEmpty(List<String> keys) {
    for (final key in keys) {
      final value = _get(key);
      if (value.isNotEmpty) return value;
    }
    return _require(keys.first);
  }

  static String _require(String key) {
    final value = dotenv.env[key];
    if (value == null || value.trim().isEmpty) {
      throw StateError('Missing required env: $key');
    }
    return value.trim();
  }

  static String _get(String key, {String fallback = ''}) {
    final value = dotenv.env[key];
    if (value == null || value.trim().isEmpty) {
      return fallback;
    }
    return value.trim();
  }

  static String? _nullable(String key) {
    final value = dotenv.env[key];
    if (value == null || value.trim().isEmpty) {
      return null;
    }
    return value.trim();
  }
}
