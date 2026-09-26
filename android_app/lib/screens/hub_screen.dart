import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import 'reporter_portal_screen.dart';
import 'admin_screen.dart';
import 'citizen_reporter_screen.dart';
import 'advt_agency_screen.dart';

class HubScreen extends StatelessWidget {
  const HubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('🔐 वार्ताप्राइम पोर्टल हब', style: GoogleFonts.notoSerifDevanagari(fontSize: 18, fontWeight: FontWeight.w700)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Card(
              color: AppTheme.navyDark,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(text: 'वार्ता', style: GoogleFonts.notoSerifDevanagari(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                          TextSpan(text: 'प्राइम', style: GoogleFonts.notoSerifDevanagari(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.pressRed)),
                          TextSpan(text: ' पोर्टल हब', style: GoogleFonts.notoSerifDevanagari(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.saffron)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'सभी उपयोगकर्ताओं, पत्रकारों और संपादकों के लिए एकीकृत गेटवे',
                      style: GoogleFonts.hind(fontSize: 13, color: Colors.white70),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            Text('अपना पोर्टल चुनें (Select Portal)', style: GoogleFonts.notoSerifDevanagari(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),

            // 1. Reader News Portal
            _buildPortalCard(
              context,
              icon: Icons.newspaper,
              color: AppTheme.blue,
              title: '📰 पाठक समाचार पोर्टल (Reader App)',
              desc: 'ताज़ा खबरें, ब्रेकिंग न्यूज़, 22 जिले हरियाणा, देश-विदेश और व्यक्तिगत समाचार फीड।',
              buttonText: 'पाठक पोर्टल खोलें',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => HomeScreen(isDarkMode: false, onDarkModeChanged: (_) {}))),
            ),
            const SizedBox(height: 12),

            // 2. Field Reporter Portal
            _buildPortalCard(
              context,
              icon: Icons.rate_review,
              color: AppTheme.green,
              title: '✍️ रिपोर्टर डेस्क पोर्टल (Field Reporter)',
              desc: 'फील्ड पत्रकारों और स्ट्रिंगर्स के लिए त्वरित समाचार सबमिशन और स्टेटस ट्रैकिंग।',
              buttonText: 'रिपोर्टर लॉगिन',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReporterPortalScreen())),
            ),
            const SizedBox(height: 12),

            // 3. Master Admin & Editor Portal
            _buildPortalCard(
              context,
              icon: Icons.admin_panel_settings,
              color: AppTheme.pressRed,
              title: '👑 मुख्य संपादक व एडमिन (Master Admin)',
              desc: '1-क्लिक समाचार स्वीकृति/अस्वीकृति, ब्रेकिंग न्यूज़, AI ऑटो-अप्रूवल और 15-दिवसीय स्टोरेज प्रबंधन।',
              buttonText: 'एडमिन डेस्क लॉगिन',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminScreen())),
            ),
            const SizedBox(height: 12),

            // 4. Citizen Journalism Portal
            _buildPortalCard(
              context,
              icon: Icons.record_voice_over,
              color: AppTheme.saffron,
              title: '📢 सिटीजन रिपोर्टर (Citizen Journalism)',
              desc: 'आम नागरिकों द्वारा सड़क, बिजली, पानी, स्वास्थ्य व ग्राउंड मुद्दों की सीधी रिपोर्टिंग।',
              buttonText: 'नागरिक रिपोर्ट भेजें',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CitizenReporterScreen())),
            ),
            const SizedBox(height: 12),

            // 5. Advt Agency Portal
            _buildPortalCard(
              context,
              icon: Icons.campaign,
              color: const Color(0xFF7C3AED),
              title: '💼 विज्ञापन एजेंसी व स्पॉन्सर (Advt Agency)',
              desc: 'बैनर स्लॉट बुकिंग, लाइव व्यूज/क्लिक्स टेलीमेट्री और विज्ञापन अभियान प्रबंधन।',
              buttonText: 'विज्ञापन पोर्टल खोलें',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdvtAgencyScreen())),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPortalCard(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String desc,
    required String buttonText,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: color, size: 28),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(title, style: GoogleFonts.notoSerifDevanagari(fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(desc, style: GoogleFonts.hind(fontSize: 12.5, color: AppTheme.inkSoft, height: 1.4)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 40,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                ),
                onPressed: onTap,
                child: Text(buttonText, style: GoogleFonts.hind(fontSize: 13.5, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
