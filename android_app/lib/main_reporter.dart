import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/reporter_portal_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const VartaPrimeReporterApp());
}

class VartaPrimeReporterApp extends StatelessWidget {
  const VartaPrimeReporterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'वार्ताप्राइम रिपोर्टर डेस्क',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const ReporterPortalScreen(),
    );
  }
}
