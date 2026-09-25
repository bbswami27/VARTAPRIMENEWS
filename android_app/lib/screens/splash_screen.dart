import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/waving_flag_widget.dart';
import 'home_screen.dart';

class SplashScreen extends StatefulWidget {
  final bool isDarkMode;
  final Function(bool) onDarkModeChanged;

  const SplashScreen({
    super.key,
    required this.isDarkMode,
    required this.onDarkModeChanged,
  });

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeIn);
    _animController.forward();

    Timer(const Duration(milliseconds: 2400), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => HomeScreen(
              isDarkMode: widget.isDarkMode,
              onDarkModeChanged: widget.onDarkModeChanged,
            ),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.navyDark,
      body: FadeTransition(
        opacity: _fadeAnim,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Waving Flag Emblem
              const WavingFlagWidget(width: 72, height: 48),
              const SizedBox(height: 24),
              // Brand Title
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'वार्ता',
                      style: GoogleFonts.notoSerifDevanagari(
                        fontSize: 42,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1,
                      ),
                    ),
                    TextSpan(
                      text: 'प्राइम',
                      style: GoogleFonts.notoSerifDevanagari(
                        fontSize: 42,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.pressRed,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'VARTAPRIME NEWS',
                style: GoogleFonts.teko(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.saffron,
                  letterSpacing: 4,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: 160,
                height: 2,
                color: AppTheme.pressRed,
              ),
              const SizedBox(height: 12),
              Text(
                'सत्य • निष्पक्षता • राष्ट्रहित',
                style: GoogleFonts.hind(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white70,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 48),
              const CircularProgressIndicator(color: AppTheme.saffron, strokeWidth: 2),
              const SizedBox(height: 16),
              Text(
                'Made with ❤️ in Haryana, India',
                style: GoogleFonts.hind(
                  fontSize: 12,
                  color: AppTheme.saffron,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
