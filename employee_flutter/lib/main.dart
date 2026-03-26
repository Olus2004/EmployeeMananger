import 'package:flutter/material.dart';

void main() {
  runApp(const TeamApp());
}

class TeamApp extends StatelessWidget {
  const TeamApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Đội Ngũ Nhân Viên',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.light,
        ),
        fontFamily: 'Roboto', // Sử dụng font mặc định hoặc Google Fonts nếu cần
      ),
      home: const TeamListPage(),
    );
  }
}

class Member {
  final String name;
  final String role;
  final String bio;
  final String imageUrl;
  final Color themeColor;

  const Member({
    required this.name,
    required this.role,
    required this.bio,
    required this.imageUrl,
    required this.themeColor,
  });
}

const List<Member> members = [
  Member(
    name: 'Nguyễn Văn A',
    role: 'Senior Developer',
    bio: 'Chuyên gia Flutter với 5 năm kinh nghiệm trong việc xây dựng các ứng dụng đa nền tảng hiệu năng cao.',
    imageUrl: 'https://picsum.photos/id/1/200/300', // Thay link ảnh tại đây
    themeColor: Colors.blueAccent,
  ),
  Member(
    name: 'Trần Thị B',
    role: 'UI/UX Designer',
    bio: 'Đam mê tạo ra các giao diện người dùng tinh tế, hiện đại và tập trung vào trải nghiệm người dùng tối ưu.',
    imageUrl: 'https://picsum.photos/id/101/200/300', // Thay link ảnh tại đây
    themeColor: Colors.pinkAccent,
  ),
  Member(
    name: 'Lê Văn C',
    role: 'Backend Engineer',
    bio: 'Kiến trúc sư hệ thống, chuyên gia về Cloud và Microservices, đảm bảo hệ thống luôn ổn định và bảo mật.',
    imageUrl: 'https://picsum.photos/id/2/200/300', // Thay link ảnh tại đây
    themeColor: Colors.indigoAccent,
  ),
  Member(
    name: 'Phạm Thị D',
    role: 'Project Manager',
    bio: 'Người điều hành dự án dày dặn kinh nghiệm, luôn đảm bảo mọi kế hoạch được thực thi đúng tiến độ và chất lượng.',
    imageUrl: 'https://picsum.photos/id/3/200/300', // Thay link ảnh tại đây
    themeColor: Colors.tealAccent,
  ),
  Member(
    name: 'Hoàng Văn E',
    role: 'Mobile Developer',
    bio: 'Lập trình viên nhiệt huyết, luôn tìm tòi và áp dụng các công nghệ mới nhất vào quy trình phát triển.',
    imageUrl: 'https://picsum.photos/id/4/200/300', // Thay link ảnh tại đây
    themeColor: Colors.orangeAccent,
  ),
];

class TeamListPage extends StatelessWidget {
  const TeamListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200.0,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'ĐỘI NGŨ CỦA CHÚNG TÔI',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: Colors.white,
                  shadows: [Shadow(blurRadius: 10, color: Colors.black45)],
                ),
              ),
              centerTitle: true,
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.deepPurple, Colors.indigo],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: Icon(
                    Icons.groups_rounded,
                    size: 80,
                    color: Colors.white.withOpacity(0.2),
                  ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final member = members[index];
                  return MemberCard(member: member);
                },
                childCount: members.length,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class MemberCard extends StatelessWidget {
  final Member member;

  const MemberCard({super.key, required this.member});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => MemberDetailPage(member: member),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Hero(
                  tag: member.name,
                  child: Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                      image: DecorationImage(
                        image: NetworkImage(member.imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        member.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: member.themeColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          member.role,
                          style: TextStyle(
                            color: member.themeColor,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        member.bio,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 16,
                  color: Colors.grey,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class MemberDetailPage extends StatelessWidget {
  final Member member;

  const MemberDetailPage({super.key, required this.member});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Stack(
              children: [
                Hero(
                  tag: member.name,
                  child: Container(
                    height: 400,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        image: NetworkImage(member.imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 100,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.transparent,
                          Colors.white.withOpacity(0.8),
                          Colors.white,
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    member.name,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    member.role.toUpperCase(),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: member.themeColor,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Giới thiệu',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    member.bio,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 40),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildSocialButton(Icons.mail_outline_rounded, 'Liên hệ'),
                      _buildSocialButton(Icons.link_rounded, 'LinkedIn'),
                    ],
                  ),
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialButton(IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.black),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}
