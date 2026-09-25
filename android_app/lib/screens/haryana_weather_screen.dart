import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/weather_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class HaryanaWeatherScreen extends StatefulWidget {
  const HaryanaWeatherScreen({super.key});

  @override
  State<HaryanaWeatherScreen> createState() => _HaryanaWeatherScreenState();
}

class _HaryanaWeatherScreenState extends State<HaryanaWeatherScreen> {
  List<WeatherModel> _weatherList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWeather();
  }

  Future<void> _loadWeather() async {
    setState(() => _isLoading = true);
    final list = await ApiService.fetchHaryanaWeather();
    if (mounted) {
      setState(() {
        _weatherList = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'हरियाणा मौसम (22 जिले)',
          style: GoogleFonts.notoSerifDevanagari(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.pressRed))
          : RefreshIndicator(
              onRefresh: _loadWeather,
              color: AppTheme.pressRed,
              child: GridView.builder(
                padding: const EdgeInsets.all(12),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 1.6,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemCount: _weatherList.length,
                itemBuilder: (context, index) {
                  final w = _weatherList[index];
                  final isPanipat = w.name.contains('पानीपत');

                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isPanipat
                          ? const Color(0xFFFEF3C7)
                          : (Theme.of(context).brightness == Brightness.dark
                              ? const Color(0xFF1F2937)
                              : Colors.white),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isPanipat ? AppTheme.saffron : AppTheme.borderLine,
                        width: isPanipat ? 1.5 : 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              w.name,
                              style: GoogleFonts.hind(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.navy,
                              ),
                            ),
                            Text(
                              w.condition,
                              style: GoogleFonts.hind(
                                fontSize: 12,
                                color: AppTheme.inkMuted,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(w.icon, style: const TextStyle(fontSize: 20)),
                            Text(
                              '${w.temp}°C',
                              style: GoogleFonts.teko(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.pressRed,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
