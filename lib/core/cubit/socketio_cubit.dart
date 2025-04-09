import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/core/ioc.dart';

part 'socketio_state.dart';

class SocketioCubit extends Cubit<SocketioState> {
  SocketioCubit() : super(SocketioInitial());

  bool initilized = false;
  int connections = -1;
  int members = -1;
  void init() {
    if (initilized) {
      return;
    }
    initilized = true;
    IO.Socket socket =
        IO.io('https://tanya.dvarmalchus.co.il', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
      'query': {'user': locator.get<AuthCubit>().currentUser!.objectId}
    });

    // IO.Socket socket = IO.io('http://localhost:3001', <String, dynamic>{
    //   'transports': ['websocket'],
    //   'autoConnect': true,
    //   'query': {'user': locator.get<AuthCubit>().currentUser!.objectId}
    // });

    socket.connect();

    // socket.onConnect((_) {
    // });
    // socket.on('event', (data) => print(data));
    socket.on('message', (data) {
      if (data['type'] == 'connectionsCounter') {
        connections = data['value'];
        emitCounters();
      }
    });

    socket.onDisconnect((_) => print('disconnect'));
    // socket.on('fromServer', (_) => print(_));
  }

  getUserCount() async {
    // var response = await ParseConfig().getConfigs();

    QueryBuilder<ParseObject> queryBuilder =
        QueryBuilder<ParseObject>(ParseObject('_User'));
    ParseResponse count = await queryBuilder.count();
    members = count.result[0];
    emitCounters();
  }

  emitCounters() {
    if (connections != -1 && members != -1) {
      emit(SocketioConnectionsUpdated(connections, members));
    }
  }
}
