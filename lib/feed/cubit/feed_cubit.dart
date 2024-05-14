import 'dart:math';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/feed/group.dart';

part 'feed_state.dart';

class FeedCubit extends Cubit<FeedState> {
  FeedCubit() : super(FeedInitial());
  DatabaseReference ref = FirebaseDatabase.instance.ref();

  void getGroups() async {
    // final databaseReference = await ref.child('groups');
    final databaseReferenceUsers = await ref.child('users');

    var apiResponse = await ParseObject('Groups').getAll();

    // .equalTo(10);

// Retrieve data
    Map<dynamic, dynamic>? usersMap = {};
    // DatabaseEvent dataSnapshot = await databaseReference.once();
    DatabaseEvent dataSnapshotUsers = await databaseReferenceUsers.once();
    dataSnapshotUsers.snapshot.children.forEach(
      (element) {
        Map<dynamic, dynamic>? dataMap = element.value as Map?;
        // print(dataMap);
        var usr = ParseObject('FirebaseUsers')
          ..set('anonymous', dataMap!['anonymous'])
          // ..set('id', dataMap!['id'])
          ..set('dbId', dataMap['dbId'])
          ..set('email', dataMap['email'])
          ..set('gender', dataMap['gender'])
          ..set('groups', dataMap['groups'])
          ..set('name', dataMap['name'])
          ..set('firebaseId', dataMap['id'])
          ..set('photoUrl', dataMap['photoUrl']);

        usersMap[dataMap['id']] = usr;
      },
    );
    // dataSnapshot.snapshot.children.forEach((element) async {
    //   Map<dynamic, dynamic>? dataMap = element.value as Map?;
    //   if (dataMap?['name'] != null && dataMap!['name'].toString().isNotEmpty) {
    //     print('b');

    //     print('c');
    //     var group = ParseObject('Groups')
    //       ..set('description', dataMap!['description'])
    //       // ..set('id', dataMap!['id'])
    //       ..set('dbId', dataMap!['dbId'])
    //       ..set('ownerId', dataMap!['ownerId'])
    //       ..set('ownerName', dataMap!['ownerName'])
    //       ..set('shareLink', dataMap!['shareLink'])
    //       ..set('name', dataMap!['name'])
    //       ..set('max', dataMap!['max'])
    //       ..set('book', dataMap!['book'])
    //       ..set('inProgress', dataMap!['inProgress'])
    //       ..set('members', dataMap!['inProgress']);

    //     print('e');
    //     if (group.get('ownerEmail') == null) {
    //       print(1);
    //       // print(group.get('ownerId'));
    //       // print(usersMap[group.get('ownerId')]);
    //       // print(usersMap[group.get('ownerId')].get('email'));
    //       group.set('ownerEmail', usersMap[group.get('ownerId')]['email']);
    //       print(2);
    //     } else {
    //       print('f');
    //     }
    //     print(3);
    //     // await group.save();
    //     print(4);
    //   }
    //   // print('element');
    //   // print(dataMap);
    // });

    // print('usersMap.entries');
    // print(usersMap.entries.toList());
    List<Group> groups = [];
    apiResponse.results?.forEach((element) async {
      // Map<dynamic, dynamic>? dataMap = element.value as Map?;
      // Map<dynamic, dynamic>? dataMap = element as Map?;
      if (element?['name'] != null && element!['name'].toString().isNotEmpty) {
        groups.add(Group.fromMap({
          'description': element!['description'],
          'id': element['id'] ?? element['objectId'],
          'dbId': element['dbId'],
          'ownerId': element['ownerId'],
          'ownerName': element['ownerName'],
          'ownerEmail': element['ownerEmail'],
          'shareLink': element['shareLink'],
          'global': element['global'] ?? false,
          'name': element['name'],
          'created': element['created'],
          'max': element['max'],
          'book': element['book'],
          'inProgress': element['inProgress'],
          'members': element['members'],
        }));
        var group = ParseObject('Groups')
          ..set('description', element!['description'])
          // ..set('id', dataMap!['id'])
          ..set('dbId', element!['dbId'])
          ..set('ownerId', element!['ownerId'])
          ..set('ownerName', element!['ownerName'])
          ..set('shareLink', element!['shareLink'])
          ..set('name', element!['name'])
          ..set('max', element!['max'])
          ..set('book', element!['book'])
          ..set('inProgress', element!['inProgress'])
          ..set('members', element!['inProgress']);

        if (group.get('ownerEmail') == null) {
          // print(group.get('ownerId'));
          // print(usersMap[group.get('ownerId')]);
          // print(usersMap[group.get('ownerId')].get('email'));
          // group.set('ownerEmail', usersMap[group.get('ownerId')]['email']);
        } else {}
        // await group.save();
        // var resss = await group.save();
        // print(resss);
      }
    });
    emit(GroupsReady(groups));
  }

  void getDedication() async {
    DatabaseEvent dataSnapshot = await ref.child('dedication').once();

    String dedication = '';
    dataSnapshot.snapshot.children.forEach((element) {
      Map<dynamic, dynamic>? dataMap = element.value as Map?;
      if (dataMap?['visable'] == true) {
        dedication = dataMap!['title'];
      }
    });
    emit(DedicationReady(dedication));
  }

  int getRandomWithExclusion(int start, int end, List<int> excludeRows) {
    Random rand = Random();
    int range = end - start + 1;
    int random = rand.nextInt(range) + start; // Adjusting to start value
    while (excludeRows.contains(random)) {
      random = rand.nextInt(range) + start; // Adjusting to start value
    }
    return random;
  }
}
