import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_ai_bubble.dart';

class GiftAiScreen extends StatefulWidget {
  const GiftAiScreen({super.key});

  @override
  State<GiftAiScreen> createState() => _GiftAiScreenState();
}

class _GiftAiScreenState extends State<GiftAiScreen> {
  final TextEditingController _promptController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;

  void _sendMessage() {
    final text = _promptController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.insert(0, {'isUser': true, 'text': text});
      _isTyping = true;
    });
    _promptController.clear();

    // Fake AI Delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.insert(0, {
            'isUser': false,
            'text': 'Đây là một số gợi ý quà 3D cho "$text":\n1. Hộp pha lê khắc 3D hoa hồng tinh xảo.\n2. Hộp đèn cung hoàng đạo để bàn.\nBạn thích gợi ý nào hơn?',
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gift AI')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: true,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (_isTyping && index == 0) {
                  return const Padding(
                    padding: EdgeInsets.only(bottom: 16),
                    child: CvAiBubble(state: CvAiBubbleState.thinking),
                  );
                }
                
                final msgIndex = _isTyping ? index - 1 : index;
                final msg = _messages[msgIndex];
                final isUser = msg['isUser'] as bool;
                
                if (isUser) {
                  return Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 16, left: 48),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.neutral200,
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                          bottomLeft: Radius.circular(16),
                        ),
                      ),
                      child: Text(msg['text'] as String, style: AppTypography.bodyMedium),
                    ),
                  );
                } else {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: CvAiBubble(state: CvAiBubbleState.response, text: msg['text'] as String),
                  );
                }
              },
            ),
          ),
          
          // Input Area
          Container(
            padding: const EdgeInsets.all(16).copyWith(bottom: MediaQuery.of(context).padding.bottom + 16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                )
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _promptController,
                    decoration: InputDecoration(
                      hintText: 'Mô tả người nhận (VD: Bạn gái 20 tuổi thích chó)...',
                      hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.neutral400),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: AppColors.neutral200,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: AppColors.white, size: 20),
                    onPressed: _sendMessage,
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
