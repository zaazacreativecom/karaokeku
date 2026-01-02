class Validators {
  static String? required(String? value, {String message = 'Wajib diisi'}) {
    if (value == null || value.trim().isEmpty) return message;
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email wajib diisi';
    final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!emailRegex.hasMatch(value.trim())) return 'Format email tidak valid';
    return null;
  }

  static String? minLength(String? value, int length, {String? message}) {
    if (value == null || value.trim().length < length) {
      return message ?? 'Minimal $length karakter';
    }
    return null;
  }
}
