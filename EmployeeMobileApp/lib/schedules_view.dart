import 'package:flutter/material.dart';
import 'api_service.dart';

class SchedulesPage extends StatefulWidget {
  const SchedulesPage({super.key});

  @override
  State<SchedulesPage> createState() => _SchedulesPageState();
}

class _SchedulesPageState extends State<SchedulesPage> {
  List<dynamic> _dailies = [];
  int _vnCount = 0;
  int _cnCount = 0;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final data = await ApiService.fetchDailies();
      final stats = await ApiService.fetchStats();
      setState(() { 
        _dailies = data; 
        _vnCount = stats['vnCount'] ?? 0;
        _cnCount = stats['cnCount'] ?? 0;
        _isLoading = false; 
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _initializeData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final data = await ApiService.initializeDailies();
      final stats = await ApiService.fetchStats();
      setState(() { 
        _dailies = data; 
        _vnCount = stats['vnCount'] ?? 0;
        _cnCount = stats['cnCount'] ?? 0;
        _isLoading = false; 
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Bảng công', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              Text('Điểm danh và theo dõi thời gian làm việc', style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
            ]),
            Row(children: [
              Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
                child: Row(children: [const Icon(Icons.calendar_today, size: 16, color: Color(0xFF2563EB)), const SizedBox(width: 8), Text('${DateTime.now().day.toString().padLeft(2, '0')}/${DateTime.now().month.toString().padLeft(2, '0')}/${DateTime.now().year}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))])),
              const SizedBox(width: 8),
              OutlinedButton.icon(onPressed: _fetchData, icon: const Icon(Icons.refresh, size: 16), label: const Text('Tải lại'), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
              const SizedBox(width: 8),
              ElevatedButton.icon(onPressed: _initializeData, icon: const Icon(Icons.playlist_add, size: 18), label: const Text('Khởi tạo'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
            ]),
          ]),
          const SizedBox(height: 24),
          LayoutBuilder(builder: (context, c) {
            int count = c.maxWidth > 900 ? 5 : (c.maxWidth > 600 ? 3 : 2);
            int total = _dailies.length;
            int present = _dailies.where((d) => d['status'] == 1).length;
            int pending = total - present;
            return GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: count, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 3.5, children: [
              _mini('Tổng', '$total', const Color(0xFF2563EB), Icons.group),
              _mini('Đã ĐD', '$present', const Color(0xFF10B981), Icons.check_circle),
              _mini('Chưa ĐD', '$pending', const Color(0xFFF59E0B), Icons.pending),
              _mini('VN tháng', '$_vnCount', const Color(0xFF6366F1), Icons.flag),
              _mini('CN tháng', '$_cnCount', const Color(0xFFF43F5E), Icons.flag),
            ]);
          }),
          const SizedBox(height: 24),
          Container(
            width: double.infinity,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Padding(padding: const EdgeInsets.all(16.0), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Row(children: [Icon(Icons.calendar_month, color: Color(0xFF2563EB), size: 20), SizedBox(width: 8), Text('Điểm danh trong ngày', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))]),
                SizedBox(width: 200, height: 36, child: TextField(decoration: InputDecoration(hintText: 'Tìm nhân viên...', hintStyle: const TextStyle(fontSize: 12), prefixIcon: const Icon(Icons.search, size: 16), contentPadding: EdgeInsets.zero, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0)))))),
              ])),
              const Divider(height: 1),
              // Header
              Container(color: const Color(0xFFF8FAFC), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: const Row(children: [
                  _Col('NHÂN VIÊN', flex: 3), _Col('KHU VỰC', flex: 2), _Col('DỰ ÁN', flex: 2),
                  _Col('TRẠNG THÁI', flex: 2), _Col('GIỜ VÀO', flex: 1), _Col('GIỜ RA', flex: 1), _Col('THAO TÁC', flex: 3),
                ])),
              const Divider(height: 1),
              if (_isLoading)
                const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))
              else if (_error != null)
                Padding(padding: const EdgeInsets.all(24), child: Center(child: Text('Lỗi: $_error', style: const TextStyle(color: Colors.red))))
              else if (_dailies.isEmpty)
                const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('Không có dữ liệu điểm danh nào hôm nay')))
              else
                ..._dailies.map((d) {
                  final projects = d['projectCodes'] != null ? (d['projectCodes'] as List).join(', ') : '';
                  return _aRow(
                    d['fullname']?.toString() ?? 'Khuyết danh',
                    d['employeeId']?.toString() ?? '',
                    d['areaName']?.toString() ?? '',
                    projects,
                    d['status'] ?? 0,
                    d['workStart']?.toString() ?? '',
                    d['workEnd']?.toString() ?? ''
                  );
                }),
            ]),
          ),
        ]),
      );
  }

  static Widget _mini(String label, String value, Color color, IconData icon) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 12), decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.1))),
      child: Row(children: [Icon(icon, color: color, size: 16), const SizedBox(width: 8),
        Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(label, style: TextStyle(color: color.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.bold)), Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color))])]));
  }

  static Widget _aRow(String name, String id, String area, String project, int status, String tIn, String tOut) {
    final sMap = {0: ('Trống', const Color(0xFF94A3B8)), 1: ('Làm', const Color(0xFF10B981)), 2: ('Nghỉ', const Color(0xFFF59E0B)), 3: ('Xin nghỉ', const Color(0xFFF43F5E))};
    final (sLabel, sColor) = sMap[status] ?? ('Trống', const Color(0xFF94A3B8));
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(children: [
        Expanded(flex: 3, child: Row(children: [
          CircleAvatar(radius: 14, backgroundColor: const Color(0xFF2563EB), child: Text(name[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11))),
          const SizedBox(width: 8),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
            Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12), overflow: TextOverflow.ellipsis),
            Text('ID: $id', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
          ])),
        ])),
        Expanded(flex: 2, child: Text(area, style: const TextStyle(fontSize: 12))),
        Expanded(flex: 2, child: Text(project, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF7C3AED)))),
        Expanded(flex: 2, child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(color: sColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8), border: Border.all(color: sColor.withOpacity(0.3))),
          child: Text(sLabel, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: sColor), textAlign: TextAlign.center),
        )),
        Expanded(flex: 1, child: Text(tIn.isNotEmpty ? tIn : '--:--', style: TextStyle(fontSize: 12, color: tIn.isNotEmpty ? const Color(0xFF1E293B) : const Color(0xFF94A3B8)), textAlign: TextAlign.center)),
        Expanded(flex: 1, child: Text(tOut.isNotEmpty ? tOut : '--:--', style: TextStyle(fontSize: 12, color: tOut.isNotEmpty ? const Color(0xFF1E293B) : const Color(0xFF94A3B8)), textAlign: TextAlign.center)),
        Expanded(flex: 3, child: Row(mainAxisSize: MainAxisSize.min, children: [
          _btn(Icons.search, 'Chi tiết', const Color(0xFF2563EB)),
          const SizedBox(width: 4),
          _iconBtn(Icons.check_circle, const Color(0xFF10B981), status == 1),
          const SizedBox(width: 4),
          _iconBtn(Icons.cancel, const Color(0xFFEF4444), false),
        ])),
      ]),
    );
  }

  static Widget _btn(IconData icon, String label, Color color) {
    return InkWell(onTap: () {}, borderRadius: BorderRadius.circular(6), child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(6), border: Border.all(color: color.withOpacity(0.2))),
      child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 12, color: color), const SizedBox(width: 4), Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color))])));
  }

  static Widget _iconBtn(IconData icon, Color color, bool filled) {
    return InkWell(onTap: () {}, borderRadius: BorderRadius.circular(8), child: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: filled ? color : color.withOpacity(0.05), borderRadius: BorderRadius.circular(8), border: Border.all(color: color.withOpacity(0.2))),
      child: Icon(icon, size: 16, color: filled ? Colors.white : color)));
  }
}

class _Col extends StatelessWidget {
  final String label; final int flex;
  const _Col(this.label, {this.flex = 1});
  @override
  Widget build(BuildContext context) => Expanded(flex: flex, child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))));
}
