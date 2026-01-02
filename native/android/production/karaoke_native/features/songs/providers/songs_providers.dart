import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../data/songs_repository.dart';
import '../models/song.dart';

final songsRepositoryProvider = Provider<SongsRepository>(
  (ref) => SongsRepository(ref.read(apiClientProvider), cache: ref.read(localCacheProvider)),
);

final genresProvider = FutureProvider<List<String>>(
  (ref) => ref.read(songsRepositoryProvider).fetchGenres(),
);

final languagesProvider = FutureProvider<List<String>>(
  (ref) => ref.read(songsRepositoryProvider).fetchLanguages(),
);

final topSongsProvider = FutureProvider<List<Song>>(
  (ref) => ref.read(songsRepositoryProvider).fetchTopSongs(limit: 10),
);

class SongsListState {
  static const _sentinel = Object();
  final List<Song> songs;
  final bool isLoading;
  final String? errorMessage;
  final int page;
  final bool hasNext;
  final String search;
  final String? genre;
  final String? language;
  final String sortBy;
  final String sortOrder;

  const SongsListState({
    required this.songs,
    required this.isLoading,
    required this.page,
    required this.hasNext,
    required this.search,
    required this.genre,
    required this.language,
    required this.sortBy,
    required this.sortOrder,
    this.errorMessage,
  });

  factory SongsListState.initial() => const SongsListState(
        songs: [],
        isLoading: false,
        page: 1,
        hasNext: true,
        search: '',
        genre: null,
        language: null,
        sortBy: 'created_at',
        sortOrder: 'ASC',
      );

  SongsListState copyWith({
    List<Song>? songs,
    bool? isLoading,
    String? errorMessage,
    int? page,
    bool? hasNext,
    String? search,
    Object? genre = _sentinel,
    Object? language = _sentinel,
    String? sortBy,
    String? sortOrder,
  }) {
    return SongsListState(
      songs: songs ?? this.songs,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      page: page ?? this.page,
      hasNext: hasNext ?? this.hasNext,
      search: search ?? this.search,
      genre: genre == _sentinel ? this.genre : genre as String?,
      language: language == _sentinel ? this.language : language as String?,
      sortBy: sortBy ?? this.sortBy,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }
}

final songsListProvider = StateNotifierProvider<SongsListController, SongsListState>((ref) {
  return SongsListController(ref.read(songsRepositoryProvider));
});

class SongsListController extends StateNotifier<SongsListState> {
  final SongsRepository _repository;

  SongsListController(this._repository) : super(SongsListState.initial()) {
    loadSongs(reset: true);
  }

  Future<void> loadSongs({bool reset = false}) async {
    if (state.isLoading) return;
    if (!state.hasNext && !reset) return;

    final nextPage = reset ? 1 : state.page;
    state = state.copyWith(isLoading: true, errorMessage: null, page: nextPage);
    try {
      final result = await _repository.fetchSongs(
        page: nextPage,
        search: state.search,
        genre: state.genre,
        language: state.language,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      );
      final meta = result.meta ?? {};
      final hasNext = meta['hasNextPage'] == true;
      final mergedSongs = reset ? result.songs : [...state.songs, ...result.songs];
      state = state.copyWith(
        songs: mergedSongs,
        isLoading: false,
        page: nextPage + 1,
        hasNext: hasNext,
      );
    } catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.toString());
    }
  }

  Future<void> applyFilters({String? search, String? genre, String? language, String? sortBy, String? sortOrder}) async {
    state = state.copyWith(
      search: search ?? state.search,
      genre: genre,
      language: language,
      sortBy: sortBy ?? state.sortBy,
      sortOrder: sortOrder ?? state.sortOrder,
      page: 1,
      hasNext: true,
    );
    await loadSongs(reset: true);
  }
}
