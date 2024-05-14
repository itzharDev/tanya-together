import 'dart:convert';

class Group {
  String? description;
  String? id;
  String? dbId;
  String? ownerId;
  String? ownerName;
  String? ownerEmail;
  String? shareLink;
  bool? global;
  String? name;
  double? created;
  int? max;
  Map<String, dynamic>? book;
  Map<String, dynamic>? inProgress;
  Map<String, dynamic>? members;
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
      book: Map<String, dynamic>.from(map['book'] ?? {}),
      // book: Map<String, dynamic>.from({}),
      inProgress: Map<String, dynamic>.from(map['inProgress'] ?? {}),
      members: Map<String, dynamic>.from(map['members'] ?? {}),
    );
  }

  String toJson() => json.encode(toMap());

  factory Group.fromJson(String source) => Group.fromMap(json.decode(source));
}
