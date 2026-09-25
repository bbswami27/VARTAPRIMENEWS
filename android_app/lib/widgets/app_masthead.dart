import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'waving_flag_widget.dart';

class AppMasthead extends StatelessWidget {
  const AppMasthead({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: Column(
        children: [
          // Origin Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 4),
            color: AppTheme.navyDark,
            alignment: Alignment.center,
            child: Text(
              'Made with ❤️ in Haryana, India',
              style: GoogleFonts.hind(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppTheme.saffron,
                letterSpacing: 0.5,
              ),
            ),
          ),
          // Main Masthead Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                // Left: Tricolor Flag
                const WavingFlagWidget(width: 42, height: 28),
                const SizedBox(width: 8),
                // Center: Branding
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'NATIONAL • HARYANA • GLOBAL',
                        style: GoogleFonts.teko(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.pressRedDark,
                          letterSpacing: 1.5,
                        ),
                      ),
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: 'वार्ता',
                              style: GoogleFonts.notoSerifDevanagari(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                color: Theme.of(context).brightness == Brightness.dark
                                    ? Colors.white
                                    : AppTheme.ink,
                                height: 1.1,
                              ),
                            ),
                            TextSpan(
                              text: 'प्राइम',
                              style: GoogleFonts.notoSerifDevanagari(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.pressRed,
                                height: 1.1,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        'VARTAPRIME NEWS • सत्य • निष्पक्षता • राष्ट्रहित',
                        style: GoogleFonts.hind(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.inkMuted,
                          letterSpacing: 0.3,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Right: Sovereign Map Badge
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppTheme.gold, width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.gold.withOpacity(0.3),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(5),
                    child: Image.network(
                      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=200&auto=format&fit=crop&q=80',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.map,
                        size: 24,
                        color: AppTheme.pressRed,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Tricolor Rule
          Container(
            height: 3,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.saffron,
                  AppTheme.saffron,
                  Colors.white,
                  Colors.white,
                  AppTheme.green,
                  AppTheme.green,
                ],
                stops: [0.0, 0.33, 0.33, 0.66, 0.66, 1.0],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
