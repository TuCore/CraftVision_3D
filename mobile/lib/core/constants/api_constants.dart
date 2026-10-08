import 'package:flutter/foundation.dart';

class ApiConstants {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5192'; // Browser localhost
    }
    return 'http://10.0.2.2:5192'; // Emulator loopback
  }
}
