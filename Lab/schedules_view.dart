import 'package:flutter/material.dart';
import 'widgets.dart';

class SchedulesView extends StatelessWidget {
  const SchedulesView({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: 'Bảng công', subtitle: 'Theo dõi thời gian làm việc'),
          SizedBox(height: 24),
          Text('Giao diện Bảng công đang được phát triển...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
