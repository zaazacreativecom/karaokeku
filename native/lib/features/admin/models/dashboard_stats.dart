import '../../auth/models/user.dart';
import '../../songs/models/song.dart';

class DashboardStats {
  final int totalUsers;
  final int totalSongs;
  final int activeSongs;
  final int totalPlays;
  final int playsToday;
  final int pendingUploads;
  final List<Song> topSongs;
  final List<User> recentUsers;

  const DashboardStats({
    required this.totalUsers,
    required this.totalSongs,
    required this.activeSongs,
    required this.totalPlays,
    required this.playsToday,
    required this.pendingUploads,
    required this.topSongs,
    required this.recentUsers,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    final topSongsData = json['topSongs'];
    final recentUsersData = json['recentUsers'];

    return DashboardStats(
      totalUsers: _parseInt(json['totalUsers']),
      totalSongs: _parseInt(json['totalSongs']),
      activeSongs: _parseInt(json['activeSongs']),
      totalPlays: _parseInt(json['totalPlays']),
      playsToday: _parseInt(json['playsToday']),
      pendingUploads: _parseInt(json['pendingUploads']),
      topSongs: topSongsData is List
          ? topSongsData.whereType<Map>().map((item) => Song.fromJson(item.cast<String, dynamic>())).toList()
          : [],
      recentUsers: recentUsersData is List
          ? recentUsersData.whereType<Map>().map((item) => User.fromJson(item.cast<String, dynamic>())).toList()
          : [],
    );
  }

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    return int.tryParse(value.toString()) ?? 0;
  }
}
