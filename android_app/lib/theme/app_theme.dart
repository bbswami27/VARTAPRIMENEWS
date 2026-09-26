import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color pressRed = Color(0xFFB3261E);
  static const Color pressRedDark = Color(0xFF7F1B15);
  static const Color navy = Color(0xFF18263A);
  static const Color navyDark = Color(0xFF0F172A);
  static const Color paper = Color(0xFFF4F1EA);
  static const Color paperCard = Color(0xFFFFFFFF);
  static const Color paperDim = Color(0xFFEAE5D8);
  static const Color ink = Color(0xFF14130F);
  static const Color inkSoft = Color(0xFF4A463B);
  static const Color inkMuted = Color(0xFF7C7768);
  static const Color saffron = Color(0xFFE08D3C);
  static const Color saffronLight = Color(0xFFFFEDD5);
  static const Color green = Color(0xFF1F7A4D);
  static const Color gold = Color(0xFFB4863A);
  static const Color blue = Color(0xFF2563EB);
  static const Color navyLight = Color(0xFF1E293B);
  static const Color borderLine = Color(0xFFD9D3C1);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: pressRed,
      scaffoldBackgroundColor: paper,
      colorScheme: ColorScheme.fromSeed(
        seedColor: pressRed,
        primary: pressRed,
        secondary: navy,
        surface: paper,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: navy,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: paperCard,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: borderLine, width: 1),
        ),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.notoSerifDevanagari(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: ink,
          height: 1.35,
        ),
        displayMedium: GoogleFonts.notoSerifDevanagari(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: ink,
          height: 1.35,
        ),
        titleLarge: GoogleFonts.notoSerifDevanagari(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: ink,
          height: 1.4,
        ),
        titleMedium: GoogleFonts.hind(
          fontSize: 15.5,
          fontWeight: FontWeight.w700,
          color: ink,
          height: 1.45,
        ),
        bodyLarge: GoogleFonts.hind(
          fontSize: 16.5,
          fontWeight: FontWeight.w500,
          color: ink,
          height: 1.65,
        ),
        bodyMedium: GoogleFonts.hind(
          fontSize: 14.5,
          fontWeight: FontWeight.w400,
          color: inkSoft,
          height: 1.55,
        ),
        labelSmall: GoogleFonts.hind(
          fontSize: 11.5,
          fontWeight: FontWeight.w600,
          color: inkMuted,
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: pressRed,
      scaffoldBackgroundColor: const Color(0xFF111827),
      colorScheme: ColorScheme.fromSeed(
        seedColor: pressRed,
        brightness: Brightness.dark,
        primary: pressRed,
        secondary: saffron,
        surface: const Color(0xFF1F2937),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF1F2937),
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: Color(0xFF374151), width: 1),
        ),
      ),
    );
  }
}
