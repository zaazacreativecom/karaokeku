import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../network/api_client.dart';
import '../services/connectivity_service.dart';
import '../services/offline_queue_service.dart';
import '../storage/local_cache.dart';
import '../storage/secure_storage_service.dart';

final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => const SecureStorageService(FlutterSecureStorage()),
);

final localCacheProvider = Provider<LocalCache>((ref) => LocalCache());

final connectivityProvider = Provider<ConnectivityService>((ref) => ConnectivityService());

final offlineQueueProvider = Provider<OfflineQueueService>(
  (ref) => OfflineQueueService(ref.read(localCacheProvider)),
);

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(secureStorage: ref.read(secureStorageProvider)),
);
