import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity _connectivity;

  ConnectivityService({Connectivity? connectivity})
      : _connectivity = connectivity ?? Connectivity();

  Stream<bool> get onStatusChange => _connectivity.onConnectivityChanged
      .map((result) => _hasConnectivity(result))
      .distinct();

  Future<bool> isOnline() async {
    final result = await _connectivity.checkConnectivity();
    return _hasConnectivity(result);
  }

  bool _hasConnectivity(dynamic result) {
    if (result is ConnectivityResult) {
      return result != ConnectivityResult.none;
    }
    if (result is List<ConnectivityResult>) {
      return result.any((item) => item != ConnectivityResult.none);
    }
    return false;
  }
}
