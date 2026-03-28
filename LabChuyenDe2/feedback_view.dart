import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(debugShowCheckedModeBanner: false, home: FeedbackPage()));

class FeedbackPage extends StatelessWidget {
  const FeedbackPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: const Text('Phản hồi', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
      body: SingleChildScrollView(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Phản hồi', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))), Text('Hệ thống phản hồi từ nhân viên', style: TextStyle(color: Color(0xFF64748B), fontSize: 14))]),
          Row(children: [
            SizedBox(width: 200, height: 38, child: TextField(decoration: InputDecoration(hintText: 'Tìm theo tên NV...', hintStyle: const TextStyle(fontSize: 12), prefixIcon: const Icon(Icons.search, size: 18), contentPadding: EdgeInsets.zero, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0)))))),
            const SizedBox(width: 8),
            Container(height: 38, padding: const EdgeInsets.symmetric(horizontal: 12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))), child: const Row(children: [Icon(Icons.filter_list, size: 16, color: Color(0xFF64748B)), SizedBox(width: 6), Text('Tất cả', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))), Icon(Icons.arrow_drop_down, size: 18, color: Color(0xFF64748B))])),
          ]),
        ]),
        const SizedBox(height: 24),
        LayoutBuilder(builder: (ctx, c) => GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: c.maxWidth > 800 ? 4 : (c.maxWidth > 500 ? 2 : 1), crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.5, children: const [
          _Stat(t: 'Tổng phản hồi', v: '18', i: Icons.forum, ic: Color(0xFF2563EB), bg: Color(0xFFEFF6FF)),
          _Stat(t: 'Đang xử lí', v: '5', i: Icons.access_time, ic: Color(0xFFF59E0B), bg: Color(0xFFFFFBEB)),
          _Stat(t: 'Đã đóng', v: '3', i: Icons.cancel_outlined, ic: Color(0xFFF43F5E), bg: Color(0xFFFFF1F2)),
          _Stat(t: 'Đã hoàn thành', v: '10', i: Icons.check_circle, ic: Color(0xFF10B981), bg: Color(0xFFECFDF5)),
        ])),
        const SizedBox(height: 24),
        Container(width: double.infinity, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Padding(padding: EdgeInsets.all(16), child: Row(children: [Icon(Icons.forum, color: Color(0xFF2563EB), size: 20), SizedBox(width: 8), Text('Danh sách phản hồi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))])),
            const Divider(height: 1),
            // Header
            Container(color: const Color(0xFFF8FAFC), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), child: const Row(children: [_H('ID', 1), _H('NHÂN VIÊN', 2), _H('BẢNG CÔNG', 2), _H('NGÀY GỬI', 2), _H('TT ADMIN', 2), _H('TT NV', 2), _H('THAO TÁC', 2)])),
            const Divider(height: 1),
            _fb('1', 'Nguyễn Văn A', '1', '101', '25/03', '26/03 08:30', 1, 1, 'Sai giờ vào ngày 25/03. Checkin lúc 07:30 nhưng hệ thống ghi 08:30.'),
            _fb('2', 'Trần Thị B', '2', '102', '24/03', '25/03 14:20', 3, 2, 'Trạng thái ngày 24/03 ghi là Nghỉ nhưng tôi đã đi làm ca đêm.'),
            _fb('3', 'Lee Wei', '3', '103', '23/03', '24/03 09:00', 2, 3, 'Xin thay đổi trạng thái từ Di chuyển sang Làm cho ngày 23/03.'),
            _fb('4', 'Phạm Văn C', '4', '104', '22/03', '23/03 16:45', 3, 1, 'Giờ ra bị thiếu, xin bổ sung giờ ra là 18:30.'),
            _fb('5', 'Zhang Min', '5', '105', '21/03', '22/03 10:15', 3, 1, 'Xác nhận ca đêm ngày 21/03, giờ vào 19:30 giờ ra 06:30.'),
          ])),
      ])),
    );
  }

  static Widget _fb(String id, String name, String eid, String tid, String tDay, String sub, int aSt, int eSt, String desc) {
    final am = {1: ('Đang xử lí', const Color(0xFFF59E0B), Icons.access_time), 2: ('Đã đóng', const Color(0xFFF43F5E), Icons.cancel_outlined), 3: ('Hoàn thành', const Color(0xFF10B981), Icons.check_circle)};
    final em = {1: ('Đúng', const Color(0xFF10B981), Icons.check_circle), 2: ('Sai', const Color(0xFFF59E0B), Icons.cancel_outlined), 3: ('Đang xử lí', const Color(0xFFF59E0B), Icons.access_time)};
    final (al, ac, ai) = am[aSt] ?? ('---', const Color(0xFF94A3B8), Icons.help);
    final (el, ec, ei) = em[eSt] ?? ('---', const Color(0xFF94A3B8), Icons.help);
    return Column(children: [
      Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), child: Row(children: [
        Expanded(flex: 1, child: Text('#$id', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF64748B)))),
        Expanded(flex: 2, child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)), Text('ID: $eid', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)))])),
        Expanded(flex: 2, child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [Text('#$tid', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))), Text(tDay, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)))])),
        Expanded(flex: 2, child: Text(sub, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)))),
        Expanded(flex: 2, child: _badge(al, ac, ai)),
        Expanded(flex: 2, child: _badge(el, ec, ei)),
        Expanded(flex: 2, child: Row(children: [_ab(Icons.edit, 'Cập nhật', const Color(0xFF2563EB)), const SizedBox(width: 4), _ab(Icons.delete, 'Xóa', Colors.redAccent)])),
      ])),
      Container(width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), color: const Color(0xFFF8FAFC), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Mô tả: ', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 11, color: Color(0xFF475569))), Expanded(child: Text(desc, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))))])),
      const Divider(height: 1),
    ]);
  }

  static Widget _badge(String l, Color c, IconData i) => Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3), decoration: BoxDecoration(color: c.withOpacity(0.08), borderRadius: BorderRadius.circular(10), border: Border.all(color: c.withOpacity(0.2))), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(i, size: 10, color: c), const SizedBox(width: 3), Text(l, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: c))]));
  static Widget _ab(IconData i, String l, Color c) => InkWell(onTap: () {}, child: Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4), decoration: BoxDecoration(color: c.withOpacity(0.05), borderRadius: BorderRadius.circular(8), border: Border.all(color: c.withOpacity(0.2))), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(i, size: 10, color: c), const SizedBox(width: 3), Text(l, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: c))])));
}

class _H extends StatelessWidget { final String l; final int f; const _H(this.l, this.f); @override Widget build(BuildContext c) => Expanded(flex: f, child: Text(l, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))); }
class _Stat extends StatelessWidget { final String t, v; final IconData i; final Color ic, bg; const _Stat({required this.t, required this.v, required this.i, required this.ic, required this.bg}); @override Widget build(BuildContext c) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))), child: Row(children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)), child: Icon(i, color: ic, size: 24)), const SizedBox(width: 16), Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(t, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)), Text(v, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))])])); }
