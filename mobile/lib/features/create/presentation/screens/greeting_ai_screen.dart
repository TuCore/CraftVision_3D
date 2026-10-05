import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_ai_bubble.dart';

class GreetingAiScreen extends StatefulWidget {
  const GreetingAiScreen({super.key});

  @override
  State<GreetingAiScreen> createState() => _GreetingAiScreenState();
}

class _GreetingAiScreenState extends State<GreetingAiScreen> {
  final TextEditingController _promptController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'isUser': false,
      'text': 'Chào bạn, mình có thể giúp bạn viết thiệp. Bạn muốn giọng văn lãng mạn, hài hước hay trang trọng?',
    }
  ];
  bool _isTyping = false;

  void _sendMessage() {
    final text = _promptController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.insert(0, {'isUser': true, 'text': text});
      _isTyping = true;
    });
    _promptController.clear();

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.insert(0, {
            'isUser': false,
            'text': '"Chúc mừng sinh nhật em! Chúc em tuổi mới luôn xinh đẹp, rạng rỡ và hạnh phúc bên anh nhé. Yêu em!"\n\nBạn có muốn đổi giọng điệu hài hước hơn không?',
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Greeting AI')),
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
                      hintText: 'Nhập yêu cầu viết thiệp...',
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
                  backgroundColor: AppColors.surfaceTint,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: AppColors.neutral900, size: 20),
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
