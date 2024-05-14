import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/core/cubit/loading_cubit.dart';
import 'package:tanya/core/cubit/navigator_cubit.dart';
import 'package:tanya/feed/cubit/feed_cubit.dart';

final locator = GetIt.instance;

Future<void> setupLocator({bool? firstSetup = true}) async {
  final dio = Dio();
  locator.registerSingleton<FeedCubit>(FeedCubit());
  locator.registerSingleton<NavigatorCubit>(NavigatorCubit());
  locator.registerSingleton<AuthCubit>(AuthCubit());
  locator.registerSingleton<LoadingCubit>(LoadingCubit());
}
