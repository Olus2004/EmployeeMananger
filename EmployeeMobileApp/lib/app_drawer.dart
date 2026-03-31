import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  debugShowCheckedModeBanner: false,
  home: AppDrawerDemo(),
));

class AppDrawerDemo extends StatefulWidget {
  const AppDrawerDemo({super.key});
  @override
  State<AppDrawerDemo> createState() => _AppDrawerDemoState();
}

class _AppDrawerDemoState extends State<AppDrawerDemo> {
  int _currentIndex = 0;

  void _onNavigate(int index) {
    setState(() => _currentIndex = index);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final titles = ['Dashboard', 'Tài khoản', 'Nhân viên', 'Bảng công', 'Khu vực', 'Dự án', 'Phản hồi'];
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: Text(titles[_currentIndex], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: Column(children: [
          DrawerHeader(
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
            child: Row(children: [
              Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.layers, color: Colors.white, size: 20)),
              const SizedBox(width: 12),
              const Text('Quản Lý', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ]),
          ),
          Expanded(child: ListView(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), children: [
            _DrawerItem(icon: Icons.pie_chart, label: 'Dashboard', isActive: _currentIndex == 0, onTap: () => _onNavigate(0)),
            _DrawerItem(icon: Icons.manage_accounts, label: 'Tài khoản', isActive: _currentIndex == 1, onTap: () => _onNavigate(1)),
            _DrawerItem(icon: Icons.badge, label: 'Nhân viên', isActive: _currentIndex == 2, onTap: () => _onNavigate(2)),
            _DrawerItem(icon: Icons.calendar_month, label: 'Bảng công', isActive: _currentIndex == 3, onTap: () => _onNavigate(3)),
            _DrawerItem(icon: Icons.location_on, label: 'Khu vực', isActive: _currentIndex == 4, onTap: () => _onNavigate(4)),
            _DrawerItem(icon: Icons.account_tree, label: 'Dự án', isActive: _currentIndex == 5, onTap: () => _onNavigate(5)),
            _DrawerItem(icon: Icons.forum, label: 'Phản hồi', isActive: _currentIndex == 6, onTap: () => _onNavigate(6)),
            const Divider(height: 32),
            const _DrawerItem(icon: Icons.table_chart, label: 'Import/Export Excel'),
          ])),
          const Divider(height: 1),
          const Padding(padding: EdgeInsets.all(16.0), child: Row(children: [
            CircleAvatar(radius: 18, backgroundColor: Color(0xFF2563EB), child: Icon(Icons.person, color: Colors.white, size: 20)),
            SizedBox(width: 12),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Admin', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)), Text('Quản trị viên', style: TextStyle(color: Color(0xFF64748B), fontSize: 10))]),
            Spacer(),
            Icon(Icons.logout, size: 18, color: Colors.redAccent),
          ])),
        ]),
      ),
      body: Center(child: Text('Trang: ${titles[_currentIndex]}', style: const TextStyle(fontSize: 18, color: Color(0xFF64748B)))),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  const _DrawerItem({required this.icon, required this.label, this.isActive = false, this.onTap});

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
        onTap: onTap,
      ),
    );
  }
}
