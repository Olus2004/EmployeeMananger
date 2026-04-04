import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:5005/api';

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

  static Future<List<dynamic>> initializeDailies([String? date]) async {
    try {
      final query = date != null ? '?day=$date' : '';
      final response = await http.get(Uri.parse('$baseUrl/daily/initialize$query'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to initialize: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  static Future<Map<String, dynamic>> fetchStats([String? date]) async {
    try {
      final query = date != null ? '?day=$date' : '';
      final response = await http.get(Uri.parse('$baseUrl/daily/stats$query'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {'vnCount': 0, 'cnCount': 0};
      }
    } catch (e) {
      return {'vnCount': 0, 'cnCount': 0};
    }
  }

  static Future<List<dynamic>> fetchEmployees() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/employee'));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load employees: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  static Future<bool> deleteEmployee(String id) async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/employee/$id'));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> createEmployee(Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/employee'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> updateEmployee(String id, Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/employee/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}

