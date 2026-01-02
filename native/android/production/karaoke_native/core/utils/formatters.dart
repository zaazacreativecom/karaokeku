import 'package:intl/intl.dart';

class Formatters {
  static String duration(int seconds) {
    if (seconds < 0) return '0:00';
    final hours = seconds ~/ 3600;
    final minutes = (seconds % 3600) ~/ 60;
    final secs = seconds % 60;
    if (hours > 0) {
      return '${hours.toString()}:${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString()}:${secs.toString().padLeft(2, '0')}';
  }

  static String currency(num value) {
    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ');
    return formatter.format(value);
  }
}
