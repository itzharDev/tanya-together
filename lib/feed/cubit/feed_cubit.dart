import 'dart:math';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:parse_server_sdk_flutter/parse_server_sdk_flutter.dart';
import 'package:tanya/auth/presentation/cubit/auth_cubit.dart';
import 'package:tanya/core/cubit/loading_cubit.dart';
import 'package:tanya/core/ioc.dart';
import 'package:tanya/feed/group.dart';

part 'feed_state.dart';

class FeedCubit extends Cubit<FeedState> {
  FeedCubit() : super(FeedInitial());
  DatabaseReference ref = FirebaseDatabase.instance.ref();

  void init() async {
    // print('init');
  }

  void getGroups() async {
    // final databaseReference = await ref.child('groups');
    final databaseReferenceUsers = ref.child('users');

    var apiResponse = await ParseObject('NewGroup').getAll();

    // .equalTo(10);

// Retrieve data
    Map<dynamic, dynamic>? usersMap = {};
    // DatabaseEvent dataSnapshot = await databaseReference.once();
    // DatabaseEvent dataSnapshotUsers = await databaseReferenceUsers.once();
    // dataSnapshotUsers.snapshot.children.forEach(
    //   (element) {
    //     Map<dynamic, dynamic>? dataMap = element.value as Map?;
    //     // print(dataMap);
    //     var usr = ParseObject('FirebaseUsers')
    //       ..set('anonymous', dataMap!['anonymous'])
    //       // ..set('id', dataMap!['id'])
    //       ..set('dbId', dataMap['dbId'])
    //       ..set('email', dataMap['email'])
    //       ..set('gender', dataMap['gender'])
    //       ..set('groups', dataMap['groups'])
    //       ..set('name', dataMap['name'])
    //       ..set('firebaseId', dataMap['id'])
    //       ..set('photoUrl', dataMap['photoUrl']);

    //     usersMap[dataMap['id']] = usr;
    //   },
    // );
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
          'bookType': element['bookType'] ?? '1',
          'intention': element['intention'] ?? '1',
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
    for (var element in dataSnapshot.snapshot.children) {
      Map<dynamic, dynamic>? dataMap = element.value as Map?;
      if (dataMap?['visable'] == true) {
        dedication = dataMap!['title'];
      }
    }
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

  void updateGroupType(FeedState state, int groupType) {
    if (state is! NewGroupParamsChanged) {
      state = NewGroupParamsChanged(groupType: groupType);
    } else {
      state = state.copyWith(groupType: groupType);
    }
    validateDetails(state);
    emit(state);
  }

  void updateGroupName(FeedState state, String groupName) {
    if (state is! NewGroupParamsChanged) {
      state = NewGroupParamsChanged(groupName: groupName);
    } else {
      state = state.copyWith(groupName: groupName);
    }
    validateDetails(state);
    emit(state);
  }

  void updateGroupDescription(FeedState state, String groupDescription) {
    if (state is! NewGroupParamsChanged) {
      state = NewGroupParamsChanged(groupDescription: groupDescription);
    } else {
      state = state.copyWith(groupDescription: groupDescription);
    }
    validateDetails(state);
    emit(state);
  }

  void updateGroupDedication(FeedState state, String groupDedication) {
    if (state is! NewGroupParamsChanged) {
      state = NewGroupParamsChanged(groupDedication: groupDedication);
    } else {
      state = state.copyWith(groupDedication: groupDedication);
    }
    validateDetails(state);
    emit(state);
  }

  void updateGroupIntention(FeedState state, String? groupIntention) {
    if (state is! NewGroupParamsChanged) {
      state = NewGroupParamsChanged(groupIntention: groupIntention);
    } else {
      state = state.copyWith(groupIntention: groupIntention);
    }
    validateDetails(state);
    emit(state);
  }

  void updateBookType(FeedState state, String? bookType) {
    if (state is! NewGroupParamsChanged) {
      state = NewGroupParamsChanged(bookType: bookType);
    } else {
      state = state.copyWith(bookType: bookType);
    }
    validateDetails(state);
    emit(state);
  }

  void validateDetails(NewGroupParamsChanged state,
      {bool duringCreation = false}) {
    state.missingGroupName =
        state.groupName == null || state.groupName!.isEmpty;
    state.missingGroupDedication =
        state.groupDedication == null || state.groupDedication!.isEmpty;
    state.missingGroupDescription =
        state.groupDescription == null || state.groupDescription!.isEmpty;
  }

  Future<void> createGroup(FeedState state) async {
    if (state is NewGroupParamsChanged) {
      state.missingGroupName =
          state.groupName == null || state.groupName!.isEmpty;
      state.missingGroupDedication =
          state.groupDedication == null || state.groupDedication!.isEmpty;
      state.missingGroupDescription =
          state.groupDescription == null || state.groupDescription!.isEmpty;
      if (!state.isValid()) {
        print('state 1');
        print(state);
        emit(state);
      } else {
        locator
            .get<LoadingCubit>()
            .emit(LoadingStateChanged(loading: true, text: 'אנא המתן'));
        String? shareLink;
        var currentUser = locator.get<AuthCubit>().currentUser;
        var newGroup = ParseObject('NewGroup');
        newGroup.set('global', state.groupType == 2);
        newGroup.set('description', state.groupDescription);
        newGroup.set('ownerId', currentUser!.objectId);
        newGroup.set('ownerName', currentUser.get('displayName'));
        newGroup.set('ownerEmail', currentUser.emailAddress);
        newGroup.set('name', state.groupName);
        newGroup.set('bookType', state.bookType);
        newGroup.set('intention', state.groupIntention);
        newGroup.set('book', []);
        newGroup.set('inProgress', []);
        newGroup.set('members', []);
        // 3 - mishna
        // 2 - tehilim
        // 1 - tanya
        newGroup.set(
            'max',
            state.bookType == '3'
                ? 525
                : state.bookType == '2'
                    ? 150
                    : state.bookType == '1'
                        ? 385
                        : 0);

        await newGroup.save();
        locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
        emit(const GroupCreated());
      }
    }
  }

  Future<void> updateGroup(Group group) async {
    locator
        .get<LoadingCubit>()
        .emit(LoadingStateChanged(loading: true, text: 'אנא המתן'));
    try {
      var groupObject = ParseObject('NewGroup')..objectId = group.id;
      groupObject.set('book', group.book);
      groupObject.set('inProgress', group.inProgress);
      await groupObject.save();
      locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
      getGroups(); // Refresh the groups list
    } catch (e) {
      locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
      print('Error updating group: $e');
    }
  }

  Future<Group?> getGroup(String groupId) async {
    try {
      locator
          .get<LoadingCubit>()
          .emit(LoadingStateChanged(loading: true, text: 'אנא המתן'));

      var groupObject = ParseObject('NewGroup')..objectId = groupId;
      await groupObject.fetch();

      if (groupObject.get('name') != null &&
          groupObject.get('name').toString().isNotEmpty) {
        var group = Group.fromMap({
          'description': groupObject.get('description'),
          'id': groupObject.objectId,
          'dbId': groupObject.get('dbId'),
          'ownerId': groupObject.get('ownerId'),
          'ownerName': groupObject.get('ownerName'),
          'ownerEmail': groupObject.get('ownerEmail'),
          'shareLink': groupObject.get('shareLink'),
          'global': groupObject.get('global') ?? false,
          'bookType': groupObject.get('bookType') ?? '1',
          'intention': groupObject.get('intention') ?? '1',
          'name': groupObject.get('name'),
          'created': groupObject.get('created'),
          'max': groupObject.get('max'),
          'book': groupObject.get('book'),
          'inProgress': groupObject.get('inProgress'),
          'members': groupObject.get('members'),
        });

        locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
        return group;
      }

      locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
      return null;
    } catch (e) {
      locator.get<LoadingCubit>().emit(LoadingStateChanged(loading: false));
      print('Error fetching group: $e');
      return null;
    }
  }
}
