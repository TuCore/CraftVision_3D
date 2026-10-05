import 'package:flutter/material.dart';

class ProductImageGallery extends StatefulWidget {
  final String heroTag;
  final String imageUrl;

  const ProductImageGallery({
    super.key,
    required this.heroTag,
    required this.imageUrl,
  });

  @override
  State<ProductImageGallery> createState() => _ProductImageGalleryState();
}

class _ProductImageGalleryState extends State<ProductImageGallery> {
  late final PageController _pageController;
  int _currentIndex = 0;
  
  // Mock multiple images for the gallery
  late final List<String> _images;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _images = [
      widget.imageUrl,
      'https://picsum.photos/400/600?random=${widget.heroTag.hashCode + 1}',
      'https://picsum.photos/400/600?random=${widget.heroTag.hashCode + 2}',
    ];
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.55,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() => _currentIndex = index);
            },
            itemCount: _images.length,
            itemBuilder: (context, index) {
              final child = Image.network(
                _images[index],
                fit: BoxFit.cover,
              );
              // Only apply Hero to the first image
              if (index == 0) {
                return Hero(
                  tag: widget.heroTag,
                  child: child,
                );
              }
              return child;
            },
          ),
          // Page indicators
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _images.length,
                (index) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _currentIndex == index ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentIndex == index 
                        ? Colors.white 
                        : Colors.white.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(4),
                    boxShadow: const [
                      BoxShadow(color: Colors.black26, blurRadius: 4),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
