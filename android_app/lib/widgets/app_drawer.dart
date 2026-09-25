import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import '../screens/bookmarks_screen.dart';
import '../screens/haryana_weather_screen.dart';
import '../screens/reporter_portal_screen.dart';
import '../screens/search_screen.dart';

class AppDrawer extends StatelessWidget {
  final Function(String) onCategorySelected;
  final bool isDarkMode;
  final Function(bool) onDarkModeChanged;

  const AppDrawer({
    super.key,
    required this.onCategorySelected,
    required this.isDarkMode,
    required this.onDarkModeChanged,
  });

  static const List<Map<String, String>> categories = [
    {'name': 'होम', 'key': 'home', 'icon': '🏠'},
    {'name': 'हरियाणा (22 जिले)', 'key': 'हरियाणा', 'icon': '🌾'},
    {'name': 'देश (राष्ट्रीय)', 'key': 'देश', 'icon': '🇮🇳'},
    {'name': 'विदेश', 'key': 'विदेश', 'icon': '🌍'},
    {'name': 'युवा एवं करियर', 'key': 'युवा', 'icon': '🎓'},
    {'name': 'बिज़नेस एवं बाज़ार', 'key': 'बिज़नेस', 'icon': '💼'},
    {'name': 'क्राइम डायरी', 'key': 'क्राइम', 'icon': '⚖️'},
    {'name': 'खेल जगत', 'key': 'खेल', 'icon': '🏏'},
    {'name': 'धर्म एवं संस्कृति', 'key': 'धर्म', 'icon': '🪔'},
    {'name': 'टेक एवं ऑटो', 'key': 'टेक', 'icon': '💻'},
    {'name': 'लाइफस्टाइल', 'key': 'लाइफस्टाइल', 'icon': '🌿'},
    {'name': 'संपादकीय', 'key': 'संपादकीय', 'icon': '✒️'},
    {'name': 'करेंट अफेयर्स / GK', 'key': 'करेंट अफेयर्स', 'icon': '📚'},
    {'name': 'सरकारी नौकरियां', 'key': 'सरकारी योजनाएं', 'icon': '📢'},
  ];

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          // Drawer Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 45, bottom: 20, left: 16, right: 16),
            decoration: const BoxDecoration(
              color: AppTheme.navy,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: 'वार्ता',
                        style: GoogleFonts.notoSerifDevanagari(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      TextSpan(
                        text: 'प्राइम',
                        style: GoogleFonts.notoSerifDevanagari(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.pressRed,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'VartaPrime News • सत्य • निष्पक्षता • राष्ट्रहित',
                  style: GoogleFonts.hind(
                    fontSize: 11.5,
                    color: AppTheme.saffron,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'हरियाणा और देश-दुनिया का प्रमुख डिजिटल समाचार मंच',
                  style: GoogleFonts.hind(
                    fontSize: 11,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          // Scrollable Menu List
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                // Quick Tools
                ListTile(
                  leading: const Icon(Icons.search, color: AppTheme.pressRed),
                  title: Text('समाचार खोजें (Search)', style: GoogleFonts.hind(fontWeight: FontWeight.w600)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.bookmark, color: AppTheme.gold),
                  title: Text('सहेजे गए समाचार (Bookmarks)', style: GoogleFonts.hind(fontWeight: FontWeight.w600)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const BookmarksScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.cloud, color: Color(0xFF0288D1)),
                  title: Text('हरियाणा मौसम (22 जिले)', style: GoogleFonts.hind(fontWeight: FontWeight.w600)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const HaryanaWeatherScreen()));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.rate_review, color: AppTheme.green),
                  title: Text('रिपोर्टर पोर्टल (खबर भेजें)', style: GoogleFonts.hind(fontWeight: FontWeight.w600)),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ReporterPortalScreen()));
                  },
                ),
                const Divider(),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  child: Text(
                    'प्रमुख श्रेणियां (Categories)',
                    style: GoogleFonts.teko(fontSize: 16, color: AppTheme.inkMuted, fontWeight: FontWeight.w700),
                  ),
                ),
                // Categories
                ...categories.map((cat) => ListTile(
                      leading: Text(cat['icon']!, style: const TextStyle(fontSize: 18)),
                      title: Text(
                        cat['name']!,
                        style: GoogleFonts.hind(fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                      dense: true,
                      onTap: () {
                        Navigator.pop(context);
                        onCategorySelected(cat['key']!);
                      },
                    )),
                const Divider(),
                // Dark Mode Switch
                SwitchListTile(
                  title: Text('डार्क मोड (Dark Mode)', style: GoogleFonts.hind(fontWeight: FontWeight.w600)),
                  value: isDarkMode,
                  activeThumbColor: AppTheme.pressRed,
                  onChanged: (val) {
                    onDarkModeChanged(val);
                  },
                ),
                // Visit Website
                ListTile(
                  leading: const Icon(Icons.language, color: AppTheme.navy),
                  title: Text('वेबसाइट खोलें (Live Portal)', style: GoogleFonts.hind(fontWeight: FontWeight.w600)),
                  onTap: () async {
                    final uri = Uri.parse('https://vartaprime-news-1.onrender.com');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                ),
              ],
            ),
          ),
          // Footer
          Container(
            padding: const EdgeInsets.all(12),
            color: AppTheme.paperDim,
            alignment: Alignment.center,
            child: Text(
              'वार्ताप्राइम न्यूज़ ऐप • Version 1.0.0',
              style: GoogleFonts.hind(fontSize: 11, color: AppTheme.inkMuted),
            ),
          ),
        ],
      ),
    );
  }
}
