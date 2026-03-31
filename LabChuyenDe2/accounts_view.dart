import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(debugShowCheckedModeBanner: false, home: AccountsPage()));

class AccountsPage extends StatelessWidget {
  const AccountsPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, title: const Text('Quản lý Tài khoản', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
      body: SingleChildScrollView(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Tài khoản', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))), Text('Quản lý tài khoản người dùng', style: TextStyle(color: Color(0xFF64748B), fontSize: 14))]),
          ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.add, size: 18), label: const Text('Thêm Tài khoản'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
        ]),
        const SizedBox(height: 24),
        LayoutBuilder(builder: (ctx, c) => GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: c.maxWidth > 900 ? 3 : (c.maxWidth > 600 ? 2 : 1), crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 2.5, children: const [
          _Stat(t: 'Tổng tài khoản', v: '12', i: Icons.group, ic: Color(0xFF2563EB), bg: Color(0xFFEFF6FF)),
          _Stat(t: 'Hoạt động', v: '10', i: Icons.check_circle_outline, ic: Color(0xFF10B981), bg: Color(0xFFECFDF5)),
          _Stat(t: 'Không hoạt động', v: '2', i: Icons.block, ic: Color(0xFF64748B), bg: Color(0xFFF8FAFC)),
        ])),
        const SizedBox(height: 24),
        Container(width: double.infinity, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Padding(padding: EdgeInsets.all(16), child: Text('Danh sách tài khoản', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
            const Divider(height: 1),
            Container(color: const Color(0xFFF8FAFC), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), child: const Row(children: [_H('ID', 1), _H('TÊN ĐĂNG NHẬP', 3), _H('TRẠNG THÁI', 2), _H('NGÀY TẠO', 2), _H('THAO TÁC', 2)])),
            const Divider(height: 1),
            _r('1', 'admin', 'Active', '2026-01-01'),
            _r('2', 'manager_vn', 'Active', '2026-02-15'),
            _r('3', 'supervisor_cn', 'Pending', '2026-03-10'),
            _r('4', 'guest_user', 'Off', '2026-03-20'),
            _r('5', 'test_account', 'Active', '2026-03-25'),
          ])),
      ])),
    );
  }

  static Widget _r(String id, String user, String status, String date) {
    final sc = {'Active': Colors.green, 'Pending': Colors.orange, 'Off': Colors.red}[status] ?? Colors.grey;
    return Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(children: [
        Expanded(flex: 1, child: Text('#$id', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
        Expanded(flex: 3, child: Text(user, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        Expanded(flex: 2, child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: sc.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: sc.withOpacity(0.3))), child: Text(status, style: TextStyle(color: sc, fontSize: 11, fontWeight: FontWeight.bold), textAlign: TextAlign.center))),
        Expanded(flex: 2, child: Text(date, style: const TextStyle(fontSize: 13))),
        Expanded(flex: 2, child: Row(children: [
          InkWell(onTap: () {}, child: const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF2563EB))),
          const SizedBox(width: 12),
          InkWell(onTap: () {}, child: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent)),
        ])),
      ]));
  }
}

class _H extends StatelessWidget { final String l; final int f; const _H(this.l, this.f); @override Widget build(BuildContext c) => Expanded(flex: f, child: Text(l, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)))); }
class _Stat extends StatelessWidget { final String t, v; final IconData i; final Color ic, bg; const _Stat({required this.t, required this.v, required this.i, required this.ic, required this.bg}); @override Widget build(BuildContext c) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))), child: Row(children: [Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)), child: Icon(i, color: ic, size: 24)), const SizedBox(width: 16), Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(t, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)), Text(v, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))])])); }

