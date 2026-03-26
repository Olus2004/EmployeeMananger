import 'package:flutter/material.dart';

class AppDrawer extends StatelessWidget {
  final int currentIndex;
  final Function(int) onNavigate;

  const AppDrawer({super.key, required this.currentIndex, required this.onNavigate});

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
                Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.layers, color: Colors.white, size: 20)),
                const SizedBox(width: 12),
                const Text('Quản Lý', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: [
                DrawerItem(icon: Icons.pie_chart, label: 'Dashboard', isActive: currentIndex == 0, onTap: () => onNavigate(0)),
                DrawerItem(icon: Icons.manage_accounts, label: 'Tài khoản', isActive: currentIndex == 1, onTap: () => onNavigate(1)),
                DrawerItem(icon: Icons.badge, label: 'Nhân viên', isActive: currentIndex == 2, onTap: () => onNavigate(2)),
                DrawerItem(icon: Icons.calendar_month, label: 'Bảng công', isActive: currentIndex == 3, onTap: () => onNavigate(3)),
                DrawerItem(icon: Icons.location_on, label: 'Khu vực', isActive: currentIndex == 4, onTap: () => onNavigate(4)),
                DrawerItem(icon: Icons.account_tree, label: 'Dự án', isActive: currentIndex == 5, onTap: () => onNavigate(5)),
                DrawerItem(icon: Icons.forum, label: 'Phản hồi', isActive: currentIndex == 6, onTap: () => onNavigate(6)),
                const Divider(height: 32),
                const DrawerItem(icon: Icons.table_chart, label: 'Import/Export Excel'),
              ],
            ),
          ),
          const Divider(height: 1),
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Row(
              children: [
                CircleAvatar(radius: 18, backgroundColor: Color(0xFF2563EB), child: Icon(Icons.person, color: Colors.white, size: 20)),
                SizedBox(width: 12),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Admin', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)), Text('Quản trị viên', style: TextStyle(color: Color(0xFF64748B), fontSize: 10))]),
                Spacer(),
                Icon(Icons.logout, size: 18, color: Colors.redAccent),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;

  const DrawerItem({super.key, required this.icon, required this.label, this.isActive = false, this.onTap});

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
