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
}

final class DedicationReady extends FeedState {
  final String dedication;
  const DedicationReady(this.dedication);
}
