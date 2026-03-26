import 'package:flutter/material.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  const SectionHeader({super.key, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        Text(subtitle, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
      ],
    );
  }
}

class StatItem extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;
  final Color bgColor;

  const StatItem({super.key, required this.title, required this.value, required this.icon, required this.iconColor, required this.bgColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
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

class MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;
  const MiniStat({super.key, required this.label, required this.value, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.1))),
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

class CustomDataTable extends StatelessWidget {
  final List<String> columns;
  final List<List<String>> rows;
  final bool isAccount;

  const CustomDataTable({super.key, required this.columns, required this.rows, this.isAccount = false});

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
        columns: columns.map((c) => DataColumn(label: Text(c, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))))).toList(),
        rows: rows.map((r) => DataRow(cells: r.asMap().entries.map((e) {
          final cellValue = e.value;
          if (cellValue == 'actions') {
            return DataCell(Row(children: [
              IconButton(onPressed: () {}, icon: const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF2563EB))),
              IconButton(onPressed: () {}, icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent)),
            ]));
          }
          if (['Active', 'On Break', 'Off', 'Pending'].contains(cellValue)) {
            Color statusColor = cellValue == 'Active' ? Colors.green : (cellValue == 'On Break' || cellValue == 'Pending' ? Colors.orange : Colors.red);
            return DataCell(Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: statusColor.withOpacity(0.3))),
              child: Text(cellValue, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
            ));
          }
          return DataCell(Text(cellValue, style: TextStyle(fontSize: 13, fontWeight: e.key == (isAccount ? 1 : 0) ? FontWeight.w600 : FontWeight.normal)));
        }).toList())).toList(),
      ),
    );
  }
}
