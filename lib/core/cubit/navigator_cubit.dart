import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:tanya/auth/presentation/login_page.dart';
import 'package:tanya/feed/group.dart';
import 'package:tanya/feed/presentation/feed.dart';
import 'package:tanya/feed/presentation/reader_view.dart';

part 'navigator_state.dart';

class NavigatorCubit extends Cubit<NavigatorState> {
  NavigatorCubit() : super(NavigatorInitial());

  void showMainFeed(BuildContext context) {
    Navigator.pushReplacement(
        context,
        MaterialPageRoute<void>(
            builder: (BuildContext context) => const MainFeedWidget()));
  }

  void showLoginPage(BuildContext context) {
    Navigator.pushReplacement(
        context,
        MaterialPageRoute<void>(
            builder: (BuildContext context) => const LoginWidget()));
  }

  void showPdfReader(BuildContext context, Group group) {
    Navigator.push(
        context,
        MaterialPageRoute<void>(
            builder: (BuildContext context) => ReaderViewWidget(group)));
  }

  void showLoginScreen(BuildContext context) {
    Navigator.pushReplacement(
        context,
        MaterialPageRoute<void>(
            builder: (BuildContext context) => const LoginWidget()));
  }
}
