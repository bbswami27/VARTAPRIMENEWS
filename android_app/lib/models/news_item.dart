class NewsItem {
  final String id;
  final String title;
  final String description;
  final String content;
  final String category;
  final String state;
  final String district;
  final String source;
  final String sourceType;
  final String reporterName;
  final String link;
  final String imageurl;
  final DateTime? publishedAt;
  final bool isBreaking;
  final bool isHero;
  final int views;

  NewsItem({
    required this.id,
    required this.title,
    required this.description,
    required this.content,
    required this.category,
    required this.state,
    required this.district,
    required this.source,
    this.sourceType = 'rss',
    this.reporterName = '',
    required this.link,
    required this.imageurl,
    this.publishedAt,
    this.isBreaking = false,
    this.isHero = false,
    this.views = 0,
  });

  factory NewsItem.fromJson(Map<String, dynamic> json) {
    DateTime? pubDate;
    if (json['publishedAt'] != null) {
      pubDate = DateTime.tryParse(json['publishedAt'].toString());
    } else if (json['approvedAt'] != null) {
      pubDate = DateTime.tryParse(json['approvedAt'].toString());
    }

    final rawImg = json['imageurl']?.toString().trim() ?? '';
    final cleanImg = (rawImg.isNotEmpty &&
            rawImg != 'null' &&
            rawImg != 'undefined' &&
            !rawImg.contains('unsplash.com'))
        ? rawImg
        : '';

    return NewsItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      category: json['category']?.toString() ?? 'सामान्य',
      state: json['state']?.toString() ?? 'राष्ट्रीय / देश',
      district: json['district']?.toString() ?? 'मुख्य',
      source: json['source']?.toString() ?? 'वार्ताप्राइम',
      sourceType: json['sourceType']?.toString() ?? 'rss',
      reporterName: json['reporterName']?.toString() ?? '',
      link: json['link']?.toString() ?? '',
      imageurl: cleanImg,
      publishedAt: pubDate,
      isBreaking: json['isBreaking'] == true,
      isHero: json['isHero'] == true,
      views: (json['views'] as num?)?.toInt() ?? 0,
    );
  }

  bool get hasImage =>
      imageurl.trim().isNotEmpty &&
      imageurl.trim() != 'null' &&
      (imageurl.trim().startsWith('http://') ||
          imageurl.trim().startsWith('https://') ||
          imageurl.trim().startsWith('data:image'));

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'content': content,
      'category': category,
      'state': state,
      'district': district,
      'source': source,
      'sourceType': sourceType,
      'reporterName': reporterName,
      'link': link,
      'imageurl': imageurl,
      'publishedAt': publishedAt?.toIso8601String(),
      'isBreaking': isBreaking,
      'isHero': isHero,
      'views': views,
    };
  }
}
