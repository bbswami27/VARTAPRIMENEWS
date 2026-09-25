import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ReporterPortalScreen extends StatefulWidget {
  const ReporterPortalScreen({super.key});

  @override
  State<ReporterPortalScreen> createState() => _ReporterPortalScreenState();
}

class _ReporterPortalScreenState extends State<ReporterPortalScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _reporterNameController = TextEditingController();
  final _imageUrlController = TextEditingController();

  String _selectedCategory = 'हरियाणा';
  String _selectedDistrict = 'पानीपत';
  String _selectedState = 'हरियाणा';
  bool _isSubmitting = false;

  static const List<String> categories = [
    'हरियाणा',
    'देश',
    'विदेश',
    'युवा',
    'बिज़नेस',
    'क्राइम',
    'खेल',
    'धर्म',
    'टेक',
    'लाइफस्टाइल',
  ];

  static const List<String> districts = [
    'अम्बाला', 'भिवानी', 'चरखी दादरी', 'फरीदाबाद', 'फतेहाबाद', 'गुरुग्राम',
    'हिसार', 'झज्जर', 'जींद', 'कैथल', 'करनाल', 'कुरुक्षेत्र',
    'महेंद्रगढ़', 'नूंह', 'पलवल', 'पंचकूला', 'पानीपत', 'रेवाड़ी',
    'रोहतक', 'सिरसा', 'सोनीपत', 'यमुनानगर',
  ];

  Future<void> _submitNews() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final res = await ApiService.submitReporterNews(
      title: _titleController.text.trim(),
      content: _contentController.text.trim(),
      category: _selectedCategory,
      state: _selectedState,
      district: _selectedDistrict,
      reporterName: _reporterNameController.text.trim(),
      imageurl: _imageUrlController.text.trim().isNotEmpty ? _imageUrlController.text.trim() : null,
    );

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (res['success'] == true) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('सफलता!', style: GoogleFonts.notoSerifDevanagari(color: AppTheme.green)),
            content: Text(
              'आपका समाचार सफलतापूर्वक सबमिट हो गया है। संपादक समीक्षा के बाद इसे प्रकाशित कर दिया जाएगा।',
              style: GoogleFonts.hind(),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('ठीक है'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message'] ?? 'त्रुटि हुई।'),
            backgroundColor: AppTheme.pressRed,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _reporterNameController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'रिपोर्टर पोर्टल (समाचार भेजें)',
          style: GoogleFonts.notoSerifDevanagari(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.navyDark,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified_user, color: AppTheme.saffron, size: 28),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'वार्ताप्राइम न्यूज़ नेटवर्क में आपका स्वागत है। अपनी ज़मीनी रिपोर्ट यहाँ भेजें।',
                        style: GoogleFonts.hind(color: Colors.white, fontSize: 13.5),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Reporter Name
              TextFormField(
                controller: _reporterNameController,
                decoration: const InputDecoration(
                  labelText: 'रिपोर्टर / संवाददाता का नाम *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (val) => val == null || val.isEmpty ? 'कृपया नाम लिखें' : null,
              ),
              const SizedBox(height: 14),
              // Category Dropdown
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'श्रेणी (Category) *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.category),
                ),
                items: categories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedCategory = val);
                },
              ),
              const SizedBox(height: 14),
              // District Dropdown
              DropdownButtonFormField<String>(
                value: _selectedDistrict,
                decoration: const InputDecoration(
                  labelText: 'हरियाणा जिला (District) *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.location_city),
                ),
                items: districts.map((dist) => DropdownMenuItem(value: dist, child: Text(dist))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedDistrict = val);
                },
              ),
              const SizedBox(height: 14),
              // News Title
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'समाचार का शीर्षक (Headline) *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.title),
                ),
                maxLines: 2,
                validator: (val) => val == null || val.length < 5 ? 'शीर्षक कम से कम 5 अक्षरों का होना चाहिए' : null,
              ),
              const SizedBox(height: 14),
              // News Content
              TextFormField(
                controller: _contentController,
                decoration: const InputDecoration(
                  labelText: 'समाचार का पूरा विवरण (Detailed Story) *',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 6,
                validator: (val) => val == null || val.length < 15 ? 'विवरण कम से कम 15 अक्षरों का होना चाहिए' : null,
              ),
              const SizedBox(height: 14),
              // Optional Image URL
              TextFormField(
                controller: _imageUrlController,
                decoration: const InputDecoration(
                  labelText: 'फोटो लिंक (Image URL - वैकल्पिक)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.image),
                ),
              ),
              const SizedBox(height: 20),
              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitNews,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.pressRed,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'समाचार सबमिट करें (Submit News)',
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
}
