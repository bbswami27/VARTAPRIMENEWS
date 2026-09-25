import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/news_item.dart';
import '../services/storage_service.dart';
import '../theme/app_theme.dart';
import '../widgets/news_card_widget.dart';
import 'article_detail_screen.dart';

class BookmarksScreen extends StatefulWidget {
  const BookmarksScreen({super.key});

  @override
  State<BookmarksScreen> createState() => _BookmarksScreenState();
}

class _BookmarksScreenState extends State<BookmarksScreen> {
  List<NewsItem> _bookmarks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
  }

  Future<void> _loadBookmarks() async {
    setState(() => _isLoading = true);
    final list = await StorageService.getBookmarks();
    if (mounted) {
      setState(() {
        _bookmarks = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'सहेजे गए समाचार (Bookmarks)',
          style: GoogleFonts.notoSerifDevanagari(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.pressRed))
          : _bookmarks.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.bookmark_border, size: 64, color: AppTheme.inkMuted),
                      const SizedBox(height: 16),
                      Text(
                        'कोई सहेजा गया समाचार नहीं है',
                        style: GoogleFonts.hind(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.inkSoft,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'किसी भी खबर को पढ़ने के बाद बुकमार्क आइकॉन दबाकर सहेजें।',
                        style: GoogleFonts.hind(
                          fontSize: 13,
                          color: AppTheme.inkMuted,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _bookmarks.length,
                  itemBuilder: (context, index) {
                    final item = _bookmarks[index];
                    return NewsCardWidget(
                      item: item,
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ArticleDetailScreen(item: item),
                          ),
                        );
                        _loadBookmarks();
                      },
                    );
                  },
                ),
    );
  }
}
