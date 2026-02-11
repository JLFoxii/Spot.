import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:intl/intl.dart';
import '../../../auth/presentation/screens/login_screen.dart';
import '../../data/models/business_model.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../../domain/repositories/booking_repository.dart';

class BookingWizardScreen extends StatefulWidget {
  final BusinessModel business;

  const BookingWizardScreen({super.key, required this.business});

  @override
  State<BookingWizardScreen> createState() => _BookingWizardScreenState();
}

class _BookingWizardScreenState extends State<BookingWizardScreen> {
  final BookingRepository _repository = BookingRepositoryImpl();
  final _storage = const FlutterSecureStorage();

  int _currentStep = 0;
  ServiceModel? _selectedService;
  StaffModel? _selectedStaff;
  DateTime? _selectedDate;
  String? _selectedSlot;

  List<String> _availableSlots = [];
  bool _loadingSlots = false;
  String? _slotsError;
  bool _submitting = false;

  Future<void> _fetchSlots() async {
    if (_selectedDate == null ||
        _selectedStaff == null ||
        _selectedService == null) {
      return;
    }

    setState(() {
      _loadingSlots = true;
      _slotsError = null;
      _availableSlots = [];
      _selectedSlot = null;
    });

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final slots = await _repository.getAvailableSlots(
        businessId: widget.business.id,
        staffId: _selectedStaff!.id,
        serviceId: _selectedService!.id,
        date: dateStr,
      );
      setState(() {
        _availableSlots = slots;
        _loadingSlots = false;
      });
    } catch (e) {
      setState(() {
        _slotsError = 'Impossible de charger les créneaux';
        _loadingSlots = false;
      });
    }
  }

  /// Formats an ISO 8601 slot string to display only HH:mm.
  String _formatSlotTime(String isoSlot) {
    final dt = DateTime.parse(isoSlot);
    return DateFormat('HH:mm').format(dt.toLocal());
  }

  Future<bool> _ensureAuthenticated() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) return true;

    if (!mounted) return false;
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
    return result == true;
  }

  Future<void> _confirmBooking() async {
    if (_selectedSlot == null) return;

    final authenticated = await _ensureAuthenticated();
    if (!authenticated || !mounted) return;

    setState(() => _submitting = true);

    try {
      await _repository.createBooking(
        businessId: widget.business.id,
        staffId: _selectedStaff!.id,
        serviceId: _selectedService!.id,
        startAt: _selectedSlot!,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Réservation réussie !'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.of(context).popUntil((route) => route.isFirst);
    } on DioException catch (e) {
      if (!mounted) return;
      final statusCode = e.response?.statusCode;
      final message = statusCode == 401
          ? 'Veuillez vous connecter'
          : 'Erreur lors de la réservation';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de la réservation'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String get _stepTitle {
    switch (_currentStep) {
      case 0:
        return 'Choisir un service';
      case 1:
        return 'Choisir un coiffeur';
      case 2:
        return 'Date & Heure';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_stepTitle),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_currentStep > 0) {
              setState(() => _currentStep--);
            } else {
              Navigator.pop(context);
            }
          },
        ),
      ),
      body: Column(
        children: [
          _buildProgressIndicator(),
          Expanded(child: _buildCurrentStep()),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        children: List.generate(3, (index) {
          final isActive = index <= _currentStep;
          return Expanded(
            child: Container(
              height: 4,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: isActive ? Colors.blue[800] : Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildServiceStep();
      case 1:
        return _buildStaffStep();
      case 2:
        return _buildSlotStep();
      default:
        return const SizedBox.shrink();
    }
  }

  // ─── Step 1 : Service ───

  Widget _buildServiceStep() {
    final services = widget.business.services;
    if (services.isEmpty) {
      return const Center(child: Text('Aucun service disponible'));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: services.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final service = services[index];
        final isSelected = _selectedService?.id == service.id;
        return Card(
          elevation: isSelected ? 4 : 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: isSelected
                ? BorderSide(color: Colors.blue[800]!, width: 2)
                : BorderSide.none,
          ),
          child: ListTile(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              backgroundColor: Colors.blue[800],
              child: const Icon(Icons.cut, color: Colors.white),
            ),
            title: Text(service.name,
                style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text('${service.durationMin} min'),
            trailing: Text(
              '${service.price.toStringAsFixed(2)}€',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.blue[800],
              ),
            ),
            onTap: () {
              setState(() {
                _selectedService = service;
                _currentStep = 1;
              });
            },
          ),
        );
      },
    );
  }

  // ─── Step 2 : Staff ───

  Widget _buildStaffStep() {
    final staffList = widget.business.staff;
    if (staffList.isEmpty) {
      return const Center(child: Text('Aucun coiffeur disponible'));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: staffList.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final staff = staffList[index];
        final isSelected = _selectedStaff?.id == staff.id;
        return Card(
          elevation: isSelected ? 4 : 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: isSelected
                ? BorderSide(color: Colors.blue[800]!, width: 2)
                : BorderSide.none,
          ),
          child: ListTile(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            leading: CircleAvatar(
              radius: 28,
              backgroundColor: Colors.grey[300],
              child: Text(
                staff.name[0].toUpperCase(),
                style:
                    const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(staff.name,
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.w600)),
            onTap: () {
              setState(() {
                _selectedStaff = staff;
                _currentStep = 2;
              });
            },
          ),
        );
      },
    );
  }

  // ─── Step 3 : Date & Slot ───

  Widget _buildSlotStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Recap
          Card(
            color: Colors.blue[50],
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.blue),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '${_selectedService!.name} avec ${_selectedStaff!.name}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Date picker button
          const Text('Date',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: const Icon(Icons.calendar_today),
              label: Text(
                _selectedDate != null
                    ? DateFormat('EEEE d MMMM yyyy', 'fr_FR')
                        .format(_selectedDate!)
                    : 'Sélectionner une date',
                style: const TextStyle(fontSize: 16),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                final now = DateTime.now();
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _selectedDate ?? now,
                  firstDate: now,
                  lastDate: now.add(const Duration(days: 60)),
                  locale: const Locale('fr', 'FR'),
                );
                if (picked != null) {
                  setState(() => _selectedDate = picked);
                  _fetchSlots();
                }
              },
            ),
          ),
          const SizedBox(height: 24),

          // Slots
          if (_selectedDate != null) ...[
            const Text('Horaires disponibles',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            if (_loadingSlots)
              const Center(child: CircularProgressIndicator())
            else if (_slotsError != null)
              Center(
                child: Column(
                  children: [
                    Text(_slotsError!,
                        style: const TextStyle(color: Colors.red)),
                    const SizedBox(height: 8),
                    TextButton(
                        onPressed: _fetchSlots,
                        child: const Text('Réessayer')),
                  ],
                ),
              )
            else if (_availableSlots.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Aucun créneau disponible pour cette date',
                    style: TextStyle(color: Colors.grey, fontSize: 16),
                  ),
                ),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _availableSlots.map((slot) {
                  final isSelected = _selectedSlot == slot;
                  return ChoiceChip(
                    label: Text(_formatSlotTime(slot)),
                    selected: isSelected,
                    selectedColor: Colors.blue[800],
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.black,
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (_) {
                      setState(() => _selectedSlot = slot);
                    },
                  );
                }).toList(),
              ),
          ],

          const SizedBox(height: 32),

          // Confirm button
          if (_selectedSlot != null)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitting ? null : _confirmBooking,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[800],
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: _submitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Confirmer la réservation',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white),
                      ),
              ),
            ),
        ],
      ),
    );
  }
}
