import 'package:flutter/material.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/mock_data.dart';
import '../../../../core/widgets/cv_product_card.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;

  final List<String> _suggestions = [
    'Gợi ý quà sinh nhật',
    'Quà dưới 300k',
    'Viết lời chúc',
  ];

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.insert(0, {'isUser': true, 'text': text});
      _isTyping = true;
    });
    _controller.clear();

    // Mock AI Response
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.insert(0, {
          'isUser': false,
          'text': 'Dưới đây là một số gợi ý quà tặng phù hợp nhé!',
          'product': MockData.products[0], // Attached product
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const CvTopBar(
        title: 'CraftVision AI',
        showCart: false,
      ),
      body: Column(
        children: [
          // Suggestions (only show if few messages)
          if (_messages.length <= 2)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: Colors.white,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _suggestions.map((s) => _buildSuggestionChip(s)).toList(),
                ),
              ),
            ),
          
          Expanded(
            child: _messages.isEmpty && !_isTyping
                ? Center(
                    child: Text(
                      'Bạn muốn bắt đầu từ đâu?',
                      style: AppTypography.heading1.copyWith(fontSize: 28),
                      textAlign: TextAlign.center,
                    ),
                  )
                : ListView.builder(
                    reverse: true,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length + (_isTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (_isTyping && index == 0) {
                        return _buildTypingIndicator();
                      }
                      
                      final msgIndex = _isTyping ? index - 1 : index;
                      final msg = _messages[msgIndex];
                      return _buildMessageBubble(msg);
                    },
                  ),
          ),
          
          // Input Area
          Container(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 96),
            color: Colors.white,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: AppColors.neutral300, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.05),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    margin: const EdgeInsets.only(bottom: 2),
                    decoration: const BoxDecoration(
                      color: AppColors.neutral100,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.add, color: AppColors.neutral900),
                      onPressed: () {},
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      minLines: 1,
                      maxLines: 5,
                      style: AppTypography.bodyMedium,
                      decoration: const InputDecoration(
                        hintText: 'Hỏi bất cứ điều gì...',
                        filled: false,
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 16),
                        border: InputBorder.none,
                      ),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    margin: const EdgeInsets.only(bottom: 2),
                    decoration: const BoxDecoration(
                      color: AppColors.neutral100,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.mic_none, color: AppColors.neutral900),
                      onPressed: () {},
                    ),
                  ),
                  const SizedBox(width: 6),
                  ValueListenableBuilder<TextEditingValue>(
                    valueListenable: _controller,
                    builder: (context, value, child) {
                      final hasText = value.text.trim().isNotEmpty;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 2),
                        decoration: const BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          icon: Icon(
                            hasText ? Icons.arrow_upward : Icons.graphic_eq, 
                            color: Colors.white
                          ),
                          onPressed: () {
                            if (hasText) {
                              _sendMessage(_controller.text);
                            }
                          },
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionChip(String text) {
    return _GradientChip(
      text: text,
      onTap: () => _sendMessage(text),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg) {
    final isUser = msg['isUser'] as bool;
    final text = msg['text'] as String;
    final product = msg['product']; // optional

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            const CircleAvatar(
              backgroundColor: Colors.transparent,
              child: Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isUser ? AppColors.neutral900 : const Color(0xFFFFE5D9),
                    borderRadius: BorderRadius.circular(16).copyWith(
                      bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                      bottomLeft: !isUser ? Radius.zero : const Radius.circular(16),
                    ),
                  ),
                  child: Text(
                    text,
                    style: AppTypography.bodyMedium.copyWith(
                      color: isUser ? AppColors.white : AppColors.neutral900,
                    ),
                  ),
                ),
                if (product != null) ...[
                  const SizedBox(height: 8),
                  SizedBox(
                    width: 200,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.neutral300),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(product.imageUrl, width: double.infinity, height: 120, fit: BoxFit.cover),
                          ),
                          const SizedBox(height: 8),
                          Text(product.name, style: AppTypography.bodyMedium, maxLines: 1),
                          Text('${product.price.toStringAsFixed(0)} đ', style: AppTypography.priceText),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (isUser) const SizedBox(width: 40), // spacer for user messages
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          const CircleAvatar(
            backgroundColor: Colors.transparent,
            child: Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFE5D9),
              borderRadius: BorderRadius.circular(16).copyWith(bottomLeft: Radius.zero),
            ),
            child: const Text('...', style: TextStyle(color: AppColors.neutral600, fontSize: 24, letterSpacing: 2)),
          ),
        ],
      ),
    );
  }
}

class _GradientChip extends StatefulWidget {
  final String text;
  final VoidCallback onTap;

  const _GradientChip({required this.text, required this.onTap});

  @override
  State<_GradientChip> createState() => _GradientChipState();
}

class _GradientChipState extends State<_GradientChip> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) {
          setState(() => _isPressed = false);
          widget.onTap();
        },
        onTapCancel: () => setState(() => _isPressed = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: _isPressed ? null : Colors.white,
            gradient: _isPressed ? AppColors.primaryGradient : null,
            borderRadius: BorderRadius.circular(100),
            border: _isPressed ? null : Border.all(color: AppColors.primary, width: 1.5),
          ),
          child: Text(
            widget.text,
            style: AppTypography.bodySmall.copyWith(
              color: _isPressed ? Colors.white : AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
