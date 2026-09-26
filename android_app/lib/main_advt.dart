import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/advt_agency_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const VartaPrimeAdvtApp());
}

class VartaPrimeAdvtApp extends StatelessWidget {
  const VartaPrimeAdvtApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'वार्ताप्राइम विज्ञापन एजेंसी',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const AdvtAgencyScreen(),
    );
  }
}
