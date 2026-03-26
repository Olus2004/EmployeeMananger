import 'package:flutter/material.dart';

void main() {
  runApp(const EmployeeManagerApp());
}

class EmployeeManagerApp extends StatelessWidget {
  const EmployeeManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF2563EB); // var(--primary)
    const bgColor = Color(0xFFF1F5F9); // var(--bg-main)
    const textColor = Color(0xFF1E293B); // var(--text-main)

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
      home: const DashboardPage(),
    );
  }
}

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('Dashboard', style: TextStyle(fontSize: 20)),
        actions: [
          Container(
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
          ),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _DashboardHeader(),
            const SizedBox(height: 24),
            const _TopStatsRow(),
            const SizedBox(height: 16),
            const _DetailedStatsRow(),
            const SizedBox(height: 24),
            const _DailyAttendanceCard(),
          ],
        ),
      ),
    );
  }
}

class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader();

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Dashboard', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        Text('Tổng quan hệ thống', style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
      ],
    );
  }
}

class _TopStatsRow extends StatelessWidget {
  const _TopStatsRow();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 900 ? 3 : (constraints.maxWidth > 600 ? 2 : 1);
        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 2.5,
          children: const [
            _StatItem(
              title: 'Đi làm hôm nay',
              value: '84',
              icon: Icons.work_outline,
              iconColor: Color(0xFF059669),
              bgColor: Color(0xFFECFDF5),
            ),
            _StatItem(
              title: 'Ca ngày',
              value: '52',
              icon: Icons.wb_sunny_outlined,
              iconColor: Color(0xFFD97706),
              bgColor: Color(0xFFFFFBEB),
            ),
            _StatItem(
              title: 'Ca đêm',
              value: '32',
              icon: Icons.nightlight_outlined,
              iconColor: Color(0xFF4F46E5),
              bgColor: Color(0xFFEEF2FF),
            ),
          ],
        );
      },
    );
  }
}

class _StatItem extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;
  final Color bgColor;

  const _StatItem({
    required this.title,
    required this.value,
    required this.icon,
    required this.iconColor,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(title, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)),
              Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
        ],
      ),
    );
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
          _MiniStat(label: 'Tổng', value: '124', color: Color(0xFF2563EB), icon: Icons.group),
          _MiniStat(label: 'Đã ĐD', value: '84', color: Color(0xFF10B981), icon: Icons.check_circle),
          _MiniStat(label: 'Chưa ĐD', value: '40', color: Color(0xFFF59E0B), icon: Icons.pending),
          _MiniStat(label: 'VN', value: '86', color: Color(0xFF6366F1), icon: Icons.flag),
          _MiniStat(label: 'CN', value: '38', color: Color(0xFFF43F5E), icon: Icons.flag),
        ],
      );
    });
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _MiniStat({required this.label, required this.value, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label, style: TextStyle(color: color.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.bold)),
              Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
        ],
      ),
    );
  }
}

class _DailyAttendanceCard extends StatelessWidget {
  const _DailyAttendanceCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.calendar_month, color: Color(0xFF2563EB), size: 20),
                    SizedBox(width: 8),
                    Text('Điểm danh trong ngày', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(
                  width: 200,
                  height: 36,
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm...',
                      hintStyle: const TextStyle(fontSize: 12),
                      prefixIcon: const Icon(Icons.search, size: 16),
                      contentPadding: EdgeInsets.zero,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          const _AttendanceTable(),
        ],
      ),
    );
  }
}

class _AttendanceTable extends StatelessWidget {
  const _AttendanceTable();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        headingRowColor: MaterialStateProperty.all(const Color(0xFFF8FAFC)),
        headingRowHeight: 40,
        dataRowHeight: 56,
        horizontalMargin: 20,
        columnSpacing: 30,
        columns: const [
          DataColumn(label: Text('NHÂN VIÊN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))),
          DataColumn(label: Text('KHU VỰC', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))),
          DataColumn(label: Text('DỰ ÁN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))),
          DataColumn(label: Text('TRẠNG THÁI', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))),
          DataColumn(label: Text('GIỜ VÀO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))),
          DataColumn(label: Text('GIỜ RA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))),
        ],
        rows: [
          _buildDataRow('Nguyễn Văn A', 'Hà Nội', 'Project Alpha', 'Active', '08:00', '17:00'),
          _buildDataRow('Trần Thị B', 'TP.HCM', 'Project Beta', 'Active', '08:15', '17:30'),
          _buildDataRow('Lee Wei', 'Beijing', 'Gamma Corp', 'On Break', '09:00', '--:--'),
          _buildDataRow('Phạm C', 'Đà Nẵng', 'Delta Area', 'Off', '--:--', '--:--'),
          _buildDataRow('Zhang Min', 'Shanghai', 'Epsilon Sub', 'Pending', '--:--', '--:--'),
        ],
      ),
    );
  }

  DataRow _buildDataRow(String name, String area, String project, String status, String cin, String cout) {
    Color statusColor = status == 'Active' ? Colors.green : (status == 'On Break' ? Colors.orange : Colors.red);
    return DataRow(cells: [
      DataCell(Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
      DataCell(Text(area, style: const TextStyle(fontSize: 13))),
      DataCell(Text(project, style: const TextStyle(fontSize: 13))),
      DataCell(Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: statusColor.withOpacity(0.3))),
        child: Text(status, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
      )),
      DataCell(Text(cin, style: const TextStyle(fontSize: 13))),
      DataCell(Text(cout, style: const TextStyle(fontSize: 13))),
    ]);
  }
}

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.layers, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                const Text('Quản Lý', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: const [
                _DrawerItem(icon: Icons.pie_chart, label: 'Dashboard', isActive: true),
                _DrawerItem(icon: Icons.manage_accounts, label: 'Tài khoản'),
                _DrawerItem(icon: Icons.badge, label: 'Nhân viên'),
                _DrawerItem(icon: Icons.calendar_month, label: 'Bảng công'),
                _DrawerItem(icon: Icons.location_on, label: 'Khu vực'),
                _DrawerItem(icon: Icons.account_tree, label: 'Dự án'),
                _DrawerItem(icon: Icons.forum, label: 'Phản hồi'),
                Divider(height: 32),
                _DrawerItem(icon: Icons.table_chart, label: 'Import/Export Excel'),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 18,
                  backgroundColor: Color(0xFF2563EB),
                  child: Icon(Icons.person, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Admin', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text('Quản trị viên', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                  ],
                ),
                const Spacer(),
                IconButton(onPressed: () {}, icon: const Icon(Icons.logout, size: 18, color: Colors.redAccent)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;

  const _DrawerItem({required this.icon, required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFFEFF6FF) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: Border(left: BorderSide(color: isActive ? const Color(0xFF2563EB) : Colors.transparent, width: 3)),
      ),
      child: ListTile(
        leading: Icon(icon, color: isActive ? const Color(0xFF2563EB) : const Color(0xFF64748B), size: 20),
        title: Text(label, style: TextStyle(color: isActive ? const Color(0xFF2563EB) : const Color(0xFF475569), fontSize: 14, fontWeight: isActive ? FontWeight.w600 : FontWeight.w500)),
        dense: true,
        onTap: () {},
      ),
    );
  }
}
