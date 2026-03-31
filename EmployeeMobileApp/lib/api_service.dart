import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';

  static Future<List<dynamic>> fetchDailies([String? date]) async {
    try {
      final query = date != null ? '?day=$date' : '';
      final response = await http.get(Uri.parse('$baseUrl/daily$query'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load dailies: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
