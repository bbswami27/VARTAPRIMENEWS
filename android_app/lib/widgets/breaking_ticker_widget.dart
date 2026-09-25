import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/news_item.dart';
import '../theme/app_theme.dart';

class BreakingTickerWidget extends StatefulWidget {
  final List<NewsItem> breakingNews;
  final Function(NewsItem) onArticleTap;

  const BreakingTickerWidget({
    super.key,
    required this.breakingNews,
    required this.onArticleTap,
  });

  @override
  State<BreakingTickerWidget> createState() => _BreakingTickerWidgetState();
}

class _BreakingTickerWidgetState extends State<BreakingTickerWidget> {
  int _currentIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    if (widget.breakingNews.isEmpty) return;
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (mounted && widget.breakingNews.isNotEmpty) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % widget.breakingNews.length;
        });
      }
    });
  }

  @override
  void didUpdateWidget(covariant BreakingTickerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.breakingNews.length != oldWidget.breakingNews.length) {
      _timer?.cancel();
      _currentIndex = 0;
      _startTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.breakingNews.isEmpty) return const SizedBox.shrink();

    final currentItem = widget.breakingNews[_currentIndex];

    return Container(
      color: AppTheme.pressRed,
      height: 38,
      child: Row(
        children: [
          // Badge
          Container(
            color: AppTheme.pressRedDark,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            alignment: Alignment.center,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.flash_on, color: AppTheme.saffron, size: 16),
                const SizedBox(width: 4),
                Text(
                  'ब्रेकिंग',
                  style: GoogleFonts.hind(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          // Scrolling / Fading Text
          Expanded(
            child: InkWell(
              onTap: () => widget.onArticleTap(currentItem),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 400),
                  transitionBuilder: (child, animation) {
                    return SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.0, 0.5),
                        end: Offset.zero,
                      ).animate(animation),
                      child: FadeTransition(opacity: animation, child: child),
                    );
                  },
                  child: Text(
                    currentItem.title,
                    key: ValueKey<String>(currentItem.id),
                    style: GoogleFonts.hind(
                      color: Colors.white,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
