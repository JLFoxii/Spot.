class BookingModel {
  final String id;
  final String startAt;
  final String status;
  final BusinessSummary business;
  final ServiceSummary service;
  final StaffSummary staff;

  BookingModel({
    required this.id,
    required this.startAt,
    required this.status,
    required this.business,
    required this.service,
    required this.staff,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] as String,
      startAt: json['startAt'] as String,
      status: json['status'] as String,
      business: BusinessSummary.fromJson(json['business'] as Map<String, dynamic>),
      service: ServiceSummary.fromJson(json['service'] as Map<String, dynamic>),
      staff: StaffSummary.fromJson(json['staff'] as Map<String, dynamic>),
    );
  }
}

class BusinessSummary {
  final String name;
  final String address;

  BusinessSummary({required this.name, required this.address});

  factory BusinessSummary.fromJson(Map<String, dynamic> json) {
    return BusinessSummary(
      name: json['name'] as String,
      address: json['address'] as String? ?? '',
    );
  }
}

class ServiceSummary {
  final String name;
  final int durationMin;
  final double price;

  ServiceSummary({
    required this.name,
    required this.durationMin,
    required this.price,
  });

  factory ServiceSummary.fromJson(Map<String, dynamic> json) {
    return ServiceSummary(
      name: json['name'] as String,
      durationMin: json['durationMin'] as int,
      price: double.parse(json['price'].toString()),
    );
  }
}

class StaffSummary {
  final String name;

  StaffSummary({required this.name});

  factory StaffSummary.fromJson(Map<String, dynamic> json) {
    return StaffSummary(name: json['name'] as String);
  }
}
