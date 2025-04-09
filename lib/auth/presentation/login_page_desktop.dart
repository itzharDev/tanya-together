import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/core/consts/assets.dart';
import 'package:tanya/core/cubit/navigator_cubit.dart';
import 'package:tanya/core/ioc.dart';
import 'package:tanya/core/size_config.dart';

class DesktopLoginWidget extends StatefulWidget {
  const DesktopLoginWidget({super.key});

  @override
  State<DesktopLoginWidget> createState() => _DesktopLoginWidgetState();
}

class _DesktopLoginWidgetState extends State<DesktopLoginWidget> {
  double formWidth = 300;
  @override
  void initState() {
    locator.get<AuthCubit>().stream.listen((event) {
      if (event is UserReady) {
        locator.get<NavigatorCubit>().showMainFeed(context);
      }
    });
    locator.get<AuthCubit>().init();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0x08003A92),
              Color(0xFFE9F4FF),
              Color(0xFFE9F4FF),
              Color(0xFFE9F4FF),
              Color(0xFFE9F4FF),
              Color(0xFFE9F4FF),
            ],
          ),
        ),
        width: double.infinity,
        padding: const EdgeInsets.all(10),
        child: Column(
          textDirection: TextDirection.rtl,
          children: [
            Image.asset(
              TanyaIcons.big_logo,
              width: SizeConfig.screenWidth * 0.2,
            ),
            Text(
              'ברוכים הבאים לתניא המחולק',
              style: GoogleFonts.assistant(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF04478E),
                  fontSize: 20),
            ),
            const SizedBox(
              height: 25,
            ),
            SizedBox(
              width: formWidth,
              child: TextField(
                onChanged: (value) {
                  locator.get<AuthCubit>().userName = value;
                },
                textDirection: TextDirection.rtl,
                textAlign: TextAlign.right,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.grey),
                  ),
                  labelText: 'מה שמך? (אפשר גם כינוי)',
                  labelStyle: TextStyle(),
                ),
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            SizedBox(
              width: formWidth,
              child: TextField(
                onChanged: (value) {
                  locator.get<AuthCubit>().loginPoneNumber = value;
                },
                textDirection: TextDirection.rtl,
                textAlign: TextAlign.right,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.grey),
                  ),
                  labelText: 'מספר פלאפון?',
                ),
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            BlocBuilder<AuthCubit, AuthState>(
              bloc: locator.get(),
              buildWhen: (previous, current) => current is OtpSent,
              builder: (context, state) {
                if (state is OtpSent) {
                  return SizedBox(
                    width: formWidth,
                    child: TextField(
                      onChanged: (value) {
                        locator.get<AuthCubit>().otp = value;
                      },
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.grey),
                        ),
                        labelText: 'קוד אימות',
                      ),
                    ),
                  );
                } else {
                  return const SizedBox();
                }
              },
            ),
            BlocBuilder<AuthCubit, AuthState>(
              bloc: locator.get(),
              buildWhen: (previous, current) => current is OtpSent,
              builder: (context, state) {
                return SizedBox(
                  height: state is OtpSent ? 20 : 0,
                );
              },
            ),
            SizedBox(
              width: formWidth,
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 1,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(
                    width: 10,
                  ),
                  const Text('או'),
                  const SizedBox(
                    width: 10,
                  ),
                  Expanded(
                    child: Container(
                      height: 1,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            SizedBox(
              width: formWidth,
              child: OutlinedButton(
                onPressed: () {
                  locator.get<AuthCubit>().loginGoogle();
                },
                style: ButtonStyle(
                  shape: WidgetStateProperty.all(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(5.0),
                    ),
                  ),
                  side: WidgetStateProperty.all(
                    const BorderSide(
                        color: Colors.grey), // Set the border color here
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(
                        TanyaIcons.google,
                        height: 20,
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        "התחבר/י באמצעות Google",
                        style: TextStyle(color: Colors.black, fontSize: 17),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(
              width: formWidth,
              child: Center(
                child: Row(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(0),
                      child: Checkbox(
                        visualDensity:
                            const VisualDensity(horizontal: -4, vertical: -4),
                        value: true,
                        activeColor: const Color(0xFF04478E),
                        onChanged: (value) {},
                      ),
                    ),
                    Text(
                      'קראתי ואני מאשר/ת את',
                      style: GoogleFonts.assistant(
                          color: const Color(0xFF262626), fontSize: 13),
                    ),
                    const Text(' '),
                    Text(
                      'מדיניות ותנאי השימוש',
                      style: GoogleFonts.assistant(
                          decoration: TextDecoration.underline,
                          color: const Color(0xFF262626),
                          fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            SizedBox(
              width: formWidth,
              child: TextButton(
                style: ButtonStyle(
                  shape: WidgetStateProperty.all<OutlinedBorder>(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3.0),
                    ),
                  ),
                  backgroundColor:
                      WidgetStateProperty.all<Color>(const Color(0xff027EC5)),
                ),
                onPressed: () {
                  locator.get<AuthCubit>().loginWithPhone();
                },
                child: BlocBuilder<AuthCubit, AuthState>(
                  bloc: locator.get(),
                  buildWhen: (previous, current) => current is OtpSent,
                  builder: (context, state) {
                    return Text(
                      state is OtpSent ? 'אמת קוד' : 'בואו נתחיל',
                      style: GoogleFonts.assistant(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(
              height: 40,
            ),
          ],
        ),
      ),
    );
  }
}
