import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'loading_state.dart';

class LoadingCubit extends Cubit<LoadingState> {
  var _loading = false;
  LoadingCubit() : super(LoadingInitial());

  void setLoading(bool loading, {String? text}) {
    _loading = loading;
    emit(LoadingStateChanged(loading: _loading, text: text));
  }
}
