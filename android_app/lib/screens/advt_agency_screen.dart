import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AdvtAgencyScreen extends StatefulWidget {
  const AdvtAgencyScreen({super.key});

  @override
  State<AdvtAgencyScreen> createState() => _AdvtAgencyScreenState();
}

class _AdvtAgencyScreenState extends State<AdvtAgencyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _brandController = TextEditingController();
  final _contactController = TextEditingController();
  final _phoneController = TextEditingController();
  final _targetUrlController = TextEditingController();
  final _imageUrlController = TextEditingController();

  String _selectedSlot = 'header_top';
  String _selectedDuration = '30';
  bool _isSubmitting = false;

  static const List<Map<String, String>> adSlots = [
    {'id': 'header_top', 'name': '🔝 हेडर टॉप बैनर (Header Banner)'},
    {'id': 'sidebar_sticky', 'name': '📌 साइडबार स्टिकी स्लॉट (Sidebar Banner)'},
    {'id': 'article_inline', 'name': '📰 इन-आर्टिकल बैनर (In-Article Banner)'},
    {'id': 'bottom_sticky', 'name': '📱 मोबाइल बॉटम स्टिकी बार (Sticky Bottom)'},
  ];

  static const List<Map<String, String>> durations = [
    {'days': '7', 'name': '7 दिन (1 सप्ताह)'},
    {'days': '15', 'name': '15 दिन'},
    {'days': '30', 'name': '30 दिन (1 माह - सबसे लोकप्रिय)'},
    {'days': '90', 'name': '3 महीने (त्रैमासिक पैकेज)'},
  ];

  Future<void> _submitAdBooking() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final res = await http.post(
        Uri.parse('${ApiService.baseUrl}/ads/book'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'brandName': _brandController.text.trim(),
          'contactPerson': _contactController.text.trim(),
          'phone': _phoneController.text.trim(),
          'slotId': _selectedSlot,
          'durationDays': int.tryParse(_selectedDuration) ?? 30,
          'targetUrl': _targetUrlController.text.trim(),
          'imageUrl': _imageUrlController.text.trim(),
        }),
      ).timeout(const Duration(seconds: 15));

      setState(() => _isSubmitting = false);

      if (mounted) {
        final decoded = json.decode(utf8.decode(res.bodyBytes));
        if (decoded['success'] == true) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              title: Text('विज्ञापन अनुरोध प्राप्त हुआ!', style: GoogleFonts.notoSerifDevanagari(color: AppTheme.green)),
              content: Text(
                'आपका विज्ञापन अभियान सफलतापूर्वक पंजीकृत हो गया है। हमारी एड सेल्स टीम 24 घंटे के भीतर आपसे संपर्क कर स्लॉट लाइव कर देगी।',
                style: GoogleFonts.hind(),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _brandController.clear();
                    _contactController.clear();
                    _phoneController.clear();
                    _targetUrlController.clear();
                    _imageUrlController.clear();
                  },
                  child: const Text('ठीक है'),
                ),
              ],
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(decoded['message'] ?? 'त्रुटि हुई।'), backgroundColor: AppTheme.pressRed),
          );
        }
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('त्रुटि: $e'), backgroundColor: AppTheme.pressRed),
        );
      }
    }
  }

  Future<void> _openWhatsApp() async {
    final uri = Uri.parse('https://api.whatsapp.com/send?phone=919876543210&text=Namaste%20VartaPrime%20Ad%20Desk,%20I%20want%20to%20advertise');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('💼 विज्ञापन एजेंसी व स्पॉन्सर पोर्टल', style: GoogleFonts.notoSerifDevanagari(fontSize: 18, fontWeight: FontWeight.w700)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Banner
              Card(
                color: AppTheme.navyDark,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.campaign, color: AppTheme.saffron, size: 36),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'लाखों पाठकों तक पहुंचाएं अपना ब्रांड',
                                  style: GoogleFonts.notoSerifDevanagari(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                                ),
                                Text(
                                  'हरियाणा, दिल्ली-NCR और देशभर में अत्यधिक लक्षित ऑडियंस',
                                  style: GoogleFonts.hind(fontSize: 12, color: AppTheme.saffronLight),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: AppTheme.saffron),
                        ),
                        onPressed: _openWhatsApp,
                        icon: const Icon(Icons.chat, color: AppTheme.green, size: 18),
                        label: const Text('व्हाट्सएप पर एड सेल्स से बात करें'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),

              Text('नया विज्ञापन अभियान बुक करें', style: GoogleFonts.notoSerifDevanagari(fontSize: 17, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),

              // Brand Name
              TextFormField(
                controller: _brandController,
                decoration: const InputDecoration(labelText: 'कंपनी / ब्रांड का नाम (Brand Name) *', prefixIcon: Icon(Icons.business)),
                validator: (v) => v == null || v.trim().isEmpty ? 'कृपया ब्रांड का नाम दर्ज करें' : null,
              ),
              const SizedBox(height: 12),

              // Contact Person & Phone
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _contactController,
                      decoration: const InputDecoration(labelText: 'संपर्क व्यक्ति का नाम *', prefixIcon: Icon(Icons.person)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'नाम दर्ज करें' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(labelText: 'मोबाइल नंबर *', prefixIcon: Icon(Icons.phone)),
                      validator: (v) => v == null || v.trim().length < 10 ? 'मान्य नंबर दर्ज करें' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Ad Slot Selection
              DropdownButtonFormField<String>(
                value: _selectedSlot,
                decoration: const InputDecoration(labelText: 'विज्ञापन स्लॉट चुनें (Ad Slot) *', prefixIcon: Icon(Icons.view_quilt)),
                items: adSlots.map((s) => DropdownMenuItem(value: s['id'], child: Text(s['name']!, style: GoogleFonts.hind()))).toList(),
                onChanged: (v) => setState(() => _selectedSlot = v!),
              ),
              const SizedBox(height: 12),

              // Duration
              DropdownButtonFormField<String>(
                value: _selectedDuration,
                decoration: const InputDecoration(labelText: 'अभियान की अवधि (Duration) *', prefixIcon: Icon(Icons.timer)),
                items: durations.map((d) => DropdownMenuItem(value: d['days'], child: Text(d['name']!, style: GoogleFonts.hind()))).toList(),
                onChanged: (v) => setState(() => _selectedDuration = v!),
              ),
              const SizedBox(height: 12),

              // Target URL
              TextFormField(
                controller: _targetUrlController,
                decoration: const InputDecoration(
                  labelText: 'टारगेट वेबसाइट / WhatsApp लिंक',
                  hintText: 'https://yourwebsite.com या WhatsApp Link',
                  prefixIcon: Icon(Icons.link),
                ),
              ),
              const SizedBox(height: 12),

              // Banner Image URL
              TextFormField(
                controller: _imageUrlController,
                decoration: const InputDecoration(
                  labelText: 'बैनर इमेज URL (वैकल्पिक)',
                  hintText: 'https://example.com/banner.jpg',
                  prefixIcon: Icon(Icons.image),
                ),
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.pressRed,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: _isSubmitting ? null : _submitAdBooking,
                  icon: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.check_circle),
                  label: Text(
                    _isSubmitting ? 'प्रक्रिया जारी...' : 'विज्ञापन स्लॉट बुक करें ➔',
                    style: GoogleFonts.hind(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _brandController.dispose();
    _contactController.dispose();
    _phoneController.dispose();
    _targetUrlController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }
}
