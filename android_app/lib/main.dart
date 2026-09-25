import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/splash_screen.dart';
import 'services/storage_service.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set Preferred Orientations (Portrait mode for news reading)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set System UI Status Bar styling
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  final isDark = await StorageService.isDarkMode();
  runApp(VartaPrimeApp(initialDarkMode: isDark));
}

class VartaPrimeApp extends StatefulWidget {
  final bool initialDarkMode;

  const VartaPrimeApp({super.key, required this.initialDarkMode});

  @override
  State<VartaPrimeApp> createState() => _VartaPrimeAppState();
}

class _VartaPrimeAppState extends State<VartaPrimeApp> {
  late bool _isDarkMode;

  @override
  void initState() {
    super.initState();
    _isDarkMode = widget.initialDarkMode;
  }

  void _onDarkModeChanged(bool val) {
    setState(() => _isDarkMode = val);
    StorageService.setDarkMode(val);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'वार्ताप्राइम न्यूज़ (VartaPrime News)',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: SplashScreen(
        isDarkMode: _isDarkMode,
        onDarkModeChanged: _onDarkModeChanged,
      ),
    );
  }
}
