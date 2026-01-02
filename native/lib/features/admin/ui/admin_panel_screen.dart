import 'package:flutter/material.dart';

import 'admin_dashboard_screen.dart';
import 'manage_songs_screen.dart';
import 'manage_users_screen.dart';
import 'payment_methods_screen.dart';
import 'review_donations_screen.dart';
import 'review_requests_screen.dart';
import 'review_uploads_screen.dart';
import 'system_settings_screen.dart';

class AdminPanelScreen extends StatelessWidget {
  const AdminPanelScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Panel')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _AdminTile(
            title: 'Dashboard',
            icon: Icons.dashboard_outlined,
            onTap: () => _open(context, const AdminDashboardScreen()),
          ),
          _AdminTile(
            title: 'Manage Users',
            icon: Icons.people_outline,
            onTap: () => _open(context, const ManageUsersScreen()),
          ),
          _AdminTile(
            title: 'Manage Songs',
            icon: Icons.library_music_outlined,
            onTap: () => _open(context, const ManageSongsScreen()),
          ),
          _AdminTile(
            title: 'Review Uploads',
            icon: Icons.upload_file_outlined,
            onTap: () => _open(context, const ReviewUploadsScreen()),
          ),
          _AdminTile(
            title: 'Review Requests',
            icon: Icons.playlist_add_check,
            onTap: () => _open(context, const ReviewRequestsScreen()),
          ),
          _AdminTile(
            title: 'Review Donations',
            icon: Icons.volunteer_activism_outlined,
            onTap: () => _open(context, const ReviewDonationsScreen()),
          ),
          _AdminTile(
            title: 'Payment Methods',
            icon: Icons.qr_code_2_outlined,
            onTap: () => _open(context, const PaymentMethodsScreen()),
          ),
          _AdminTile(
            title: 'System Settings',
            icon: Icons.settings_applications_outlined,
            onTap: () => _open(context, const SystemSettingsScreen()),
          ),
        ],
      ),
    );
  }

  void _open(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }
}

class _AdminTile extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _AdminTile({required this.title, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
