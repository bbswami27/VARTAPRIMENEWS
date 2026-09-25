import 'dart:math' as math;
import 'package:flutter/material.dart';

class WavingFlagWidget extends StatefulWidget {
  final double width;
  final double height;

  const WavingFlagWidget({
    super.key,
    this.width = 44,
    this.height = 30,
  });

  @override
  State<WavingFlagWidget> createState() => _WavingFlagWidgetState();
}

class _WavingFlagWidgetState extends State<WavingFlagWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Golden Flag Pole
        Container(
          width: 3.5,
          height: widget.height + 14,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFFFD700), Color(0xFFB8860B), Color(0xFF8B6508)],
            ),
            borderRadius: BorderRadius.circular(2),
            boxShadow: const [
              BoxShadow(color: Colors.black26, blurRadius: 2, offset: Offset(1, 1)),
            ],
          ),
        ),
        // Tricolor Flag Canvas
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform(
              alignment: Alignment.centerLeft,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.002)
                ..rotateY(math.sin(_controller.value * 2 * math.pi) * 0.12),
              child: child,
            );
          },
          child: Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(2),
                bottomRight: Radius.circular(2),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.18),
                  blurRadius: 4,
                  offset: const Offset(2, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                // Saffron
                Expanded(
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFFFF9933),
                      borderRadius: BorderRadius.only(topRight: Radius.circular(2)),
                    ),
                  ),
                ),
                // White with Ashoka Chakra
                Expanded(
                  child: Container(
                    color: Colors.white,
                    alignment: Alignment.center,
                    child: AnimatedBuilder(
                      animation: _controller,
                      builder: (context, child) {
                        return Transform.rotate(
                          angle: _controller.value * 2 * math.pi,
                          child: child,
                        );
                      },
                      child: Container(
                        width: widget.height * 0.28,
                        height: widget.height * 0.28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF000080), width: 1.2),
                        ),
                        child: const Center(
                          child: CircleAvatar(
                            radius: 1.5,
                            backgroundColor: Color(0xFF000080),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                // Green
                Expanded(
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFF138808),
                      borderRadius: BorderRadius.only(bottomRight: Radius.circular(2)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
