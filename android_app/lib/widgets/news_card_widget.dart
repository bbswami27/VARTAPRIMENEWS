import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import '../models/news_item.dart';
import '../theme/app_theme.dart';

class NewsCardWidget extends StatelessWidget {
  final NewsItem item;
  final VoidCallback onTap;
  final bool isHero;
  final int? rankNumber;

  const NewsCardWidget({
    super.key,
    required this.item,
    required this.onTap,
    this.isHero = false,
    this.rankNumber,
  });

  String _formatTimeAgo(DateTime? dt) {
    if (dt == null) return 'ताज़ा';
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes} मिनट पहले';
    if (diff.inHours < 24) return '${diff.inHours} घंटे पहले';
    if (diff.inDays == 1) return 'कल';
    return '${diff.inDays} दिन पहले';
  }

  void _shareArticle(BuildContext context) {
    final text = '${item.title}\n\nपूरी खबर पढ़ें वार्ताप्राइम न्यूज़ पर: ${item.link.isNotEmpty ? item.link : "https://vartaprime-news-1.onrender.com"}';
    Share.share(text, subject: item.title);
  }

  @override
  Widget build(BuildContext context) {
    if (isHero) {
      return _buildHeroCard(context);
    }
    return _buildHorizontalCard(context);
  }

  // 1. Hero Full Card
  Widget _buildHeroCard(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Box
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: CachedNetworkImage(
                    imageUrl: item.imageurl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: AppTheme.navyDark,
                      child: const Center(
                        child: CircularProgressIndicator(color: AppTheme.pressRed),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: AppTheme.navyDark,
                      child: const Icon(Icons.newspaper, color: Colors.white54, size: 40),
                    ),
                  ),
                ),
                // Category Chip
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.pressRed,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      item.category,
                      style: GoogleFonts.hind(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                if (item.district.isNotEmpty && item.district != 'मुख्य')
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '📍 ${item.district}',
                        style: GoogleFonts.hind(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.saffron,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // Title & Content
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: GoogleFonts.notoSerifDevanagari(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      height: 1.4,
                      color: Theme.of(context).textTheme.titleLarge?.color,
                    ),
                  ),
                  if (item.description.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      item.description,
                      style: GoogleFonts.hind(
                        fontSize: 13.5,
                        color: AppTheme.inkSoft,
                        height: 1.45,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'स्रोत: ${item.source} • ⏱️ ${_formatTimeAgo(item.publishedAt)}',
                        style: GoogleFonts.hind(
                          fontSize: 11.5,
                          color: AppTheme.inkMuted,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.share, size: 18, color: AppTheme.pressRed),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => _shareArticle(context),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 2. Horizontal News Card (Full-width, large readable typography)
  Widget _buildHorizontalCard(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      elevation: 0.8,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Optional Rank Number
              if (rankNumber != null) ...[
                Text(
                  rankNumber! < 10 ? '0$rankNumber' : '$rankNumber',
                  style: GoogleFonts.teko(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.pressRed,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              // Thumbnail Photo (If image is present)
              if (item.imageurl.trim().length > 5) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: SizedBox(
                    width: 95,
                    height: 80,
                    child: CachedNetworkImage(
                      imageUrl: item.imageurl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: AppTheme.navyDark,
                        child: const Center(
                          child: SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.pressRed),
                          ),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: AppTheme.paperDim,
                        child: const Icon(Icons.newspaper, color: AppTheme.inkMuted, size: 28),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
              ],
              // Content Area
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Badges
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: AppTheme.pressRed.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: Text(
                            item.category,
                            style: GoogleFonts.hind(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.pressRed,
                            ),
                          ),
                        ),
                        if (item.district.isNotEmpty && item.district != 'मुख्य') ...[
                          const SizedBox(width: 5),
                          Text(
                            '📍 ${item.district}',
                            style: GoogleFonts.hind(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.saffron,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    // Headline
                    Text(
                      item.title,
                      style: GoogleFonts.notoSerifDevanagari(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        height: 1.4,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.white
                            : AppTheme.ink,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    // Bottom Meta
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'स्रोत: ${item.source} • ${_formatTimeAgo(item.publishedAt)}',
                            style: GoogleFonts.hind(
                              fontSize: 11,
                              color: AppTheme.inkMuted,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        InkWell(
                          onTap: () => _shareArticle(context),
                          child: const Padding(
                            padding: EdgeInsets.all(2),
                            child: Icon(Icons.share, size: 16, color: AppTheme.inkMuted),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
