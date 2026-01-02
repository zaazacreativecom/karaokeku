import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/secure_storage_service.dart';
import 'api_error.dart';
import 'api_response.dart';

class ApiClient {
  final Dio _dio;
  final SecureStorageService _secureStorage;

  ApiClient({Dio? dio, required SecureStorageService secureStorage})
      : _dio = dio ?? Dio(),
        _secureStorage = secureStorage {
    _dio.options = BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _secureStorage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          handler.next(error);
        },
      ),
    );
  }

  Future<ApiResponse> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse(response);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<ApiResponse> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse(response);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<ApiResponse> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse(response);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  Future<ApiResponse> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return _parseResponse(response);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  ApiResponse _parseResponse(Response response) {
    if (response.data is Map<String, dynamic>) {
      final parsed = ApiResponse.fromJson(response.data as Map<String, dynamic>);
      if (!parsed.success) {
        throw ApiError(parsed.message.isEmpty ? 'Request gagal' : parsed.message,
            statusCode: response.statusCode, data: parsed.data);
      }
      return parsed;
    }
    return ApiResponse(
      success: true,
      message: '',
      data: response.data,
    );
  }

  ApiError _mapError(DioException error) {
    final response = error.response;
    if (response?.data is Map<String, dynamic>) {
      final map = response?.data as Map<String, dynamic>;
      final message = map['message']?.toString() ?? error.message ?? 'Request failed';
      final statusCode = response?.statusCode;
      return ApiError(message, statusCode: statusCode, data: map);
    }
    return ApiError(error.message ?? 'Request failed', statusCode: response?.statusCode);
  }
}
