import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/news_item.dart';

class StorageService {
  static const String _keyBookmarks = 'vartaprime_bookmarks';
  static const String _keyDarkMode = 'vartaprime_dark_mode';
  static const String _keyFontSizeMultiplier = 'vartaprime_font_size';

  // 1. Get Bookmarks
  static Future<List<NewsItem>> getBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_keyBookmarks) ?? [];
    return list.map((str) => NewsItem.fromJson(json.decode(str))).toList();
  }

  // 2. Toggle Bookmark
  static Future<bool> toggleBookmark(NewsItem item) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_keyBookmarks) ?? [];
    final existingIndex = list.indexWhere((str) {
      final map = json.decode(str);
      return map['id'] == item.id;
    });

    if (existingIndex >= 0) {
      list.removeAt(existingIndex);
      await prefs.setStringList(_keyBookmarks, list);
      return false; // removed
    } else {
      list.insert(0, json.encode(item.toJson()));
      await prefs.setStringList(_keyBookmarks, list);
      return true; // added
    }
  }

  // 3. Is Bookmarked
  static Future<bool> isBookmarked(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_keyBookmarks) ?? [];
    return list.any((str) {
      final map = json.decode(str);
      return map['id'] == id;
    });
  }

  // 4. Dark Mode Settings
  static Future<bool> isDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyDarkMode) ?? false;
  }

  static Future<void> setDarkMode(bool val) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyDarkMode, val);
  }

  // 5. Font Scale Multiplier
  static Future<double> getFontScale() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_keyFontSizeMultiplier) ?? 1.0;
  }

  static Future<void> setFontScale(double scale) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_keyFontSizeMultiplier, scale);
  }
}
