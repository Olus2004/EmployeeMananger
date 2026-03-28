import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(
  debugShowCheckedModeBanner: false,
  home: AreasPage(),
));

class AreasPage extends StatelessWidget {
  const AreasPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: const Text('Khu vực', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Khu vực', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              Text('Quản lý các địa điểm làm việc', style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
            ]),
            ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add, size: 18), label: const Text('Thêm Khu vực'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
          ]),
          const SizedBox(height: 24),
          LayoutBuilder(builder: (context, c) {
            int count = c.maxWidth > 900 ? 3 : (c.maxWidth > 600 ? 2 : 1);
            return GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: count, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 2.5, children: const [
              _Stat(t: 'Tổng khu vực', v: '6', i: Icons.location_on, ic: Color(0xFF2563EB), bg: Color(0xFFEFF6FF)),
              _Stat(t: 'Hoạt động', v: '5', i: Icons.check_circle_outline, ic: Color(0xFF10B981), bg: Color(0xFFECFDF5)),
              _Stat(t: 'Không hoạt động', v: '1', i: Icons.block, ic: Color(0xFF64748B), bg: Color(0xFFF8FAFC)),
            ]);
          }),
          const SizedBox(height: 24),
          Container(
            width: double.infinity,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Padding(padding: EdgeInsets.all(16.0), child: Row(children: [Icon(Icons.location_on, color: Color(0xFF2563EB), size: 20), SizedBox(width: 8), Text('Danh sách khu vực', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))])),
              const Divider(height: 1),
              Container(color: const Color(0xFFF8FAFC), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: const Row(children: [
                  _Col('ID', flex: 1), _Col('TÊN KHU VỰC', flex: 3), _Col('MÔ TẢ', flex: 4), _Col('TRẠNG THÁI', flex: 2), _Col('THAO TÁC', flex: 2),
                ])),
              const Divider(height: 1),
              _row('1', 'Hà Nội', 'Trụ sở chính khu vực phía Bắc', true),
              _row('2', 'TP.HCM', 'Chi nhánh phía Nam', true),
              _row('3', 'Đà Nẵng', 'Văn phòng miền Trung', true),
              _row('4', 'Beijing', 'Văn phòng Trung Quốc - Bắc Kinh', true),
              _row('5', 'Shanghai', 'Văn phòng Trung Quốc - Thượng Hải', true),
              _row('6', 'Hải Phòng', 'Đang tạm ngừng hoạt động', false),
            ]),
          ),
        ]),
      ),
    );
  }

  static Widget _row(String id, String name, String desc, bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(children: [
        Expanded(flex: 1, child: Text('#$id', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        Expanded(flex: 3, child: Row(children: [
          CircleAvatar(radius: 14, backgroundColor: const Color(0xFF2563EB), child: Text(name[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11))),
          const SizedBox(width: 8),
          Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13), overflow: TextOverflow.ellipsis)),
        ])),
        Expanded(flex: 4, child: Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)), overflow: TextOverflow.ellipsis)),
        Expanded(flex: 2, child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
          decoration: BoxDecoration(color: active ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10), border: Border.all(color: active ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0))),
          child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(active ? Icons.check_circle : Icons.block, size: 10, color: active ? const Color(0xFF10B981) : const Color(0xFF64748B)), const SizedBox(width: 3), Text(active ? 'Hoạt động' : 'Không HĐ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? const Color(0xFF10B981) : const Color(0xFF64748B)))]),
        )),
        Expanded(flex: 2, child: Row(children: [
          _actBtn(Icons.edit_outlined, 'Sửa', const Color(0xFF2563EB)),
          const SizedBox(width: 6),
          _actBtn(Icons.delete_outline, 'Xóa', Colors.redAccent),
        ])),
      ]),
    );
  }

  static Widget _actBtn(IconData icon, String label, Color color) {
    return InkWell(onTap: () {}, borderRadius: BorderRadius.circular(8), child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5), decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(8), border: Border.all(color: color.withOpacity(0.2))),
      child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 12, color: color), const SizedBox(width: 3), Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color))])));
  }
}

class _Col extends StatelessWidget {
  final String label; final int flex;
  const _Col(this.label, {this.flex = 1});
  @override
  Widget build(BuildContext context) => Expanded(flex: flex, child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))));
}

class _Stat extends StatelessWidget {
  final String t, v; final IconData i; final Color ic, bg;
  const _Stat({required this.t, required this.v, required this.i, required this.ic, required this.bg});
  @override
  Widget build(BuildContext context) {
    return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)), child: Icon(i, color: ic, size: 24)), const SizedBox(width: 16),
        Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(t, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)), Text(v, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))])]));
  }
}
