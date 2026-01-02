class ApiError implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  const ApiError(this.message, {this.statusCode, this.data});

  @override
  String toString() => 'ApiError(statusCode: $statusCode, message: $message)';
}
