import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  debugShowCheckedModeBanner: false,
  home: WidgetsDemo(),
));

class WidgetsDemo extends StatelessWidget {
  const WidgetsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: const Text('Widgets Demo', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // SectionHeader
          const Text('SectionHeader', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          const SizedBox(height: 8),
          const SectionHeader(title: 'Tiêu đề mẫu', subtitle: 'Mô tả phụ của section'),
          const SizedBox(height: 32),

          // StatItem
          const Text('StatItem', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          const SizedBox(height: 8),
          LayoutBuilder(builder: (context, c) => GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: c.maxWidth > 600 ? 3 : 1, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 2.5, children: const [
            StatItem(title: 'Nhân viên', value: '124', icon: Icons.group, iconColor: Color(0xFF2563EB), bgColor: Color(0xFFEFF6FF)),
            StatItem(title: 'Hoạt động', value: '112', icon: Icons.check_circle, iconColor: Color(0xFF10B981), bgColor: Color(0xFFECFDF5)),
            StatItem(title: 'Dự án', value: '5', icon: Icons.account_tree, iconColor: Color(0xFF7C3AED), bgColor: Color(0xFFF5F3FF)),
          ])),
          const SizedBox(height: 32),

          // MiniStat
          const Text('MiniStat', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          const SizedBox(height: 8),
          LayoutBuilder(builder: (context, c) => GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: c.maxWidth > 600 ? 3 : 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 3.5, children: const [
            MiniStat(label: 'Tổng', value: '124', color: Color(0xFF2563EB), icon: Icons.group),
            MiniStat(label: 'Đã ĐD', value: '84', color: Color(0xFF10B981), icon: Icons.check_circle),
            MiniStat(label: 'VN', value: '86', color: Color(0xFF6366F1), icon: Icons.flag),
          ])),
          const SizedBox(height: 32),

          // CustomDataTable
          const Text('CustomDataTable', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: const CustomDataTable(
              columns: ['NHÂN VIÊN', 'KHU VỰC', 'TRẠNG THÁI', 'THAO TÁC'],
              rows: [
                ['Nguyễn Văn A', 'Hà Nội', 'Active', 'actions'],
                ['Trần Thị B', 'TP.HCM', 'Pending', 'actions'],
                ['Lee Wei', 'Beijing', 'Off', 'actions'],
              ],
            ),
          ),
        ]),
      ),
    );
  }
}

// ===== SHARED WIDGETS =====

class SectionHeader extends StatelessWidget {
  final String title, subtitle;
  const SectionHeader({super.key, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
      Text(subtitle, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
    ]);
  }
}

class StatItem extends StatelessWidget {
  final String title, value;
  final IconData icon;
  final Color iconColor, bgColor;
  const StatItem({super.key, required this.title, required this.value, required this.icon, required this.iconColor, required this.bgColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(children: [
        Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: iconColor, size: 24)),
        const SizedBox(width: 16),
        Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(title, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        ]),
      ]),
    );
  }
}

class MiniStat extends StatelessWidget {
  final String label, value;
  final Color color;
  final IconData icon;
  const MiniStat({super.key, required this.label, required this.value, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.1))),
      child: Row(children: [
        Icon(icon, color: color, size: 16), const SizedBox(width: 8),
        Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(label, style: TextStyle(color: color.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.bold)),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        ]),
      ]),
    );
  }
}

class CustomDataTable extends StatelessWidget {
  final List<String> columns;
  final List<List<String>> rows;
  final bool isAccount;
  const CustomDataTable({super.key, required this.columns, required this.rows, this.isAccount = false});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(scrollDirection: Axis.horizontal, child: DataTable(
      headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)), headingRowHeight: 40, horizontalMargin: 20, columnSpacing: 30,
      columns: columns.map((c) => DataColumn(label: Text(c, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))))).toList(),
      rows: rows.map((r) => DataRow(cells: r.asMap().entries.map((e) {
        final v = e.value;
        if (v == 'actions') return DataCell(Row(mainAxisSize: MainAxisSize.min, children: [IconButton(onPressed: () {}, icon: const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF2563EB))), IconButton(onPressed: () {}, icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent))]));
        if (['Active', 'On Break', 'Off', 'Pending'].contains(v)) {
          final sc = v == 'Active' ? Colors.green : (v == 'On Break' || v == 'Pending' ? Colors.orange : Colors.red);
          return DataCell(Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: sc.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: sc.withOpacity(0.3))), child: Text(v, style: TextStyle(color: sc, fontSize: 11, fontWeight: FontWeight.bold))));
        }
        return DataCell(Text(v, style: TextStyle(fontSize: 13, fontWeight: e.key == (isAccount ? 1 : 0) ? FontWeight.w600 : FontWeight.normal)));
      }).toList())).toList(),
    ));
  }
}
