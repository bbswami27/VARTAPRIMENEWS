import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class CitizenReporterScreen extends StatefulWidget {
  const CitizenReporterScreen({super.key});

  @override
  State<CitizenReporterScreen> createState() => _CitizenReporterScreenState();
}

class _CitizenReporterScreenState extends State<CitizenReporterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _locationController = TextEditingController();

  String _selectedCategory = 'नागरिक समस्या';
  String _selectedDistrict = 'पानीपत';
  bool _isSubmitting = false;

  static const List<String> categories = [
    'नागरिक समस्या',
    'सड़क व यातायात',
    'जलभराव व सीवरेज',
    'बिजली संकट',
    'स्वास्थ्य व अस्पताल',
    'स्कूल व शिक्षा',
    'विकास कार्य',
    'पर्यावरण व प्रदूषण',
    'अन्य जनहित मुद्दा',
  ];

  static const List<String> districts = [
    'अम्बाला', 'भिवानी', 'चरखी दादरी', 'फरीदाबाद', 'फतेहाबाद', 'गुरुग्राम',
    'हिसार', 'झज्जर', 'जींद', 'कैथल', 'करनाल', 'कुरुक्षेत्र',
    'महेंद्रगढ़', 'नूंह', 'पलवल', 'पंचकूला', 'पानीपत', 'रेवाड़ी',
    'रोहतक', 'सिरसा', 'सोनीपत', 'यमुनानगर', 'दिल्ली-एनसीआर', 'अन्य',
  ];

  Future<void> _submitCitizenReport() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final contentWithCitizenMeta = '''
${_contentController.text.trim()}

------------------------------------------------
📢 सिटीजन रिपोर्टर विवरण:
नाम: ${_nameController.text.trim()}
संपर्क/WhatsApp: ${_phoneController.text.trim()}
स्थान: ${_locationController.text.trim().isNotEmpty ? _locationController.text.trim() : _selectedDistrict}
''';

    final res = await ApiService.submitReporterNews(
      title: '📢 [जनहित मुद्दा] ${_titleController.text.trim()}',
      content: contentWithCitizenMeta,
      category: 'हरियाणा',
      state: 'हरियाणा',
      district: _selectedDistrict,
      reporterName: '${_nameController.text.trim()} (सिटीजन रिपोर्टर)',
      imageurl: '',
    );

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (res['success'] == true) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: Text('धन्यवाद! आवाज़ पहुंच गई', style: GoogleFonts.notoSerifDevanagari(color: AppTheme.green)),
            content: Text(
              'आपकी समस्या और ग्राउंड रिपोर्ट वार्ताप्राइम न्यूज़ डेस्क को प्राप्त हो गई है। हमारी संपादकीय टीम इसे सत्यापित कर प्रमुखता से प्रकाशित करेगी।',
              style: GoogleFonts.hind(),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  _titleController.clear();
                  _contentController.clear();
                },
                child: const Text('ठीक है'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res['message'] ?? 'त्रुटि हुई।'), backgroundColor: AppTheme.pressRed),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('📢 सिटीजन रिपोर्टर (जनता की आवाज़)', style: GoogleFonts.notoSerifDevanagari(fontSize: 18, fontWeight: FontWeight.w700)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Card(
                color: AppTheme.pressRed.withOpacity(0.08),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      const Icon(Icons.record_voice_over, size: 40, color: AppTheme.pressRed),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'अपने क्षेत्र की समस्या हमें बताएं',
                              style: GoogleFonts.notoSerifDevanagari(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.pressRed),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'सड़क, बिजली, पानी या जनहित के किसी भी मुद्दे की ग्राउंड रिपोर्ट भेजें।',
                              style: GoogleFonts.hind(fontSize: 12.5, color: AppTheme.inkSoft),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Citizen Name
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'आपका नाम (Citizen Name) *',
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (v) => v == null || v.trim().isEmpty ? 'कृपया अपना नाम दर्ज करें' : null,
              ),
              const SizedBox(height: 14),

              // Phone / WhatsApp
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'मोबाइल नंबर / WhatsApp *',
                  prefixIcon: Icon(Icons.phone),
                ),
                validator: (v) => v == null || v.trim().length < 10 ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : null,
              ),
              const SizedBox(height: 14),

              // District & Category Row
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedDistrict,
                      decoration: const InputDecoration(labelText: 'जिला (District) *', prefixIcon: Icon(Icons.location_on)),
                      items: districts.map((d) => DropdownMenuItem(value: d, child: Text(d, style: GoogleFonts.hind()))).toList(),
                      onChanged: (v) => setState(() => _selectedDistrict = v!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedCategory,
                      decoration: const InputDecoration(labelText: 'समस्या का प्रकार *', prefixIcon: Icon(Icons.category)),
                      items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: GoogleFonts.hind(), overflow: TextOverflow.ellipsis))).toList(),
                      onChanged: (v) => setState(() => _selectedCategory = v!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Location / Colony Name
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'सटीक स्थान / कॉलोनी / गांव (Exact Location)',
                  prefixIcon: Icon(Icons.place),
                  hintText: 'उदा: मॉडल टाउन, वार्ड नं. 12, पानीपत',
                ),
              ),
              const SizedBox(height: 14),

              // Issue Headline
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'समस्या का शीर्षक (Issue Headline) *',
                  hintText: 'उदा: मुख्य सड़क पर 2 महीने से सीवर ओवरफ्लो...',
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (v) => v == null || v.trim().isEmpty ? 'कृपया शीर्षक दर्ज करें' : null,
              ),
              const SizedBox(height: 14),

              // Full Content
              TextFormField(
                controller: _contentController,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'समस्या का पूरा विवरण (Detailed Description) *',
                  hintText: 'समस्या कब से है, प्रशासन को शिकायत की या नहीं, लोगों को क्या परेशानी हो रही है...',
                  alignLabelWithHint: true,
                ),
                validator: (v) => v == null || v.trim().length < 20 ? 'कृपया कम से कम 20 अक्षरों में पूरा विवरण लिखें' : null,
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.pressRed,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: _isSubmitting ? null : _submitCitizenReport,
                  icon: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.send),
                  label: Text(
                    _isSubmitting ? 'भेजा जा रहा है...' : 'संपादकीय टीम को भेजें ➔',
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
    _nameController.dispose();
    _phoneController.dispose();
    _titleController.dispose();
    _contentController.dispose();
    _locationController.dispose();
    super.dispose();
  }
}
