import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/admin_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const VartaPrimeAdminApp());
}

class VartaPrimeAdminApp extends StatelessWidget {
  const VartaPrimeAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'वार्ताप्राइम मुख्य संपादक व एडमिन',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const AdminScreen(),
    );
  }
}
