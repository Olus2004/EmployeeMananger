import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(debugShowCheckedModeBanner: false, home: DashboardPage()));

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: const Text('Dashboard', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        actions: [Container(margin: const EdgeInsets.only(right: 12), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(8)), child: const Row(children: [Icon(Icons.calendar_today, size: 14, color: Color(0xFF64748B)), SizedBox(width: 8), Text('28/03/2026', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))]))]),
      body: SingleChildScrollView(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Dashboard', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))), Text('Tổng quan hệ thống', style: TextStyle(color: Color(0xFF64748B), fontSize: 14))]),
        const SizedBox(height: 24),
        // Top stats
        LayoutBuilder(builder: (ctx, c) => GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: c.maxWidth > 900 ? 3 : (c.maxWidth > 600 ? 2 : 1), crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 2.5, children: const [
          _Stat(t: 'Đi làm hôm nay', v: '84', i: Icons.work_outline, ic: Color(0xFF059669), bg: Color(0xFFECFDF5)),
          _Stat(t: 'Ca ngày', v: '52', i: Icons.wb_sunny_outlined, ic: Color(0xFFD97706), bg: Color(0xFFFFFBEB)),
          _Stat(t: 'Ca đêm', v: '32', i: Icons.nightlight_outlined, ic: Color(0xFF4F46E5), bg: Color(0xFFEEF2FF)),
        ])),
        const SizedBox(height: 16),
        // Mini stats
        LayoutBuilder(builder: (ctx, c) => GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: c.maxWidth > 800 ? 5 : (c.maxWidth > 500 ? 3 : 2), crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 3.5, children: [
          _mini('Tổng', '124', const Color(0xFF2563EB), Icons.group), _mini('Đã ĐD', '84', const Color(0xFF10B981), Icons.check_circle),
          _mini('Chưa ĐD', '40', const Color(0xFFF59E0B), Icons.pending), _mini('VN', '86', const Color(0xFF6366F1), Icons.flag), _mini('CN', '38', const Color(0xFFF43F5E), Icons.flag),
        ])),
        const SizedBox(height: 24),
        // Attendance table
        Container(width: double.infinity, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Padding(padding: const EdgeInsets.all(16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Row(children: [Icon(Icons.calendar_month, color: Color(0xFF2563EB), size: 20), SizedBox(width: 8), Text('Điểm danh trong ngày', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))]),
              SizedBox(width: 200, height: 36, child: TextField(decoration: InputDecoration(hintText: 'Tìm kiếm...', hintStyle: const TextStyle(fontSize: 12), prefixIcon: const Icon(Icons.search, size: 16), contentPadding: EdgeInsets.zero, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0)))))),
            ])),
            const Divider(height: 1),
            Container(color: const Color(0xFFF8FAFC), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), child: const Row(children: [_H('NHÂN VIÊN', 3), _H('KHU VỰC', 2), _H('DỰ ÁN', 2), _H('TRẠNG THÁI', 2), _H('GIỜ VÀO', 1), _H('GIỜ RA', 1)])),
            const Divider(height: 1),
            _r('Nguyễn Văn A', 'Hà Nội', 'Alpha', 'Active', '08:00', '17:00'),
            _r('Trần Thị B', 'TP.HCM', 'Beta', 'Active', '08:15', '17:30'),
            _r('Lee Wei', 'Beijing', 'Gamma', 'On Break', '09:00', '--:--'),
            _r('Phạm C', 'Đà Nẵng', 'Delta', 'Off', '--:--', '--:--'),
            _r('Zhang Min', 'Shanghai', 'Epsilon', 'Pending', '--:--', '--:--'),
          ])),
      ])),
    );
  }

  static Widget _mini(String l, String v, Color c, IconData i) => Container(padding: const EdgeInsets.symmetric(horizontal: 12), decoration: BoxDecoration(color: c.withOpacity(0.05), borderRadius: BorderRadius.circular(10), border: Border.all(color: c.withOpacity(0.1))), child: Row(children: [Icon(i, color: c, size: 16), const SizedBox(width: 8), Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(l, style: TextStyle(color: c.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.bold)), Text(v, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: c))])]));

  static Widget _r(String e, String a, String p, String s, String i, String o) {
    final sc = {'Active': Colors.green, 'On Break': Colors.orange, 'Pending': Colors.orange, 'Off': Colors.red}[s] ?? Colors.grey;
    return Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(children: [
        Expanded(flex: 3, child: Text(e, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        Expanded(flex: 2, child: Text(a, style: const TextStyle(fontSize: 12))),
        Expanded(flex: 2, child: Text(p, style: const TextStyle(fontSize: 12))),
        Expanded(flex: 2, child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: sc.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: sc.withOpacity(0.3))), child: Text(s, style: TextStyle(color: sc, fontSize: 11, fontWeight: FontWeight.bold), textAlign: TextAlign.center))),
        Expanded(flex: 1, child: Text(i, style: const TextStyle(fontSize: 12), textAlign: TextAlign.center)),
        Expanded(flex: 1, child: Text(o, style: const TextStyle(fontSize: 12), textAlign: TextAlign.center)),
      ]));
  }
}

class _H extends StatelessWidget { final String l; final int f; const _H(this.l, this.f); @override Widget build(BuildContext c) => Expanded(flex: f, child: Text(l, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))); }
class _Stat extends StatelessWidget { final String t, v; final IconData i; final Color ic, bg; const _Stat({required this.t, required this.v, required this.i, required this.ic, required this.bg}); @override Widget build(BuildContext c) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))), child: Row(children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)), child: Icon(i, color: ic, size: 24)), const SizedBox(width: 16), Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(t, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)), Text(v, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))])])); }
