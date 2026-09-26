import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/citizen_reporter_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const VartaPrimeCitizenApp());
}

class VartaPrimeCitizenApp extends StatelessWidget {
  const VartaPrimeCitizenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'वार्ताप्राइम सिटीजन रिपोर्टर',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const CitizenReporterScreen(),
    );
  }
}
