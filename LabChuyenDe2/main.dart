import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  debugShowCheckedModeBanner: false,
  home: MainApp(),
));

class MainApp extends StatefulWidget {
  const MainApp({super.key});
  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  int _currentIndex = 0;

  void _onNavigate(int index) {
    setState(() => _currentIndex = index);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final titles = ['Dashboard', 'Tài khoản', 'Nhân viên', 'Bảng công', 'Khu vực', 'Dự án', 'Phản hồi'];
    final pages = [
      _buildDashboard(),
      _buildAccounts(),
      _buildEmployees(),
      _buildSchedules(),
      _buildAreas(),
      _buildProjects(),
      _buildFeedback(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: Colors.white, elevation: 0,
        title: Text(titles[_currentIndex], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        actions: [
          Container(margin: const EdgeInsets.only(right: 12), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(8)),
            child: const Row(children: [Icon(Icons.calendar_today, size: 14, color: Color(0xFF64748B)), SizedBox(width: 8), Text('28/03/2026', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))])),
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none, color: Color(0xFF1E293B))),
          const CircleAvatar(radius: 16, backgroundColor: Color(0xFF2563EB), child: Icon(Icons.person, color: Colors.white, size: 20)),
          const SizedBox(width: 16),
        ],
      ),
      drawer: _buildDrawer(),
      body: IndexedStack(index: _currentIndex, children: pages),
    );
  }

  Widget _buildDrawer() {
    return Drawer(backgroundColor: Colors.white, child: Column(children: [
      DrawerHeader(decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
        child: Row(children: [Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.layers, color: Colors.white, size: 20)), const SizedBox(width: 12), const Text('Quản Lý', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))])),
      Expanded(child: ListView(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), children: [
        _di(Icons.pie_chart, 'Dashboard', 0), _di(Icons.manage_accounts, 'Tài khoản', 1), _di(Icons.badge, 'Nhân viên', 2),
        _di(Icons.calendar_month, 'Bảng công', 3), _di(Icons.location_on, 'Khu vực', 4), _di(Icons.account_tree, 'Dự án', 5), _di(Icons.forum, 'Phản hồi', 6),
      ])),
      const Divider(height: 1),
      const Padding(padding: EdgeInsets.all(16.0), child: Row(children: [CircleAvatar(radius: 18, backgroundColor: Color(0xFF2563EB), child: Icon(Icons.person, color: Colors.white, size: 20)), SizedBox(width: 12), Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Admin', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)), Text('Quản trị viên', style: TextStyle(color: Color(0xFF64748B), fontSize: 10))]), Spacer(), Icon(Icons.logout, size: 18, color: Colors.redAccent)])),
    ]));
  }

  Widget _di(IconData icon, String label, int idx) {
    final active = _currentIndex == idx;
    return Container(margin: const EdgeInsets.only(bottom: 4), decoration: BoxDecoration(color: active ? const Color(0xFFEFF6FF) : Colors.transparent, borderRadius: BorderRadius.circular(10), border: Border(left: BorderSide(color: active ? const Color(0xFF2563EB) : Colors.transparent, width: 3))),
      child: ListTile(leading: Icon(icon, color: active ? const Color(0xFF2563EB) : const Color(0xFF64748B), size: 20), title: Text(label, style: TextStyle(color: active ? const Color(0xFF2563EB) : const Color(0xFF475569), fontSize: 14, fontWeight: active ? FontWeight.w600 : FontWeight.w500)), dense: true, onTap: () => _onNavigate(idx)));
  }

  // --- Pages ---
  Widget _page(String title, String sub, IconData icon) => SingleChildScrollView(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
    Text(sub, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
    const SizedBox(height: 24),
    Center(child: Column(children: [const SizedBox(height: 60), Icon(icon, size: 64, color: const Color(0xFFCBD5E1)), const SizedBox(height: 16), Text('Trang $title', style: const TextStyle(fontSize: 18, color: Color(0xFF94A3B8)))])),
  ]));

  Widget _buildDashboard() => _page('Dashboard', 'Tổng quan hệ thống', Icons.pie_chart);
  Widget _buildAccounts() => _page('Tài khoản', 'Quản lý tài khoản người dùng', Icons.manage_accounts);
  Widget _buildEmployees() => _page('Nhân viên', 'Danh sách nhân viên toàn hệ thống', Icons.badge);
  Widget _buildSchedules() => _page('Bảng công', 'Theo dõi thời gian làm việc', Icons.calendar_month);
  Widget _buildAreas() => _page('Khu vực', 'Quản lý các địa điểm làm việc', Icons.location_on);
  Widget _buildProjects() => _page('Dự án', 'Quản lý dự án đang triển khai', Icons.account_tree);
  Widget _buildFeedback() => _page('Phản hồi', 'Hệ thống phản hồi từ nhân viên', Icons.forum);
}
