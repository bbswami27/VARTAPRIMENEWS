import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../models/news_item.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isAuthenticated = false;
  final TextEditingController _pinController = TextEditingController();

  List<NewsItem> _pendingNews = [];
  List<NewsItem> _approvedNews = [];
  bool _isLoading = false;
  bool _autoApprove = false;
  int _totalViews = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  void _verifyPin() {
    if (_pinController.text.trim() == '1234') {
      setState(() {
        _isAuthenticated = true;
      });
      _loadDashboardData();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('गलत PIN! कृपया सही एडमिन पिन दर्ज करें।', style: GoogleFonts.hind()),
          backgroundColor: AppTheme.pressRed,
        ),
      );
    }
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    try {
      // 1. Pending News
      final pendingRes = await http.get(Uri.parse('${ApiService.baseUrl}/admin/pending')).timeout(const Duration(seconds: 15));
      if (pendingRes.statusCode == 200) {
        final decoded = json.decode(utf8.decode(pendingRes.bodyBytes));
        if (decoded['success'] == true && decoded['data'] is List) {
          _pendingNews = (decoded['data'] as List).map((i) => NewsItem.fromJson(i)).toList();
        }
      }

      // 2. Approved News
      final approvedRes = await http.get(Uri.parse('${ApiService.baseUrl}/news?limit=50')).timeout(const Duration(seconds: 15));
      if (approvedRes.statusCode == 200) {
        final decoded = json.decode(utf8.decode(approvedRes.bodyBytes));
        if (decoded['success'] == true && decoded['data'] is List) {
          _approvedNews = (decoded['data'] as List).map((i) => NewsItem.fromJson(i)).toList();
          _totalViews = _approvedNews.fold(0, (sum, item) => sum + item.views);
        }
      }

      // 3. Stats & Auto-Approve
      final statsRes = await http.get(Uri.parse('${ApiService.baseUrl}/admin/stats')).timeout(const Duration(seconds: 15));
      if (statsRes.statusCode == 200) {
        final decoded = json.decode(utf8.decode(statsRes.bodyBytes));
        if (decoded['success'] == true && decoded['data'] != null) {
          _autoApprove = decoded['data']['autoApproveEnabled'] == true;
        }
      }
    } catch (e) {
      // ignore: avoid_print
      print('Admin load error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _approveArticle(String id, {bool isBreaking = false, bool isHero = false}) async {
    try {
      final res = await http.post(
        Uri.parse('${ApiService.baseUrl}/admin/approve/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'isBreaking': isBreaking, 'isHero': isHero}),
      );
      final decoded = json.decode(utf8.decode(res.bodyBytes));
      if (decoded['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ समाचार स्वीकृत और लाइव प्रकाशित कर दिया गया!', style: GoogleFonts.hind()),
            backgroundColor: AppTheme.green,
          ),
        );
        _loadDashboardData();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटि: $e', style: GoogleFonts.hind()), backgroundColor: AppTheme.pressRed),
      );
    }
  }

  Future<void> _rejectArticle(String id) async {
    try {
      final res = await http.post(Uri.parse('${ApiService.baseUrl}/admin/reject/$id'));
      final decoded = json.decode(utf8.decode(res.bodyBytes));
      if (decoded['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('अस्वीकृत कर दिया गया।', style: GoogleFonts.hind()), backgroundColor: Colors.orange),
        );
        _loadDashboardData();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटि: $e', style: GoogleFonts.hind()), backgroundColor: AppTheme.pressRed),
      );
    }
  }

  Future<void> _deleteArticle(String id) async {
    try {
      final res = await http.delete(Uri.parse('${ApiService.baseUrl}/admin/delete/$id'));
      final decoded = json.decode(utf8.decode(res.bodyBytes));
      if (decoded['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('🗑️ समाचार हटा दिया गया।', style: GoogleFonts.hind()), backgroundColor: AppTheme.pressRed),
        );
        _loadDashboardData();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटि: $e', style: GoogleFonts.hind()), backgroundColor: AppTheme.pressRed),
      );
    }
  }

  Future<void> _toggleAutoApprove(bool val) async {
    setState(() => _autoApprove = val);
    try {
      await http.post(
        Uri.parse('${ApiService.baseUrl}/admin/auto-approve'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'enabled': val}),
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(val ? 'AI ऑटो-अप्रूवल सक्रिय किया गया' : 'ऑटो-अप्रूवल बंद किया गया (मैन्युअल मोड)', style: GoogleFonts.hind()),
          backgroundColor: val ? AppTheme.green : AppTheme.navyDark,
        ),
      );
    } catch (_) {}
  }

  Future<void> _run15DayRetention() async {
    try {
      final res = await http.post(Uri.parse('${ApiService.baseUrl}/admin/retention/cleanup'));
      final decoded = json.decode(utf8.decode(res.bodyBytes));
      if (decoded['success'] == true) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: Text('15-दिवसीय रिटेंशन रिपोर्ट', style: GoogleFonts.notoSerifDevanagari()),
            content: Text('${decoded['message'] ?? 'सफलतापूर्वक पुरानी खबरें हटा दी गईं।'}\n\nकुल लाइव खबरें: ${decoded['remainingCount'] ?? _approvedNews.length}', style: GoogleFonts.hind()),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('ठीक है')),
            ],
          ),
        );
        _loadDashboardData();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटि: $e', style: GoogleFonts.hind()), backgroundColor: AppTheme.pressRed),
      );
    }
  }

  Future<void> _cleanupAllPhotos() async {
    try {
      final res = await http.post(Uri.parse('${ApiService.baseUrl}/admin/photos/cleanup'));
      final decoded = json.decode(utf8.decode(res.bodyBytes));
      if (decoded['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ सभी ऑटोमैटिक तस्वीरें हटा दी गईं। टेक्स्ट-ओनली मोड सक्रिय!', style: GoogleFonts.hind()),
            backgroundColor: AppTheme.green,
          ),
        );
        _loadDashboardData();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटि: $e', style: GoogleFonts.hind()), backgroundColor: AppTheme.pressRed),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAuthenticated) {
      return Scaffold(
        appBar: AppBar(
          title: Text('🔐 एडमिन व संपादक लॉगिन', style: GoogleFonts.notoSerifDevanagari(fontSize: 18, fontWeight: FontWeight.w700)),
        ),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.pressRed.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.admin_panel_settings, size: 54, color: AppTheme.pressRed),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'VartaPrime News',
                      style: GoogleFonts.notoSerifDevanagari(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.pressRed),
                    ),
                    Text('मुख्य संपादक व एडमिन डेस्क', style: GoogleFonts.hind(fontSize: 14, color: AppTheme.inkMuted)),
                    const SizedBox(height: 24),
                    TextField(
                      controller: _pinController,
                      obscureText: true,
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 4,
                      style: GoogleFonts.teko(fontSize: 28, letterSpacing: 8),
                      decoration: InputDecoration(
                        hintText: 'PIN (डिफ़ॉल्ट: 1234)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        counterText: '',
                      ),
                      onSubmitted: (_) => _verifyPin(),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.pressRed,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: _verifyPin,
                        icon: const Icon(Icons.login),
                        label: Text('एडमिन पैनल खोलें', style: GoogleFonts.hind(fontSize: 16, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('👑 मुख्य संपादक पोर्टल', style: GoogleFonts.notoSerifDevanagari(fontSize: 18, fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'रिफ्रेश',
            onPressed: _loadDashboardData,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'लॉगआउट',
            onPressed: () => setState(() => _isAuthenticated = false),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.saffron,
          tabs: [
            Tab(icon: const Icon(Icons.pending_actions), text: 'पेंडिंग (${_pendingNews.length})'),
            Tab(icon: const Icon(Icons.check_circle_outline), text: 'लाइव (${_approvedNews.length})'),
            const Tab(icon: Icon(Icons.settings), text: 'सेटिंग्स व स्टोरेज'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.pressRed))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildPendingTab(),
                _buildApprovedTab(),
                _buildSettingsTab(),
              ],
            ),
    );
  }

  Widget _buildPendingTab() {
    if (_pendingNews.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.done_all, size: 64, color: AppTheme.green),
              const SizedBox(height: 12),
              Text('सभी समाचार स्वीकृत हैं!', style: GoogleFonts.notoSerifDevanagari(fontSize: 18, fontWeight: FontWeight.w700)),
              Text('कोई भी नया समाचार समीक्षा के लिए पेंडिंग नहीं है।', style: GoogleFonts.hind(color: AppTheme.inkMuted)),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _pendingNews.length,
        itemBuilder: (context, index) {
          final item = _pendingNews[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.pressRed.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(item.category, style: GoogleFonts.hind(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.pressRed)),
                      ),
                      Text(item.district.isNotEmpty ? '📍 ${item.district}' : '', style: GoogleFonts.hind(fontSize: 12, color: AppTheme.inkMuted)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.title,
                    style: GoogleFonts.notoSerifDevanagari(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  if (item.content.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(item.content, style: GoogleFonts.hind(fontSize: 13, color: AppTheme.inkSoft), maxLines: 3, overflow: TextOverflow.ellipsis),
                  ],
                  const SizedBox(height: 8),
                  Text('रिपोर्टर: ${item.reporterName.isNotEmpty ? item.reporterName : item.source}', style: GoogleFonts.hind(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.navyLight)),
                  const Divider(height: 20),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.green, foregroundColor: Colors.white),
                        onPressed: () => _approveArticle(item.id),
                        icon: const Icon(Icons.check, size: 16),
                        label: const Text('स्वीकृत करें'),
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.saffron, foregroundColor: Colors.white),
                        onPressed: () => _approveArticle(item.id, isBreaking: true),
                        icon: const Icon(Icons.bolt, size: 16),
                        label: const Text('Breaking बनाएं'),
                      ),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.orange),
                        onPressed: () => _rejectArticle(item.id),
                        icon: const Icon(Icons.close, size: 16),
                        label: const Text('अस्वीकृत'),
                      ),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(foregroundColor: AppTheme.pressRed),
                        onPressed: () => _deleteArticle(item.id),
                        icon: const Icon(Icons.delete, size: 16),
                        label: const Text('हटाएं'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildApprovedTab() {
    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _approvedNews.length,
        itemBuilder: (context, index) {
          final item = _approvedNews[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              title: Text(item.title, style: GoogleFonts.notoSerifDevanagari(fontSize: 14.5, fontWeight: FontWeight.w700), maxLines: 2, overflow: TextOverflow.ellipsis),
              subtitle: Text('${item.category} • ${item.district} • 👁️ ${item.views} व्यूज', style: GoogleFonts.hind(fontSize: 12, color: AppTheme.inkMuted)),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline, color: AppTheme.pressRed),
                onPressed: () => _deleteArticle(item.id),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSettingsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Analytics Summary Card
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('📊 पोर्टल टेलीमेट्री व आंकड़े', style: GoogleFonts.notoSerifDevanagari(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatBox('लाइव खबरें', '${_approvedNews.length}', AppTheme.green),
                    _buildStatBox('पेंडिंग', '${_pendingNews.length}', Colors.orange),
                    _buildStatBox('कुल व्यूज', '$_totalViews', AppTheme.blue),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Auto-approval Switch
        Card(
          child: SwitchListTile(
            title: Text('🤖 AI ऑटो-अप्रूवल मोड', style: GoogleFonts.hind(fontWeight: FontWeight.w700)),
            subtitle: Text('सत्यापित RSS और विश्वसनीय संवाददाताओं की खबरों को तुरंत लाइव करें', style: GoogleFonts.hind(fontSize: 12, color: AppTheme.inkMuted)),
            value: _autoApprove,
            activeColor: AppTheme.green,
            onChanged: _toggleAutoApprove,
          ),
        ),
        const SizedBox(height: 12),

        // 15-Day Retention Clean
        Card(
          child: ListTile(
            leading: const Icon(Icons.calendar_month, color: AppTheme.navyDark),
            title: Text('🧹 15-दिवसीय स्टोरेज रिटेंशन चलाएं', style: GoogleFonts.hind(fontWeight: FontWeight.w700)),
            subtitle: Text('15 दिनों से पुरानी खबरों को डेटाबेस से सुरक्षित हटाएं', style: GoogleFonts.hind(fontSize: 12, color: AppTheme.inkMuted)),
            trailing: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.navyDark, foregroundColor: Colors.white),
              onPressed: _run15DayRetention,
              child: const Text('क्लीन करें'),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Photo Cleanup (Text-only policy)
        Card(
          child: ListTile(
            leading: const Icon(Icons.image_not_supported, color: AppTheme.pressRed),
            title: Text('🖼️ सभी फोटो हटाएं (टेक्स्ट-ओनली मोड)', style: GoogleFonts.hind(fontWeight: FontWeight.w700)),
            subtitle: Text('डिफ़ॉल्ट और स्टॉक तस्वीरों को हटाकर ऐप व वेबसाइट को सुपर लाइटवेट रखें', style: GoogleFonts.hind(fontSize: 12, color: AppTheme.inkMuted)),
            trailing: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.pressRed, foregroundColor: Colors.white),
              onPressed: _cleanupAllPhotos,
              child: const Text('हटाएं'),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.teko(fontSize: 32, fontWeight: FontWeight.w700, color: color)),
        Text(label, style: GoogleFonts.hind(fontSize: 12, color: AppTheme.inkMuted)),
      ],
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pinController.dispose();
    super.dispose();
  }
}
