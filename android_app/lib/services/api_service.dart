import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/news_item.dart';
import '../models/weather_model.dart';

class ApiService {
  // Live Render Production API Endpoint
  static const String baseUrl = 'https://vartaprime-news-1.onrender.com/api';

  // 1. Fetch News with Filters & Personalization
  static Future<List<NewsItem>> fetchNews({
    String? category,
    String? district,
    String? state,
    String? search,
    String? userCity,
    String? userRegion,
    String? categoryAffinity,
    bool ranked = true,
    int? limit,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/news').replace(queryParameters: {
        if (category != null && category != 'home' && category != 'सभी') 'category': category,
        if (district != null && district != 'सभी' && district != 'मुख्य') 'district': district,
        if (state != null && state != 'सभी') 'state': state,
        if (search != null && search.isNotEmpty) 'search': search,
        if (userCity != null && userCity.isNotEmpty) 'userCity': userCity,
        if (userRegion != null && userRegion.isNotEmpty) 'userRegion': userRegion,
        if (categoryAffinity != null && categoryAffinity.isNotEmpty) 'categoryAffinity': categoryAffinity,
        if (ranked) 'ranked': 'true',
        if (limit != null) 'limit': limit.toString(),
      });

      final response = await http.get(uri).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes));
        if (decoded['success'] == true && decoded['data'] is List) {
          final List list = decoded['data'];
          return list.map((item) => NewsItem.fromJson(item)).toList();
        }
      }
      return <NewsItem>[];
    } catch (e) {
      // ignore: avoid_print
      print('ApiService.fetchNews Error: $e');
      return <NewsItem>[];
    }
  }

  // 2. Fetch Breaking News for Ticker
  static Future<List<NewsItem>> fetchBreaking() async {
    try {
      final uri = Uri.parse('$baseUrl/breaking');
      final response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes));
        if (decoded['success'] == true && decoded['data'] is List) {
          final List list = decoded['data'];
          return list.map((item) => NewsItem.fromJson(item)).toList();
        }
      }
      return <NewsItem>[];
    } catch (e) {
      return <NewsItem>[];
    }
  }

  // 3. Fetch Live Panipat Weather (Top Bar)
  static Future<WeatherModel?> fetchPanipatWeather() async {
    try {
      final uri = Uri.parse('$baseUrl/weather/panipat');
      final response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes));
        if (decoded['success'] == true && decoded['data'] != null) {
          return WeatherModel.fromJson(decoded['data']);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // 4. Fetch All 22 Haryana Districts Weather
  static Future<List<WeatherModel>> fetchHaryanaWeather() async {
    try {
      final uri = Uri.parse('$baseUrl/weather/haryana');
      final response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes));
        if (decoded['success'] == true && decoded['data'] is List) {
          final List list = decoded['data'];
          return list.map((item) => WeatherModel.fromJson(item)).toList();
        }
      }
      return <WeatherModel>[];
    } catch (e) {
      return <WeatherModel>[];
    }
  }

  // 5. Submit News from In-App Reporter Portal
  static Future<Map<String, dynamic>> submitReporterNews({
    required String title,
    required String content,
    required String category,
    required String state,
    required String district,
    required String reporterName,
    String? imageurl,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/reporter/submit');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: json.encode({
          'title': title,
          'content': content,
          'category': category,
          'state': state,
          'district': district,
          'reporterName': reporterName,
          'imageurl': imageurl ?? 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
        }),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        return json.decode(utf8.decode(response.bodyBytes));
      }
      return {'success': false, 'message': 'सबमिशन विफल हुआ (Status: ${response.statusCode})'};
    } catch (e) {
      return {'success': false, 'message': 'नेटवर्क त्रुटि: $e'};
    }
  }
}
