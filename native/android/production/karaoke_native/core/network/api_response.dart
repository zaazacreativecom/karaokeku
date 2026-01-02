class ApiResponse {
  final bool success;
  final String message;
  final dynamic data;
  final Map<String, dynamic>? meta;

  const ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.meta,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    return ApiResponse(
      success: json['success'] == true,
      message: (json['message'] ?? '').toString(),
      data: json['data'],
      meta: json['meta'] is Map<String, dynamic> ? json['meta'] as Map<String, dynamic> : null,
    );
  }

  T dataAs<T>() {
    if (data == null) {
      throw StateError('Response data is null');
    }
    return data as T;
  }
}
