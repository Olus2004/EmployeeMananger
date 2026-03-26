import 'package:flutter/material.dart';
import 'widgets.dart';

class EmployeesView extends StatelessWidget {
  const EmployeesView({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: 'Nhân viên', subtitle: 'Danh sách nhân viên toàn hệ thống'),
          SizedBox(height: 24),
          Text('Giao diện Quản lý Nhân viên đang được phát triển...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
