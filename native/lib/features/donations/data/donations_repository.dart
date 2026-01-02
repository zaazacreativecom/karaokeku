import '../../../core/network/api_client.dart';
import '../../../core/network/api_error.dart';
import '../models/donation.dart';
import '../models/payment_method.dart';

class DonationsRepository {
  final ApiClient _client;

  DonationsRepository(this._client);

  Future<List<PaymentMethod>> fetchPaymentMethods() async {
    final response = await _client.get('/payment-methods');
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => PaymentMethod.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Metode pembayaran tidak valid');
  }

  Future<List<Donation>> fetchMyDonations() async {
    final response = await _client.get('/donations/my');
    if (response.data is List) {
      return (response.data as List)
          .whereType<Map>()
          .map((item) => Donation.fromJson(item.cast<String, dynamic>()))
          .toList();
    }
    throw const ApiError('Donasi tidak valid');
  }

  Future<void> createDonation({
    required double amount,
    required String method,
    String? donorName,
    String? message,
    String? proofUrl,
  }) async {
    await _client.post(
      '/donations',
      data: {
        'amount': amount,
        'method': method,
        'donor_name': donorName,
        'message': message,
        'proof_url': proofUrl,
      },
    );
  }
}
