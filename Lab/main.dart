import 'package:flutter/material.dart';
import 'app_drawer.dart';
import 'dashboard_view.dart';
import 'accounts_view.dart';
import 'employees_view.dart';
import 'schedules_view.dart';
import 'areas_view.dart';
import 'projects_view.dart';
import 'feedback_view.dart';

void main() {
  runApp(const EmployeeManagerApp());
}

class EmployeeManagerApp extends StatelessWidget {
  const EmployeeManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF2563EB);
    const bgColor = Color(0xFFF1F5F9);
    const textColor = Color(0xFF1E293B);

    return MaterialApp(
      title: 'Employee Management System',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: bgColor,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryColor,
          primary: primaryColor,
          surface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: textColor,
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
        textTheme: const TextTheme(
          headlineMedium: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: textColor),
          titleLarge: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: textColor, fontSize: 18),
          bodyMedium: TextStyle(color: Color(0xFF334155)),
        ),
      ),
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  void _onNavigate(int index) {
    setState(() {
      _currentIndex = index;
    });
    Navigator.pop(context); // Close drawer
  }

  @override
  Widget build(BuildContext context) {
    final titles = [
      'Dashboard',
      'Quản lý Tài khoản',
      'Quản lý Nhân viên',
      'Bảng công',
      'Khu vực',
      'Dự án',
      'Phản hồi',
    ];
    
    return Scaffold(
      drawer: AppDrawer(currentIndex: _currentIndex, onNavigate: _onNavigate),
      appBar: AppBar(
        title: Text(titles[_currentIndex], style: const TextStyle(fontSize: 20)),
        actions: [
          _DateDisplay(),
          const SizedBox(width: 12),
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none)),
          const CircleAvatar(
            radius: 16,
            backgroundColor: Color(0xFF2563EB),
            child: Icon(Icons.person, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: const [
          DashboardView(),
          AccountsView(),
          EmployeesView(),
          SchedulesView(),
          AreasView(),
          ProjectsView(),
          FeedbackView(),
        ],
      ),
    );
  }
}

class _DateDisplay extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Row(
        children: [
          Icon(Icons.calendar_today, size: 14, color: Color(0xFF64748B)),
          SizedBox(width: 8),
          Text('26/03/2026', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
