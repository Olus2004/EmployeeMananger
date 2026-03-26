import 'package:flutter/material.dart';
import 'widgets.dart';

class AccountsView extends StatelessWidget {
  const AccountsView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SectionHeader(title: 'Tài khoản', subtitle: 'Quản lý tài khoản người dùng'),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Thêm Tài khoản'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const _AccountStatsRow(),
          const SizedBox(height: 24),
          const _AccountListCard(),
        ],
      ),
    );
  }
}

class _AccountStatsRow extends StatelessWidget {
  const _AccountStatsRow();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      int count = constraints.maxWidth > 900 ? 3 : (constraints.maxWidth > 600 ? 2 : 1);
      return GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: count,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 2.5,
        children: const [
          StatItem(title: 'Tổng tài khoản', value: '12', icon: Icons.group, iconColor: Color(0xFF2563EB), bgColor: Color(0xFFEFF6FF)),
          StatItem(title: 'Hoạt động', value: '10', icon: Icons.check_circle_outline, iconColor: Color(0xFF10B981), bgColor: Color(0xFFECFDF5)),
          StatItem(title: 'Không hoạt động', value: '2', icon: Icons.block, iconColor: Color(0xFF64748B), bgColor: Color(0xFFF8FAFC)),
        ],
      );
    });
  }
}

class _AccountListCard extends StatelessWidget {
  const _AccountListCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Danh sách tài khoản', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
          Divider(height: 1),
          CustomDataTable(
            columns: ['ID', 'TÊN ĐĂNG NHẬP', 'TRẠNG THÁI', 'NGÀY TẠO', 'THAO TÁC'],
            rows: [
              ['1', 'admin', 'Active', '2026-01-01', 'actions'],
              ['2', 'manager_vn', 'Active', '2026-02-15', 'actions'],
              ['3', 'supervisor_cn', 'Pending', '2026-03-10', 'actions'],
              ['4', 'guest_user', 'Off', '2026-03-20', 'actions'],
              ['5', 'test_account', 'Active', '2026-03-25', 'actions'],
            ],
            isAccount: true,
          ),
        ],
      ),
    );
  }
}
