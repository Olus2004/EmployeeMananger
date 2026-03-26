import 'package:flutter/material.dart';
import 'widgets.dart';

class FeedbackView extends StatelessWidget {
  const FeedbackView({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: 'Phản hồi', subtitle: 'Hệ thống phản hồi từ nhân viên'),
          SizedBox(height: 24),
          Text('Giao diện Phản hồi đang được phát triển...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
