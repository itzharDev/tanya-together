part of 'auth_cubit.dart';

@immutable
sealed class AuthState {}

final class AuthInitial extends AuthState {}

final class UserLogedIn extends AuthState {}

final class UserLogedOut extends AuthState {}

final class UserReady extends AuthState {
  final ParseUser user;
  UserReady(this.user);
}
