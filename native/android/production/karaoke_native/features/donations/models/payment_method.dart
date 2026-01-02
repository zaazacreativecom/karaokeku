import 'package:equatable/equatable.dart';

class PaymentMethod extends Equatable {
  final int id;
  final String type;
  final String name;
  final String? icon;
  final String? accountNumber;
  final String? accountName;
  final String? qrCodeUrl;
  final bool isActive;

  const PaymentMethod({
    required this.id,
    required this.type,
    required this.name,
    this.icon,
    this.accountNumber,
    this.accountName,
    this.qrCodeUrl,
    required this.isActive,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: _parseInt(json['id']),
      type: json['type']?.toString() ?? 'other',
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString(),
      accountNumber: json['account_number']?.toString(),
      accountName: json['account_name']?.toString(),
      qrCodeUrl: json['qr_code_url']?.toString(),
      isActive: json['is_active'] == true,
    );
  }

  @override
  List<Object?> get props => [id, type, name, icon, accountNumber, accountName, qrCodeUrl, isActive];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
