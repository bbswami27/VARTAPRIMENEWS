import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/splash_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const VartaPrimeReaderApp());
}

class VartaPrimeReaderApp extends StatefulWidget {
  const VartaPrimeReaderApp({super.key});

  @override
  State<VartaPrimeReaderApp> createState() => _VartaPrimeReaderAppState();
}

class _VartaPrimeReaderAppState extends State<VartaPrimeReaderApp> {
  bool _isDarkMode = false;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'वार्ताप्राइम न्यूज़ - पाठक ऐप',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: SplashScreen(
        isDarkMode: _isDarkMode,
        onDarkModeChanged: (val) => setState(() => _isDarkMode = val),
      ),
    );
  }
}
