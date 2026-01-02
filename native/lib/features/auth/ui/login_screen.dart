import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/utils/validators.dart';
import '../providers/auth_providers.dart';
import 'register_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _animate = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        setState(() => _animate = true);
      }
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    final success = await ref.read(authControllerProvider.notifier).login(
          emailOrUsername: _emailController.text.trim(),
          password: _passwordController.text,
        );
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (!success) {
      final error = ref.read(authControllerProvider).errorMessage ?? 'Login gagal';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() => _isLoading = true);
    final success = await ref.read(authControllerProvider.notifier).loginWithGoogle();
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (!success) {
      final error = ref.read(authControllerProvider).errorMessage ?? 'Login Google gagal';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isCompact = size.width < 380 || size.height < 700;
    final gradient = const LinearGradient(
      colors: [Color(0xFF00D17A), Color(0xFF00A3FF)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );

    return Scaffold(
      body: Stack(
        children: [
          Container(decoration: BoxDecoration(gradient: gradient)),
          Positioned(
            top: -80,
            right: -60,
            child: _GlowBlob(
              size: 220,
              colors: const [Color(0xFF64FFDA), Color(0xFF40C4FF)],
              opacity: 0.35,
            ),
          ),
          Positioned(
            bottom: -120,
            left: -40,
            child: _GlowBlob(
              size: 260,
              colors: const [Color(0xFF00C853), Color(0xFF18FFFF)],
              opacity: 0.25,
            ),
          ),
          
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: isCompact ? 20 : 28,
                  vertical: 24,
                ),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      AnimatedOpacity(
                        opacity: _animate ? 1 : 0,
                        duration: const Duration(milliseconds: 700),
                        child: AnimatedSlide(
                          offset: _animate ? Offset.zero : const Offset(0, 0.12),
                          duration: const Duration(milliseconds: 700),
                          curve: Curves.easeOutCubic,
                          child: Column(
                            children: [
                              Image.asset(
                                'assets/images/logo.png',
                                width: isCompact ? 110 : 140,
                                height: isCompact ? 110 : 140,
                              ),
                              const SizedBox(height: 12),
                              _GradientText(
                                text: 'KaraokeKu',
                                gradient: gradient,
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: isCompact ? 28 : 34,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.4,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Masuk dan mulai panggungmu sekarang.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.manrope(
                                  fontSize: isCompact ? 13 : 15,
                                  color: Colors.white.withValues(alpha: 0.85),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      AnimatedOpacity(
                        opacity: _animate ? 1 : 0,
                        duration: const Duration(milliseconds: 800),
                        child: AnimatedSlide(
                          offset: _animate ? Offset.zero : const Offset(0, 0.18),
                          duration: const Duration(milliseconds: 800),
                          curve: Curves.easeOutCubic,
                          child: _GlassCard(
                            padding: EdgeInsets.all(isCompact ? 20 : 24),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Text(
                                    'Selamat datang kembali',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: isCompact ? 18 : 20,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF0B1D2A),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Login untuk mengakses playlist favoritmu.',
                                    style: GoogleFonts.manrope(
                                      fontSize: 13,
                                      color: const Color(0xFF5F6B7A),
                                    ),
                                  ),
                                  const SizedBox(height: 18),
                                  _StyledField(
                                    controller: _emailController,
                                    label: 'Email atau Username',
                                    icon: Icons.person_outline,
                                    validator: Validators.required,
                                  ),
                                  const SizedBox(height: 14),
                                  _StyledField(
                                    controller: _passwordController,
                                    label: 'Password',
                                    icon: Icons.lock_outline,
                                    obscureText: true,
                                    validator: (value) => Validators.minLength(value, 6),
                                  ),
                                  const SizedBox(height: 22),
                                  _GradientButton(
                                    gradient: gradient,
                                    onPressed: _isLoading ? null : _handleLogin,
                                    child: _isLoading
                                        ? const SizedBox(
                                            width: 20,
                                            height: 20,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                            ),
                                          )
                                        : Text(
                                            'Masuk',
                                            style: GoogleFonts.manrope(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w600,
                                              color: Colors.white,
                                            ),
                                          ),
                                  ),
                                  const SizedBox(height: 12),
                                  OutlinedButton.icon(
                                    onPressed: _isLoading ? null : _handleGoogleLogin,
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF0B1D2A),
                                      side: const BorderSide(color: Color(0xFFDBE7EF)),
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                      backgroundColor: Colors.white,
                                    ),
                                    icon: const Icon(Icons.g_mobiledata, size: 26),
                                    label: Text(
                                      'Login dengan Google',
                                      style: GoogleFonts.manrope(fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  TextButton(
                                    onPressed: _isLoading
                                        ? null
                                        : () {
                                            Navigator.of(context).push(
                                              MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                            );
                                          },
                                    child: Text(
                                      'Belum punya akun? Daftar',
                                      style: GoogleFonts.manrope(
                                        color: const Color(0xFF0B1D2A),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      AnimatedOpacity(
                        opacity: _animate ? 1 : 0,
                        duration: const Duration(milliseconds: 1000),
                        child: Text(
                          'Dengan login, kamu setuju dengan kebijakan layanan KaraokeKu.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.manrope(
                            fontSize: 11,
                            color: Colors.white.withValues(alpha: 0.75),
                          ),
                        ),
                      ),
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

class _GradientText extends StatelessWidget {
  final String text;
  final LinearGradient gradient;
  final TextStyle style;

  const _GradientText({
    required this.text,
    required this.gradient,
    required this.style,
  });

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => gradient.createShader(bounds),
      child: Text(
        text,
        style: style.copyWith(color: Colors.white),
      ),
    );
  }
}

class _GlowBlob extends StatelessWidget {
  final double size;
  final List<Color> colors;
  final double opacity;

  const _GlowBlob({
    required this.size,
    required this.colors,
    required this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: colors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
      ),
    );
  }
}

class _GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

  const _GlassCard({required this.child, required this.padding});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withValues(alpha: 0.6)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}

class _StyledField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final bool obscureText;
  final String? Function(String?)? validator;

  const _StyledField({
    required this.controller,
    required this.label,
    required this.icon,
    this.obscureText = false,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      validator: validator,
      style: GoogleFonts.manrope(fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.manrope(color: const Color(0xFF758296)),
        prefixIcon: Icon(icon, color: const Color(0xFF0B1D2A)),
        filled: true,
        fillColor: const Color(0xFFF4F7FB),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

class _GradientButton extends StatelessWidget {
  final LinearGradient gradient;
  final Widget child;
  final VoidCallback? onPressed;

  const _GradientButton({
    required this.gradient,
    required this.child,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null;
    return Opacity(
      opacity: isDisabled ? 0.6 : 1,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00A3FF).withValues(alpha: 0.35),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: onPressed,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 14),
              child: Center(child: child),
            ),
          ),
        ),
      ),
    );
  }
}
