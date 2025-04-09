part of 'feed_cubit.dart';

sealed class FeedState extends Equatable {
  const FeedState();

  @override
  List<Object> get props => [];
}

final class FeedInitial extends FeedState {}

final class GroupsReady extends FeedState {
  final List<Group> groups;
  const GroupsReady(this.groups);
  @override
  List<Object> get props => [DateTime.now()];
}

final class DedicationReady extends FeedState {
  final String dedication;
  const DedicationReady(this.dedication);
}

final class GroupCreated extends FeedState {
  const GroupCreated();
}

class NewGroupParamsChanged extends FeedState {
  bool missingGroupName;
  bool missingGroupDescription;
  bool missingGroupDedication;

  int? groupType;
  String? groupName;
  String? groupDescription;
  String? groupDedication;
  String? groupIntention;
  String? bookType;

  NewGroupParamsChanged(
      {this.groupType,
      this.groupName,
      this.groupDescription,
      this.groupDedication,
      this.groupIntention = 'זכות',
      this.bookType = 'תניא',
      this.missingGroupName = false,
      this.missingGroupDescription = false,
      this.missingGroupDedication = false});

  bool isValid() {
    return !missingGroupName &&
        !missingGroupDescription &&
        !missingGroupDedication;
  }

  @override
  List<Object> get props => [
        groupType ?? 1,
        groupName ?? '',
        groupDescription ?? '',
        groupDedication ?? '',
        groupIntention ?? '',
        bookType ?? '',
        missingGroupName,
        missingGroupDescription,
        missingGroupDedication,
        DateTime.now()
      ];

  NewGroupParamsChanged copyWith({
    bool? missingGroupName,
    bool? missingGroupDescription,
    bool? missingGroupDedication,
    int? groupType,
    String? groupName,
    String? groupDescription,
    String? groupDedication,
    String? groupIntention,
    String? bookType,
  }) {
    return NewGroupParamsChanged(
      missingGroupName: missingGroupName ?? this.missingGroupName,
      missingGroupDescription:
          missingGroupDescription ?? this.missingGroupDescription,
      missingGroupDedication:
          missingGroupDedication ?? this.missingGroupDedication,
      groupType: groupType ?? this.groupType,
      groupName: groupName ?? this.groupName,
      groupDescription: groupDescription ?? this.groupDescription,
      groupDedication: groupDedication ?? this.groupDedication,
      groupIntention: groupIntention ?? this.groupIntention,
      bookType: bookType ?? this.bookType,
    );
  }
}
