class BusinessModel {
  final String id;
  final String name;
  final String address;
  final String slug;
  final List<ServiceModel> services;
  final List<StaffModel> staff;

  BusinessModel({
    required this.id,
    required this.name,
    required this.address,
    required this.slug,
    this.services = const [],
    this.staff = const [],
  });

  factory BusinessModel.fromJson(Map<String, dynamic> json) {
    return BusinessModel(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String? ?? 'Adresse non renseignée',
      slug: json['slug'] as String,
      services: (json['services'] as List<dynamic>?)
          ?.map((e) => ServiceModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      staff: (json['staff'] as List<dynamic>?)
          ?.map((e) => StaffModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }
}

class ServiceModel {
  final String id;
  final String name;
  final int durationMin;
  final double price;

  ServiceModel({
    required this.id,
    required this.name,
    required this.durationMin,
    required this.price,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as String,
      name: json['name'] as String,
      durationMin: json['durationMin'] as int,
      price: double.parse(json['price'].toString()),
    );
  }
}

class StaffModel {
  final String id;
  final String name;

  StaffModel({
    required this.id,
    required this.name,
  });

  factory StaffModel.fromJson(Map<String, dynamic> json) {
    return StaffModel(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}
