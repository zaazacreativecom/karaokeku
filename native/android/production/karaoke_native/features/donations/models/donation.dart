import 'package:equatable/equatable.dart';

class Donation extends Equatable {
  final int id;
  final double amount;
  final String method;
  final String? proofUrl;
  final String status;
  final String? donorName;
  final String? message;
  final String? adminNotes;

  const Donation({
    required this.id,
    required this.amount,
    required this.method,
    this.proofUrl,
    required this.status,
    this.donorName,
    this.message,
    this.adminNotes,
  });

  factory Donation.fromJson(Map<String, dynamic> json) {
    return Donation(
      id: _parseInt(json['id']),
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
      method: json['method']?.toString() ?? 'other',
      proofUrl: json['proof_url']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      donorName: json['donor_name']?.toString(),
      message: json['message']?.toString(),
      adminNotes: json['admin_notes']?.toString(),
    );
  }

  @override
  List<Object?> get props => [id, amount, method, proofUrl, status, donorName, message, adminNotes];

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
