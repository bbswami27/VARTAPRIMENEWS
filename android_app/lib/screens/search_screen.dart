import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/news_item.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/news_card_widget.dart';
import 'article_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<NewsItem> _searchResults = [];
  bool _isLoading = false;
  bool _hasSearched = false;

  Future<void> _performSearch(String query) async {
    final q = query.trim();
    if (q.isEmpty) return;

    setState(() {
      _isLoading = true;
      _hasSearched = true;
    });

    final results = await ApiService.fetchNews(search: q);

    if (mounted) {
      setState(() {
        _searchResults = results;
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          style: GoogleFonts.hind(color: Colors.white, fontSize: 16),
          decoration: InputDecoration(
            hintText: 'खबर, शहर या नेता खोजें...',
            hintStyle: GoogleFonts.hind(color: Colors.white70, fontSize: 15),
            border: InputBorder.none,
          ),
          onSubmitted: _performSearch,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _performSearch(_searchController.text),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.pressRed))
          : !_hasSearched
              ? Center(
                  child: Text(
                    'खोजने के लिए शब्द लिखें और सर्च दबाएं',
                    style: GoogleFonts.hind(fontSize: 15, color: AppTheme.inkMuted),
                  ),
                )
              : _searchResults.isEmpty
                  ? Center(
                      child: Text(
                        'कोई परिणाम नहीं मिला।',
                        style: GoogleFonts.hind(fontSize: 16, color: AppTheme.inkSoft),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final item = _searchResults[index];
                        return NewsCardWidget(
                          item: item,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ArticleDetailScreen(item: item),
                              ),
                            );
                          },
                        );
                      },
                    ),
    );
  }
}
