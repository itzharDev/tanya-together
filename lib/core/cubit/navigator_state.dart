part of 'navigator_cubit.dart';

abstract class NavigatorState {}

class NavigatorInitial extends NavigatorState {}

class LogOut extends NavigatorState {}

class RefreshApp extends NavigatorState {}

class UserStateChanged extends NavigatorState {
  @override
  List<Object> get props => [DateTime.now()];
}
