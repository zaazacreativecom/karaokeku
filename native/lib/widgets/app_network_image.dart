import 'package:flutter/material.dart';

class AppNetworkImage extends StatelessWidget {
  final String? url;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final IconData fallbackIcon;
  final Color? backgroundColor;

  const AppNetworkImage({
    super.key,
    required this.url,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.fallbackIcon = Icons.image_not_supported,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      color: backgroundColor ?? Colors.grey.shade300,
      alignment: Alignment.center,
      child: Icon(fallbackIcon, color: Colors.grey.shade700),
    );

    final image = (url == null || url!.trim().isEmpty)
        ? fallback
        : Image.network(
            url!,
            width: width,
            height: height,
            fit: fit,
            errorBuilder: (_, __, ___) => fallback,
          );

    Widget content = image;
    if (width != null || height != null) {
      content = SizedBox(width: width, height: height, child: image);
    }
    if (borderRadius != null) {
      content = ClipRRect(borderRadius: borderRadius!, child: content);
    }

    return content;
  }
}
