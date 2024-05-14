import 'package:flutter/material.dart';
import 'package:sign_in_button/sign_in_button.dart';
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/core/cubit/navigator_cubit.dart';
import 'package:tanya/core/ioc.dart';

class LoginWidget extends StatefulWidget {
  const LoginWidget({super.key});

  @override
  State<LoginWidget> createState() => _LoginWidgetState();
}

class _LoginWidgetState extends State<LoginWidget> {
  @override
  void initState() {
    locator.get<AuthCubit>().stream.listen((event) {
      if (event is UserReady) {
        locator.get<NavigatorCubit>().showMainFeed(context);
      } else if (event is UserLogedOut) {
        locator.get<NavigatorCubit>().showMainFeed(context);
      }
    });
    locator.get<AuthCubit>().init();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          color: Colors.white,
          width: double.infinity,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                'התחבר:',
                style: TextStyle(color: Colors.black54),
              ),
              SignInButton(
                Buttons.google,
                onPressed: () {
                  locator.get<AuthCubit>().loginGoogle();
                },
              ),
              SignInButton(
                Buttons.facebook,
                onPressed: () {
                  locator.get<NavigatorCubit>().showMainFeed(context);
                },
              )
            ],
          ),
        ),
      ),
    );
  }
}
