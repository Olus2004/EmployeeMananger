import 'package:flutter/material.dart';
import 'widgets.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: 'Dashboard', subtitle: 'Tổng quan hệ thống'),
          SizedBox(height: 24),
          _TopStatsRow(),
          SizedBox(height: 16),
          _DetailedStatsRow(),
          SizedBox(height: 24),
          _DailyAttendanceCard(),
        ],
      ),
    );
  }
}

class _TopStatsRow extends StatelessWidget {
  const _TopStatsRow();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      int count = constraints.maxWidth > 900 ? 3 : (constraints.maxWidth > 600 ? 2 : 1);
      return GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: count,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 2.5,
        children: const [
          StatItem(title: 'Đi làm hôm nay', value: '84', icon: Icons.work_outline, iconColor: Color(0xFF059669), bgColor: Color(0xFFECFDF5)),
          StatItem(title: 'Ca ngày', value: '52', icon: Icons.wb_sunny_outlined, iconColor: Color(0xFFD97706), bgColor: Color(0xFFFFFBEB)),
          StatItem(title: 'Ca đêm', value: '32', icon: Icons.nightlight_outlined, iconColor: Color(0xFF4F46E5), bgColor: Color(0xFFEEF2FF)),
        ],
      );
    });
  }
}

class _DetailedStatsRow extends StatelessWidget {
  const _DetailedStatsRow();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      int count = constraints.maxWidth > 800 ? 5 : (constraints.maxWidth > 500 ? 3 : 2);
      return GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: count,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 3.5,
        children: const [
          MiniStat(label: 'Tổng', value: '124', color: Color(0xFF2563EB), icon: Icons.group),
          MiniStat(label: 'Đã ĐD', value: '84', color: Color(0xFF10B981), icon: Icons.check_circle),
          MiniStat(label: 'Chưa ĐD', value: '40', color: Color(0xFFF59E0B), icon: Icons.pending),
          MiniStat(label: 'VN', value: '86', color: Color(0xFF6366F1), icon: Icons.flag),
          MiniStat(label: 'CN', value: '38', color: Color(0xFFF43F5E), icon: Icons.flag),
        ],
      );
    });
  }
}

class _DailyAttendanceCard extends StatelessWidget {
  const _DailyAttendanceCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(children: [Icon(Icons.calendar_month, color: Color(0xFF2563EB), size: 20), SizedBox(width: 8), Text('Điểm danh trong ngày', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))]),
                SizedBox(width: 200, height: 36, child: TextField(decoration: InputDecoration(hintText: 'Tìm kiếm...', hintStyle: const TextStyle(fontSize: 12), prefixIcon: const Icon(Icons.search, size: 16), contentPadding: EdgeInsets.zero, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0)))))),
              ],
            ),
          ),
          const Divider(height: 1),
          const CustomDataTable(
            columns: ['NHÂN VIÊN', 'KHU VỰC', 'DỰ ÁN', 'TRẠNG THÁI', 'GIỜ VÀO', 'GIỜ RA'],
            rows: [
              ['Nguyễn Văn A', 'Hà Nội', 'Project Alpha', 'Active', '08:00', '17:00'],
              ['Trần Thị B', 'TP.HCM', 'Project Beta', 'Active', '08:15', '17:30'],
              ['Lee Wei', 'Beijing', 'Gamma Corp', 'On Break', '09:00', '--:--'],
              ['Phạm C', 'Đà Nẵng', 'Delta Area', 'Off', '--:--', '--:--'],
              ['Zhang Min', 'Shanghai', 'Epsilon Sub', 'Pending', '--:--', '--:--'],
            ],
          ),
        ],
      ),
    );
  }
}
