import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/news_item.dart';
import '../models/weather_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_drawer.dart';
import '../widgets/app_masthead.dart';
import '../widgets/breaking_ticker_widget.dart';
import '../widgets/haryana_districts_bar.dart';
import '../widgets/news_card_widget.dart';
import 'article_detail_screen.dart';
import 'bookmarks_screen.dart';
import 'search_screen.dart';

class HomeScreen extends StatefulWidget {
  final bool isDarkMode;
  final Function(bool) onDarkModeChanged;

  const HomeScreen({
    super.key,
    required this.isDarkMode,
    required this.onDarkModeChanged,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<NewsItem> _allNews = [];
  List<NewsItem> _breakingNews = [];
  WeatherModel? _panipatWeather;
  bool _isLoading = true;
  String _selectedDistrict = 'सभी';

  static const List<Map<String, String>> categories = [
    {'name': 'होम', 'key': 'home'},
    {'name': 'हरियाणा', 'key': 'हरियाणा'},
    {'name': 'देश', 'key': 'देश'},
    {'name': 'विदेश', 'key': 'विदेश'},
    {'name': 'युवा', 'key': 'युवा'},
    {'name': 'बिज़नेस', 'key': 'बिज़नेस'},
    {'name': 'क्राइम', 'key': 'क्राइम'},
    {'name': 'खेल', 'key': 'खेल'},
    {'name': 'धर्म', 'key': 'धर्म'},
    {'name': 'टेक', 'key': 'टेक'},
    {'name': 'लाइफस्टाइल', 'key': 'लाइफस्टाइल'},
    {'name': 'संपादकीय', 'key': 'संपादकीय'},
    {'name': 'करेंट अफेयर्स', 'key': 'करेंट अफेयर्स'},
    {'name': 'जॉब्स', 'key': 'सरकारी योजनाएं'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: categories.length, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        _loadCategoryNews();
      }
    });
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    final news = await ApiService.fetchNews(limit: 35);
    final breaking = await ApiService.fetchBreaking();
    final weather = await ApiService.fetchPanipatWeather();

    if (mounted) {
      setState(() {
        _allNews = news;
        _breakingNews = breaking;
        _panipatWeather = weather;
        _isLoading = false;
      });
    }
  }

  Future<void> _loadCategoryNews() async {
    final catKey = categories[_tabController.index]['key']!;
    setState(() => _isLoading = true);

    final news = await ApiService.fetchNews(
      category: catKey == 'home' ? null : catKey,
      district: _selectedDistrict == 'सभी' ? null : _selectedDistrict,
      limit: 30,
    );

    if (mounted) {
      setState(() {
        _allNews = news;
        _isLoading = false;
      });
    }
  }

  void _onDistrictSelected(String district) {
    setState(() {
      _selectedDistrict = district;
    });
    _loadCategoryNews();
  }

  void _navigateToArticle(NewsItem item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ArticleDetailScreen(item: item),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentCat = categories[_tabController.index]['key']!;
    final showDistrictBar = currentCat == 'home' || currentCat == 'हरियाणा';

    // Separate Lead Story and Feed Items
    NewsItem? heroStory;
    List<NewsItem> rankedStories = [];
    List<NewsItem> feedStories = [];

    if (_allNews.isNotEmpty) {
      heroStory = _allNews.firstWhere((n) => n.isHero, orElse: () => _allNews[0]);
      final rest = _allNews.where((n) => n.id != heroStory!.id).toList();
      rankedStories = rest.take(4).toList();
      feedStories = rest.skip(4).toList();
    }

    return Scaffold(
      drawer: AppDrawer(
        onCategorySelected: (catKey) {
          final idx = categories.indexWhere((c) => c['key'] == catKey);
          if (idx >= 0) {
            _tabController.animateTo(idx);
          }
        },
        isDarkMode: widget.isDarkMode,
        onDarkModeChanged: widget.onDarkModeChanged,
      ),
      appBar: AppBar(
        title: Row(
          children: [
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: 'वार्ता',
                    style: GoogleFonts.notoSerifDevanagari(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  TextSpan(
                    text: 'प्राइम',
                    style: GoogleFonts.notoSerifDevanagari(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.pressRed,
                    ),
                  ),
                ],
              ),
            ),
            if (_panipatWeather != null) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_panipatWeather!.icon, style: const TextStyle(fontSize: 12)),
                    const SizedBox(width: 3),
                    Text(
                      'पानीपत ${_panipatWeather!.temp}°C',
                      style: GoogleFonts.hind(fontSize: 11, color: Colors.white70),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            tooltip: 'खोजें',
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
            },
          ),
          IconButton(
            icon: const Icon(Icons.bookmark),
            tooltip: 'सहेजे गए',
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const BookmarksScreen()));
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          indicatorColor: AppTheme.pressRed,
          indicatorWeight: 3,
          labelStyle: GoogleFonts.hind(fontSize: 14.5, fontWeight: FontWeight.w700),
          unselectedLabelStyle: GoogleFonts.hind(fontSize: 14, fontWeight: FontWeight.w500),
          tabs: categories.map((c) => Tab(text: c['name'])).toList(),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadInitialData();
          await _loadCategoryNews();
        },
        color: AppTheme.pressRed,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Masthead
              const AppMasthead(),

              // 2. Breaking News Ticker
              if (_breakingNews.isNotEmpty)
                BreakingTickerWidget(
                  breakingNews: _breakingNews,
                  onArticleTap: _navigateToArticle,
                ),

              // 3. Haryana 22 Districts Pill Filter (on Home & Haryana tabs)
              if (showDistrictBar)
                HaryanaDistrictsBar(
                  selectedDistrict: _selectedDistrict,
                  onDistrictSelected: _onDistrictSelected,
                ),

              // 4. Loading indicator or News Content
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(
                    child: CircularProgressIndicator(color: AppTheme.pressRed),
                  ),
                )
              else if (_allNews.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 60),
                  child: Center(
                    child: Column(
                      children: [
                        const Icon(Icons.article_outlined, size: 54, color: AppTheme.inkMuted),
                        const SizedBox(height: 12),
                        Text(
                          'इस श्रेणी में कोई समाचार उपलब्ध नहीं है।',
                          style: GoogleFonts.hind(fontSize: 15, color: AppTheme.inkSoft),
                        ),
                      ],
                    ),
                  ),
                )
              else ...[
                // Hero Lead Story
                if (heroStory != null)
                  NewsCardWidget(
                    item: heroStory,
                    isHero: true,
                    onTap: () => _navigateToArticle(heroStory!),
                  ),

                // Top Ranked 01 to 04 Stories
                if (rankedStories.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                    child: Row(
                      children: [
                        Container(width: 4, height: 18, color: AppTheme.pressRed),
                        const SizedBox(width: 6),
                        Text(
                          'शीर्ष ख़बरें (Top Stories)',
                          style: GoogleFonts.notoSerifDevanagari(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ...rankedStories.asMap().entries.map((entry) {
                    return NewsCardWidget(
                      item: entry.value,
                      rankNumber: entry.key + 1,
                      onTap: () => _navigateToArticle(entry.value),
                    );
                  }),
                ],

                // Main News Feed Stream
                if (feedStories.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
                    child: Row(
                      children: [
                        Container(width: 4, height: 18, color: AppTheme.navy),
                        const SizedBox(width: 6),
                        Text(
                          'ताज़ा समाचार प्रवाह (Latest News)',
                          style: GoogleFonts.notoSerifDevanagari(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ...feedStories.map((item) {
                    return NewsCardWidget(
                      item: item,
                      onTap: () => _navigateToArticle(item),
                    );
                  }),
                ],

                const SizedBox(height: 24),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
