class WeatherModel {
  final String name;
  final String en;
  final int temp;
  final String condition;
  final String icon;
  final int humidity;
  final int wind;

  WeatherModel({
    required this.name,
    required this.en,
    required this.temp,
    required this.condition,
    required this.icon,
    this.humidity = 60,
    this.wind = 12,
  });

  factory WeatherModel.fromJson(Map<String, dynamic> json) {
    return WeatherModel(
      name: json['name']?.toString() ?? 'पानीपत',
      en: json['en']?.toString() ?? 'Panipat',
      temp: (json['temp'] as num?)?.toInt() ?? 32,
      condition: json['condition']?.toString() ?? 'धूप',
      icon: json['icon']?.toString() ?? '☀️',
      humidity: (json['humidity'] as num?)?.toInt() ?? 60,
      wind: (json['wind'] as num?)?.toInt() ?? 12,
    );
  }
}
