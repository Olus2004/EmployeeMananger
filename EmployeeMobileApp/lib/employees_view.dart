import 'package:flutter/material.dart';

class EmployeesPage extends StatelessWidget {
  const EmployeesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Nhân viên', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              Text('Danh sách nhân viên toàn hệ thống', style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
            ]),
            Row(children: [
              SizedBox(width: 220, height: 38, child: TextField(decoration: InputDecoration(hintText: 'Tìm kiếm nhân viên...', hintStyle: const TextStyle(fontSize: 12), prefixIcon: const Icon(Icons.search, size: 18), contentPadding: EdgeInsets.zero, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0)))))),
              const SizedBox(width: 12),
              ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add, size: 18), label: const Text('Thêm NV'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
            ]),
          ]),
          const SizedBox(height: 24),
          LayoutBuilder(builder: (context, c) {
            int count = c.maxWidth > 900 ? 5 : (c.maxWidth > 600 ? 3 : 2);
            return GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: count, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.5, children: const [
              _Stat(t: 'Tổng nhân viên', v: '124', i: Icons.group, ic: Color(0xFF2563EB), bg: Color(0xFFEFF6FF)),
              _Stat(t: 'Hoạt động', v: '112', i: Icons.check_circle_outline, ic: Color(0xFF10B981), bg: Color(0xFFECFDF5)),
              _Stat(t: 'Không hoạt động', v: '12', i: Icons.block, ic: Color(0xFF64748B), bg: Color(0xFFF8FAFC)),
              _Stat(t: 'Việt Nam', v: '86', i: Icons.flag, ic: Color(0xFF6366F1), bg: Color(0xFFEEF2FF)),
              _Stat(t: 'Trung Quốc', v: '38', i: Icons.flag, ic: Color(0xFFF43F5E), bg: Color(0xFFFFF1F2)),
            ]);
          }),
          const SizedBox(height: 24),
          Container(
            width: double.infinity,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Padding(padding: EdgeInsets.all(16.0), child: Row(children: [Icon(Icons.badge, color: Color(0xFF2563EB), size: 20), SizedBox(width: 8), Text('Danh sách nhân viên', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))])),
              const Divider(height: 1),
              // Table Header
              Container(
                color: const Color(0xFFF8FAFC),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: const Row(children: [
                  _Col('ID', 50), _Col('NHÂN VIÊN', 160), _Col('LOẠI', 70), _Col('KHU VỰC', 90),
                  _Col('NGÀY CÔNG', 80), _Col('NGHỈ', 50), _Col('TỔNG', 50), _Col('DỰ ÁN', 100),
                  _Col('TRẠNG THÁI', 110), _Col('THAO TÁC', 80),
                ]),
              ),
              const Divider(height: 1),
              // Table Rows
              _empRow('1', 'Nguyễn Văn A', '', 'VN', 'Hà Nội', '22', '2', '24', 'Alpha, Beta', true),
              _empRow('2', 'Trần Thị B', '', 'VN', 'TP.HCM', '20', '4', '24', 'Beta', true),
              _empRow('3', 'Lee Wei', '李伟', 'TQ', 'Beijing', '18', '1', '19', 'Gamma', true),
              _empRow('4', 'Phạm Văn C', '', 'VN', 'Đà Nẵng', '15', '5', '20', 'Delta', false),
              _empRow('5', 'Zhang Min', '张敏', 'TQ', 'Shanghai', '21', '0', '21', 'Epsilon', true),
              _empRow('6', 'Lê Hoàng D', '', 'VN', 'Hà Nội', '19', '3', '22', 'Alpha', true),
            ]),
          ),
        ]),
      );
  }

  static Widget _empRow(String id, String name, String other, String type, String area, String work, String leave, String total, String project, bool active) {
    final isVN = type == 'VN';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(children: [
        SizedBox(width: 50, child: Text('#$id', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        SizedBox(width: 160, child: Row(children: [
          CircleAvatar(radius: 14, backgroundColor: const Color(0xFF2563EB), child: Text(name[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11))),
          const SizedBox(width: 8),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
            Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12), overflow: TextOverflow.ellipsis),
            if (other.isNotEmpty) Text(other, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
          ])),
        ])),
        SizedBox(width: 70, child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
          decoration: BoxDecoration(color: isVN ? const Color(0xFFEFF6FF) : const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(10), border: Border.all(color: isVN ? const Color(0xFFBFDBFE) : const Color(0xFFFECDD3))),
          child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.flag, size: 10, color: isVN ? const Color(0xFF2563EB) : const Color(0xFFF43F5E)), const SizedBox(width: 3), Text(type, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isVN ? const Color(0xFF2563EB) : const Color(0xFFF43F5E)))]),
        )),
        SizedBox(width: 90, child: Text(area, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis)),
        SizedBox(width: 80, child: Text(work, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF2563EB)))),
        SizedBox(width: 50, child: Text(leave, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFFF59E0B)))),
        SizedBox(width: 50, child: Text(total, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
        SizedBox(width: 100, child: Text(project, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF7C3AED)), overflow: TextOverflow.ellipsis)),
        SizedBox(width: 110, child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
          decoration: BoxDecoration(color: active ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10), border: Border.all(color: active ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0))),
          child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(active ? Icons.check_circle : Icons.block, size: 10, color: active ? const Color(0xFF10B981) : const Color(0xFF64748B)), const SizedBox(width: 3), Text(active ? 'Hoạt động' : 'Không HĐ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? const Color(0xFF10B981) : const Color(0xFF64748B)))]),
        )),
        SizedBox(width: 80, child: Row(mainAxisSize: MainAxisSize.min, children: [
          InkWell(onTap: () {}, child: const Icon(Icons.edit_outlined, size: 16, color: Color(0xFF2563EB))),
          const SizedBox(width: 8),
          InkWell(onTap: () {}, child: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent)),
        ])),
      ]),
    );
  }
}

class _Col extends StatelessWidget {
  final String label;
  final double width;
  const _Col(this.label, this.width);
  @override
  Widget build(BuildContext context) => SizedBox(width: width, child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))));
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
