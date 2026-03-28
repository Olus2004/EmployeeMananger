import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(debugShowCheckedModeBanner: false, home: ProjectsPage()));

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: const Text('Dự án', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
      body: SingleChildScrollView(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Dự án', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))), Text('Quản lý dự án đang triển khai', style: TextStyle(color: Color(0xFF64748B), fontSize: 14))]),
          Row(children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))), child: const Row(children: [Icon(Icons.calendar_month, size: 16, color: Color(0xFF6366F1)), SizedBox(width: 8), Text('03/2026', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600))])),
            const SizedBox(width: 12),
            ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add, size: 18), label: const Text('Thêm Dự án'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
          ]),
        ]),
        const SizedBox(height: 24),
        LayoutBuilder(builder: (ctx, c) => GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: c.maxWidth > 700 ? 2 : 1, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 3, children: const [
          _Stat(t: 'Tổng dự án', v: '5', i: Icons.account_tree, ic: Color(0xFF7C3AED), bg: Color(0xFFF5F3FF)),
          _Stat(t: 'Tổng NV/tháng', v: '87', i: Icons.group, ic: Color(0xFF2563EB), bg: Color(0xFFEFF6FF)),
        ])),
        const SizedBox(height: 24),
        Container(width: double.infinity, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Padding(padding: EdgeInsets.all(16), child: Row(children: [Icon(Icons.account_tree, color: Color(0xFF7C3AED), size: 20), SizedBox(width: 8), Text('Danh sách dự án', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))])),
            const Divider(height: 1),
            Container(color: const Color(0xFFF8FAFC), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), child: const Row(children: [_H('ID', 1), _H('DỰ ÁN', 3), _H('MÔ TẢ', 4), _H('NV/THÁNG', 2), _H('THÁNG', 2), _H('THAO TÁC', 3)])),
            const Divider(height: 1),
            _r('1', 'Project Alpha', 'ALPHA', 'Dự án xây dựng hạ tầng', 24, '03/2026'),
            _r('2', 'Project Beta', 'BETA', 'Dự án phần mềm quản lý', 18, '03/2026'),
            _r('3', 'Gamma Corp', 'GAMMA', 'Hợp tác đối tác Nhật Bản', 15, '03/2026'),
            _r('4', 'Delta Area', 'DELTA', 'Mở rộng khu vực miền Trung', 20, '03/2026'),
            _r('5', 'Epsilon Sub', 'EPS', 'Dự án phụ trợ logistics', 10, '03/2026'),
          ])),
      ])),
    );
  }

  static Widget _r(String id, String name, String code, String desc, int emp, String month) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(children: [
        Expanded(flex: 1, child: Text('#$id', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        Expanded(flex: 3, child: Row(children: [CircleAvatar(radius: 14, backgroundColor: const Color(0xFF7C3AED), child: Text(code[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11))), const SizedBox(width: 8), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12), overflow: TextOverflow.ellipsis), Text(code, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)))]))])),
        Expanded(flex: 4, child: Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)), overflow: TextOverflow.ellipsis)),
        Expanded(flex: 2, child: Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3), decoration: BoxDecoration(color: const Color(0xFFF5F3FF), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFDDD6FE))), child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.group, size: 12, color: Color(0xFF6366F1)), const SizedBox(width: 3), Text('$emp', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF6366F1)))]))),
        Expanded(flex: 2, child: Text(month, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)))),
        Expanded(flex: 3, child: Row(children: [_ab(Icons.list_alt, 'Chi tiết', const Color(0xFF6366F1)), const SizedBox(width: 4), _ib(Icons.edit_outlined, const Color(0xFF2563EB)), const SizedBox(width: 4), _ib(Icons.delete_outline, Colors.redAccent)])),
      ]));
  }

  static Widget _ab(IconData i, String l, Color c) => InkWell(onTap: () {}, child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5), decoration: BoxDecoration(color: c.withOpacity(0.05), borderRadius: BorderRadius.circular(8), border: Border.all(color: c.withOpacity(0.2))), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(i, size: 12, color: c), const SizedBox(width: 3), Text(l, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: c))])));
  static Widget _ib(IconData i, Color c) => InkWell(onTap: () {}, child: Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: c.withOpacity(0.05), borderRadius: BorderRadius.circular(8), border: Border.all(color: c.withOpacity(0.2))), child: Icon(i, size: 14, color: c)));
}

class _H extends StatelessWidget { final String l; final int f; const _H(this.l, this.f); @override Widget build(BuildContext c) => Expanded(flex: f, child: Text(l, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))); }
class _Stat extends StatelessWidget { final String t, v; final IconData i; final Color ic, bg; const _Stat({required this.t, required this.v, required this.i, required this.ic, required this.bg}); @override Widget build(BuildContext c) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))), child: Row(children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)), child: Icon(i, color: ic, size: 24)), const SizedBox(width: 16), Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(t, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)), Text(v, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))])])); }
