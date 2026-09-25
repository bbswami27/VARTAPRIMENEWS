import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class HaryanaDistrictsBar extends StatelessWidget {
  final String selectedDistrict;
  final Function(String) onDistrictSelected;

  static const List<String> haryanaDistricts = [
    'सभी जिले',
    'अम्बाला',
    'भिवानी',
    'चरखी दादरी',
    'फरीदाबाद',
    'फतेहाबाद',
    'गुरुग्राम',
    'हिसार',
    'झज्जर',
    'जींद',
    'कैथल',
    'करनाल',
    'कुरुक्षेत्र',
    'महेंद्रगढ़',
    'नूंह',
    'पलवल',
    'पंचकूला',
    'पानीपत',
    'रेवाड़ी',
    'रोहतक',
    'सिरसा',
    'सोनीपत',
    'यमुनानगर',
  ];

  const HaryanaDistrictsBar({
    super.key,
    required this.selectedDistrict,
    required this.onDistrictSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).cardTheme.color ?? AppTheme.paperCard,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: AppTheme.pressRed),
                const SizedBox(width: 4),
                Text(
                  'हरियाणा (सभी 22 जिले):',
                  style: GoogleFonts.hind(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.navy,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 34,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: haryanaDistricts.length,
              separatorBuilder: (context, index) => const SizedBox(width: 6),
              itemBuilder: (context, index) {
                final district = haryanaDistricts[index];
                final isSelected = selectedDistrict == district ||
                    (selectedDistrict == 'सभी' && district == 'सभी जिले');

                return GestureDetector(
                  onTap: () => onDistrictSelected(district == 'सभी जिले' ? 'सभी' : district),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.pressRed : Colors.transparent,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? AppTheme.pressRed : AppTheme.borderLine,
                        width: 1,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      district,
                      style: GoogleFonts.hind(
                        fontSize: 12.5,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected
                            ? Colors.white
                            : (Theme.of(context).brightness == Brightness.dark
                                ? Colors.white70
                                : AppTheme.inkSoft),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
