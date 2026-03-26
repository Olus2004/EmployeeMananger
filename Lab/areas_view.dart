import 'package:flutter/material.dart';
import 'widgets.dart';

class AreasView extends StatelessWidget {
  const AreasView({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: 'Khu vực', subtitle: 'Quản lý các địa điểm làm việc'),
          SizedBox(height: 24),
          Text('Giao diện Khu vực đang được phát triển...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
