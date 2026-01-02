import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../admin/ui/admin_panel_screen.dart';
import '../../donations/ui/donations_screen.dart';
import '../../history/ui/history_screen.dart';
import '../../requests/ui/request_song_screen.dart';
import '../../requests/ui/request_status_screen.dart';
import '../../uploads/ui/uploads_list_screen.dart';
import '../providers/auth_providers.dart';
import 'profile_screen.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final isAdmin = user?.role == 'admin';

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.person_outline),
              title: Text(user?.name ?? 'User'),
              subtitle: Text(user?.email ?? ''),
              onTap: () => _open(context, const ProfileScreen()),
            ),
          ),
          const SizedBox(height: 12),
          _SettingsTile(
            icon: Icons.history,
            title: 'Riwayat & Skor',
            onTap: () => _open(context, const HistoryScreen()),
          ),
          _SettingsTile(
            icon: Icons.favorite_outline,
            title: 'Donasi',
            onTap: () => _open(context, const DonationsScreen()),
          ),
          _SettingsTile(
            icon: Icons.cloud_upload_outlined,
            title: 'Upload Lagu',
            onTap: () => _open(context, const UploadsListScreen()),
          ),
          _SettingsTile(
            icon: Icons.queue_music,
            title: 'Request Lagu Baru',
            onTap: () => _open(context, const RequestSongScreen()),
          ),
          _SettingsTile(
            icon: Icons.pending_actions,
            title: 'Status Request',
            onTap: () => _open(context, const RequestStatusScreen()),
          ),
          if (isAdmin)
            _SettingsTile(
              icon: Icons.admin_panel_settings_outlined,
              title: 'Admin Panel',
              onTap: () => _open(context, const AdminPanelScreen()),
            ),
          const Divider(height: 32),
          _SettingsTile(
            icon: Icons.logout,
            title: 'Logout',
            onTap: () async {
              await ref.read(authControllerProvider.notifier).signOut();
            },
          ),
        ],
      ),
    );
  }

  void _open(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _SettingsTile({required this.icon, required this.title, required this.onTap});

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
