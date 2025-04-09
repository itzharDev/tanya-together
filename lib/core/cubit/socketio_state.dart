part of 'socketio_cubit.dart';

sealed class SocketioState extends Equatable {
  const SocketioState();

  @override
  List<Object> get props => [];
}

final class SocketioInitial extends SocketioState {}

final class SocketioConnectionsUpdated extends SocketioState {
  final int connections;
  final int members;
  const SocketioConnectionsUpdated(this.connections, this.members);
  @override
  // TODO: implement props
  List<Object> get props => [DateTime.now()];
}
