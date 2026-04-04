import 'package:flutter/material.dart';
import 'api_service.dart';

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeFormDialog – dùng cho cả Thêm mới & Chỉnh sửa nhân viên
// ─────────────────────────────────────────────────────────────────────────────
class EmployeeFormDialog extends StatefulWidget {
  /// Truyền null → chế độ Thêm mới; truyền object → chế độ Cập nhật
  final Map<String, dynamic>? employee;

  const EmployeeFormDialog({super.key, this.employee});

  @override
  State<EmployeeFormDialog> createState() => _EmployeeFormDialogState();
}

class _EmployeeFormDialogState extends State<EmployeeFormDialog> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _nameCtrl;
  late final TextEditingController _nameOtherCtrl;
  late final TextEditingController _areaCtrl;

  /// 1 = VN, 2 = TQ
  int _type = 1;
  bool _active = true;
  bool _saving = false;

  bool get _isEdit => widget.employee != null;

  @override
  void initState() {
    super.initState();
    final e = widget.employee;
    _nameCtrl      = TextEditingController(text: e?['fullname']?.toString() ?? '');
    _nameOtherCtrl = TextEditingController(text: e?['fullnameOther']?.toString() ?? '');
    _areaCtrl      = TextEditingController(text: e?['areaName']?.toString() ?? '');
    if (e != null) {
      _type   = (e['type'] == 2) ? 2 : 1;
      _active = e['active'] == 1;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _nameOtherCtrl.dispose();
    _areaCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final data = {
      'fullname':      _nameCtrl.text.trim(),
      'fullnameOther': _nameOtherCtrl.text.trim(),
      'areaName':      _areaCtrl.text.trim(),
      'type':          _type,
      'active':        _active ? 1 : 0,
    };

    bool ok;
    if (_isEdit) {
      final id = widget.employee!['employeeId']?.toString() ?? '';
      ok = await ApiService.updateEmployee(id, data);
    } else {
      ok = await ApiService.createEmployee(data);
    }

    if (!mounted) return;
    setState(() => _saving = false);

    if (ok) {
      Navigator.of(context).pop(true); // trả về true để cha biết cần refresh
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEdit ? 'Cập nhật thất bại!' : 'Thêm nhân viên thất bại!'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: SizedBox(
        width: 460,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              // ── Header ──
              Row(children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.person_add_alt_1, color: Color(0xFF2563EB), size: 20),
                ),
                const SizedBox(width: 12),
                Text(
                  _isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới',
                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                ),
                const Spacer(),
                IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => Navigator.of(context).pop(false)),
              ]),
              const SizedBox(height: 20),

              // ── Họ và tên ──
              _label('Họ và tên *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameCtrl,
                decoration: _inputDeco('Nhập họ và tên nhân viên'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập họ và tên' : null,
              ),
              const SizedBox(height: 14),

              // ── Tên khác (tiếng TQ) ──
              _label('Tên khác (nếu có)'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameOtherCtrl,
                decoration: _inputDeco('VD: 张伟'),
              ),
              const SizedBox(height: 14),

              // ── Khu vực ──
              _label('Khu vực *'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _areaCtrl,
                decoration: _inputDeco('VD: Khu A'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập khu vực' : null,
              ),
              const SizedBox(height: 14),

              // ── Loại / Quốc tịch ──
              _label('Loại nhân viên *'),
              const SizedBox(height: 6),
              Row(children: [
                _typeChip(1, 'Việt Nam (VN)', const Color(0xFF2563EB), const Color(0xFFEFF6FF), const Color(0xFFBFDBFE)),
                const SizedBox(width: 10),
                _typeChip(2, 'Trung Quốc (TQ)', const Color(0xFFF43F5E), const Color(0xFFFFF1F2), const Color(0xFFFECDD3)),
              ]),
              const SizedBox(height: 14),

              // ── Trạng thái ──
              _label('Trạng thái'),
              const SizedBox(height: 6),
              GestureDetector(
                onTap: () => setState(() => _active = !_active),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: _active ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _active ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0)),
                  ),
                  child: Row(children: [
                    Icon(_active ? Icons.check_circle : Icons.block,
                        size: 16, color: _active ? const Color(0xFF10B981) : const Color(0xFF64748B)),
                    const SizedBox(width: 8),
                    Text(_active ? 'Đang hoạt động' : 'Không hoạt động',
                        style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: _active ? const Color(0xFF10B981) : const Color(0xFF64748B))),
                    const Spacer(),
                    Switch(
                      value: _active,
                      activeColor: const Color(0xFF10B981),
                      onChanged: (v) => setState(() => _active = v),
                    ),
                  ]),
                ),
              ),
              const SizedBox(height: 24),

              // ── Buttons ──
              Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                TextButton(
                  onPressed: _saving ? null : () => Navigator.of(context).pop(false),
                  child: const Text('Hủy', style: TextStyle(color: Color(0xFF64748B))),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _saving ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _saving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(_isEdit ? 'Cập nhật' : 'Thêm mới'),
                ),
              ]),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _label(String text) => Text(text,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151)));

  InputDecoration _inputDeco(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5)),
    errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.redAccent)),
  );

  Widget _typeChip(int val, String label, Color fg, Color bg, Color border) {
    final selected = _type == val;
    return GestureDetector(
      onTap: () => setState(() => _type = val),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? bg : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selected ? border : const Color(0xFFE2E8F0), width: selected ? 1.5 : 1),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.flag, size: 14, color: selected ? fg : const Color(0xFF94A3B8)),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
              color: selected ? fg : const Color(0xFF94A3B8))),
        ]),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EmployeesPage
// ─────────────────────────────────────────────────────────────────────────────
class EmployeesPage extends StatefulWidget {
  const EmployeesPage({super.key});

  @override
  State<EmployeesPage> createState() => _EmployeesPageState();
}

class _EmployeesPageState extends State<EmployeesPage> {
  List<dynamic> _employees = [];
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
      final data = await ApiService.fetchEmployees();
      setState(() { _employees = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _delete(String id) async {
    final ok = await showDialog<bool>(context: context, builder: (c) => AlertDialog(
      title: const Text('Xác nhận'), content: const Text('Bạn có chắc muốn xóa nhân viên này?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Hủy')),
        TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Xóa', style: TextStyle(color: Colors.red))),
      ]));
    if (ok == true) {
      setState(() => _isLoading = true);
      final success = await ApiService.deleteEmployee(id);
      if (success) {
        _fetchData();
      } else {
        setState(() { _error = 'Xóa thất bại'; _isLoading = false; });
      }
    }
  }

  /// Mở dialog Thêm mới
  Future<void> _openAddDialog() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => const EmployeeFormDialog(),
    );
    if (result == true) _fetchData();
  }

  /// Mở dialog Cập nhật
  Future<void> _openEditDialog(Map<String, dynamic> employee) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => EmployeeFormDialog(employee: employee),
    );
    if (result == true) _fetchData();
  }

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
              ElevatedButton.icon(
                onPressed: _openAddDialog,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Thêm NV'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              ),
            ]),
          ]),
          const SizedBox(height: 24),
          LayoutBuilder(builder: (context, c) {
            int count = c.maxWidth > 900 ? 5 : (c.maxWidth > 600 ? 3 : 2);
            int total = _employees.length;
            int activeCount = _employees.where((e) => e['active'] == 1).length;
            int inactiveCount = total - activeCount;
            int vnCount = _employees.where((e) => e['type'] == 1 || e['type'] == 'VN').length;
            int tqCount = _employees.where((e) => e['type'] == 2 || e['type'] == 'TQ').length;
            return GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: count, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.5, children: [
              _Stat(t: 'Tổng nhân viên', v: '$total', i: Icons.group, ic: const Color(0xFF2563EB), bg: const Color(0xFFEFF6FF)),
              _Stat(t: 'Hoạt động', v: '$activeCount', i: Icons.check_circle_outline, ic: const Color(0xFF10B981), bg: const Color(0xFFECFDF5)),
              _Stat(t: 'Không hoạt động', v: '$inactiveCount', i: Icons.block, ic: const Color(0xFF64748B), bg: const Color(0xFFF8FAFC)),
              _Stat(t: 'Việt Nam', v: '$vnCount', i: Icons.flag, ic: const Color(0xFF6366F1), bg: const Color(0xFFEEF2FF)),
              _Stat(t: 'Trung Quốc', v: '$tqCount', i: Icons.flag, ic: const Color(0xFFF43F5E), bg: const Color(0xFFFFF1F2)),
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
              if (_isLoading)
                const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))
              else if (_error != null)
                Padding(padding: const EdgeInsets.all(24), child: Center(child: Text('Lỗi: $_error', style: const TextStyle(color: Colors.red))))
              else if (_employees.isEmpty)
                const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('Không có dữ liệu nhân viên')))
              else
                ..._employees.map((e) {
                  final typeStr = e['type'] == 1 ? 'VN' : (e['type'] == 2 ? 'TQ' : e['type'].toString());
                  final projects = e['projectCodes'] != null ? (e['projectCodes'] as List).join(', ') : '';
                  return _empRow(
                    e,
                    e['employeeId']?.toString() ?? '',
                    e['fullname']?.toString() ?? 'Khuyết danh',
                    e['fullnameOther']?.toString() ?? '',
                    typeStr,
                    e['areaName']?.toString() ?? '',
                    e['workDays']?.toString() ?? '0',
                    e['leaveDays']?.toString() ?? '0',
                    e['totalDays']?.toString() ?? '0',
                    projects,
                    e['active'] == 1,
                  );
                }),
            ]),
          ),
        ]),
      );
  }

  Widget _empRow(Map<String, dynamic> raw, String id, String name, String other, String type, String area, String work, String leave, String total, String project, bool active) {
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
          InkWell(
            onTap: () => _openEditDialog(raw),
            child: const Icon(Icons.edit_outlined, size: 16, color: Color(0xFF2563EB)),
          ),
          const SizedBox(width: 8),
          InkWell(onTap: () => _delete(id), child: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent)),
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
