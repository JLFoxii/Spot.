import 'package:flutter/material.dart';
import '../../data/models/business_model.dart';
import 'booking_wizard_screen.dart';

class BusinessDetailScreen extends StatelessWidget {
  final BusinessModel business;

  const BusinessDetailScreen({super.key, required this.business});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(business.name),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Image
            Container(
              height: 200,
              width: double.infinity,
              color: Colors.grey,
              child: const Center(
                child: Icon(Icons.store, size: 80, color: Colors.white),
              ),
            ),

            // Business Info
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    business.name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 18, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          business.address,
                          style: const TextStyle(color: Colors.grey, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Services Section
                  const Text(
                    "Services",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (business.services.isEmpty)
                    const Text("Aucun service disponible", style: TextStyle(color: Colors.grey))
                  else
                    ...business.services.map((service) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Colors.blue,
                          child: Icon(Icons.cut, color: Colors.white),
                        ),
                        title: Text(service.name),
                        subtitle: Text("${service.durationMin} min"),
                        trailing: Text(
                          "${service.price.toStringAsFixed(2)}€",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => BookingWizardScreen(
                                business: business,
                              ),
                            ),
                          );
                        },
                      ),
                    )),

                  const SizedBox(height: 24),

                  // Staff Section
                  const Text(
                    "Notre équipe",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (business.staff.isEmpty)
                    const Text("Aucun membre d'équipe", style: TextStyle(color: Colors.grey))
                  else
                    Wrap(
                      spacing: 16,
                      runSpacing: 16,
                      children: business.staff.map((staff) => Column(
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: Colors.grey[300],
                            child: Text(
                              staff.name[0].toUpperCase(),
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(staff.name, style: const TextStyle(fontSize: 12)),
                        ],
                      )).toList(),
                    ),

                  const SizedBox(height: 32),

                  // Global booking button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BookingWizardScreen(
                              business: business,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[800],
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        "Réserver",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
