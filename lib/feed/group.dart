import 'dart:convert';

class Group {
  String? description;
  String? id;
  String? dbId;
  String? ownerId;
  String? ownerName;
  String? ownerEmail;
  String? shareLink;
  String? bookType;
  String? intention;
  bool? global;
  String? name;
  double? created;
  int? max;
  List? book;
  List? inProgress;
  List? members;
  Group({
    this.description,
    this.id,
    this.dbId,
    this.ownerId,
    this.ownerName,
    this.ownerEmail,
    this.shareLink,
    this.global,
    this.name,
    this.created,
    this.max,
    this.book,
    this.inProgress,
    this.members,
    this.bookType,
    this.intention,
  });

  Map<String, dynamic> toMap() {
    return {
      'description': description,
      'id': id,
      'dbId': dbId,
      'ownerId': ownerId,
      'ownerName': ownerName,
      'ownerEmail': ownerEmail,
      'shareLink': shareLink,
      'global': global,
      'name': name,
      'created': created,
      'max': max,
      'book': book,
      'inProgress': inProgress,
      'members': members,
      'bookType': bookType,
      'intention': intention,
    };
  }

  factory Group.fromMap(Map<String, dynamic> map) {
    return Group(
      description: map['description'],
      id: map['id'],
      dbId: map['dbId'],
      ownerId: map['ownerId'],
      ownerName: map['ownerName'],
      ownerEmail: map['ownerEmail'],
      shareLink: map['shareLink'],
      global: map['global'],
      name: map['name'],
      created: map['created']?.toDouble(),
      max: map['max']?.toInt(),
      book: map['book'] ?? [],
      inProgress: map['inProgress'] ?? [],
      members: map['members'] ?? [],
      bookType: map['bookType'],
      intention: map['intention'] ?? [],
    );
  }

  String toJson() => json.encode(toMap());

  factory Group.fromJson(String source) => Group.fromMap(json.decode(source));
}
