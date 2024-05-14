part of 'loading_cubit.dart';

abstract class LoadingState extends Equatable {
  const LoadingState();

  @override
  List<Object> get props => [];
}

class LoadingInitial extends LoadingState {}

class LoadingStateChanged extends LoadingState {
  final bool loading;
  String? text;
  LoadingStateChanged({
    required this.loading,
    this.text = '',
  });

  @override
  List<Object> get props => text != null ? [loading, text!] : [loading];
}
