import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/news_item.dart';
import '../services/storage_service.dart';
import '../theme/app_theme.dart';

class ArticleDetailScreen extends StatefulWidget {
  final NewsItem item;

  const ArticleDetailScreen({super.key, required this.item});

  @override
  State<ArticleDetailScreen> createState() => _ArticleDetailScreenState();
}

class _ArticleDetailScreenState extends State<ArticleDetailScreen> {
  bool _isBookmarked = false;
  double _fontScale = 1.0;

  @override
  void initState() {
    super.initState();
    _checkBookmarkStatus();
    _loadFontScale();
  }

  Future<void> _checkBookmarkStatus() async {
    final status = await StorageService.isBookmarked(widget.item.id);
    if (mounted) setState(() => _isBookmarked = status);
  }

  Future<void> _loadFontScale() async {
    final scale = await StorageService.getFontScale();
    if (mounted) setState(() => _fontScale = scale);
  }

  Future<void> _toggleBookmark() async {
    final added = await StorageService.toggleBookmark(widget.item);
    if (mounted) {
      setState(() => _isBookmarked = added);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            added ? 'समाचार सहेजा गया (Saved to Bookmarks)' : 'समाचार हटाया गया (Removed from Bookmarks)',
            style: GoogleFonts.hind(),
          ),
          backgroundColor: added ? AppTheme.green : AppTheme.pressRed,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _shareArticle() {
    final text = '${widget.item.title}\n\nपूरी खबर पढ़ें वार्ताप्राइम न्यूज़ ऐप पर: ${widget.item.link.isNotEmpty ? widget.item.link : "https://vartaprime-news-1.onrender.com"}';
    Share.share(text, subject: widget.item.title);
  }

  void _changeFontSize(double delta) {
    setState(() {
      _fontScale = (_fontScale + delta).clamp(0.85, 1.45);
    });
    StorageService.setFontScale(_fontScale);
  }

  Future<void> _openSourceUrl() async {
    if (widget.item.link.isNotEmpty) {
      final uri = Uri.parse(widget.item.link);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'वार्ताप्राइम न्यूज़',
          style: GoogleFonts.notoSerifDevanagari(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          // Font size buttons
          IconButton(
            icon: const Icon(Icons.text_fields),
            tooltip: 'फॉन्ट साइज़ बदलें',
            onPressed: () {
              showModalBottomSheet(
                context: context,
                builder: (context) => Container(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton.icon(
                        onPressed: () => _changeFontSize(-0.1),
                        icon: const Icon(Icons.remove),
                        label: const Text('छोटा (A-)'),
                      ),
                      ElevatedButton.icon(
                        onPressed: () => _changeFontSize(0.1),
                        icon: const Icon(Icons.add),
                        label: const Text('बड़ा (A+)'),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          // Bookmark button
          IconButton(
            icon: Icon(_isBookmarked ? Icons.bookmark : Icons.bookmark_border),
            tooltip: 'सहेजें',
            onPressed: _toggleBookmark,
          ),
          // Share button
          IconButton(
            icon: const Icon(Icons.share),
            tooltip: 'शेयर करें',
            onPressed: _shareArticle,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Photo
            if (widget.item.imageurl.isNotEmpty)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: widget.item.imageurl,
                  fit: BoxFit.cover,
                  errorWidget: (context, url, error) => const SizedBox.shrink(),
                ),
              ),
            // Header Content
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & District Badges
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.pressRed,
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: Text(
                          widget.item.category,
                          style: GoogleFonts.hind(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      if (widget.item.district.isNotEmpty && widget.item.district != 'मुख्य') ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.saffron.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(3),
                            border: Border.all(color: AppTheme.saffron, width: 0.8),
                          ),
                          child: Text(
                            '📍 ${widget.item.district}',
                            style: GoogleFonts.hind(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.saffron,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Headline
                  Text(
                    widget.item.title,
                    style: GoogleFonts.notoSerifDevanagari(
                      fontSize: 22 * _fontScale,
                      fontWeight: FontWeight.w800,
                      height: 1.35,
                      color: isDark ? Colors.white : AppTheme.ink,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Source & Date Bar
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: AppTheme.borderLine, width: 1),
                        bottom: BorderSide(color: AppTheme.borderLine, width: 1),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'स्रोत: ${widget.item.source}',
                          style: GoogleFonts.hind(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.pressRed,
                          ),
                        ),
                        Text(
                          widget.item.publishedAt != null
                              ? '${widget.item.publishedAt!.day}/${widget.item.publishedAt!.month}/${widget.item.publishedAt!.year}'
                              : 'ताज़ा अपडेट',
                          style: GoogleFonts.hind(
                            fontSize: 12,
                            color: AppTheme.inkMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Full Multi-Paragraph Article Content
                  Text(
                    widget.item.content.isNotEmpty
                        ? widget.item.content
                        : (widget.item.description.isNotEmpty
                            ? widget.item.description
                            : widget.item.title),
                    style: GoogleFonts.hind(
                      fontSize: 16.5 * _fontScale,
                      fontWeight: FontWeight.w400,
                      height: 1.8,
                      color: isDark ? Colors.white70 : AppTheme.ink,
                    ),
                  ),
                  const SizedBox(height: 24),
                  // WhatsApp Share Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF25D366).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF25D366), width: 1.2),
                    ),
                    child: Column(
                      children: [
                        Text(
                          'यह खबर अपने दोस्तों और WhatsApp ग्रुप में शेयर करें',
                          style: GoogleFonts.hind(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF1E7E34),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        ElevatedButton.icon(
                          onPressed: _shareArticle,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          ),
                          icon: const Icon(Icons.share, color: Colors.white),
                          label: Text(
                            'WhatsApp पर शेयर करें',
                            style: GoogleFonts.hind(fontSize: 14, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Original Source Link
                  if (widget.item.link.isNotEmpty)
                    Center(
                      child: TextButton.icon(
                        onPressed: _openSourceUrl,
                        icon: const Icon(Icons.open_in_browser, size: 18),
                        label: Text(
                          'मूल समाचार स्रोत देखें (${widget.item.source})',
                          style: GoogleFonts.hind(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.pressRed,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
