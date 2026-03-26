import 'package:flutter/material.dart';
import 'widgets.dart';

class ProjectsView extends StatelessWidget {
  const ProjectsView({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: 'Dự án', subtitle: 'Quản lý dự án đang triển khai'),
          SizedBox(height: 24),
          Text('Giao diện Dự án đang được phát triển...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
