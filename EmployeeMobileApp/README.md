# Ứng Dụng Quản Lý Nhân Viên (EmployeeManager Dashboard)

Ứng dụng được thiết kế trên nền tảng Flutter (Mobile/Desktop), đóng vai trò là giao diện Frontend tương tác cho hệ thống Quản lý Nhân sự tổng thể.

## Tổng Quan Các Chức Năng Chính
Dự án cung cấp một Dashboard quản trị toàn diện, phân chia thành các Module nghiệp vụ riêng tư:
- **Dashboard (Bảng điều khiển):** Tổng quan các chỉ số, biểu đồ chung của hệ thống.
- **Nhân viên (Employees):** Quản lý hồ sơ, chi tiết nhân sự (Hiển thị qua cơ sở dữ liệu và Endpoint Backend).
- **Bảng công (Schedules):** Tính năng lõi, theo dõi lịch và trạng thái làm việc thực tế hàng ngày (Có bắt sự kiện Real-time và hiệu ứng báo lỗi khi Network Failed).
- **Tài khoản (Accounts):** Quản lý quyền hệ thống.
- **Khu vực (Areas) & Dự án (Projects):** Phân chia vị trí ban ngành và theo dõi tiến độ triển khai dự án nội bộ.
- **Phản hồi (Feedback):** Xem và phản hồi kênh ý kiến nhân viên.

## Cấu Trúc Mã Nguồn Chuẩn Hóa
Toàn bộ dự án đã được refactor (tái cấu trúc) từ các màn hình (Views) độc lập thành một hệ sinh thái Component đồng nhất. Các lớp dịch vụ lõi bao gồm:

### 1. Backend Integration (`lib/api_service.dart`)
Tầng Dịch vụ chuyên biệt xử lý mọi giao tiếp với hệ thống ASP.NET Core (`Employee.API`). Nó chịu trách nhiệm gọi các RESTful Endpoints (VD: `/api/daily`, `/api/employee`) và phân tích dữ liệu JSON thô trả về vào các Model dữ liệu, giúp giảm tải Logic tại tầng Giao diện.

### 2. State & Data Handling (`Các file *_view.dart`)
Hiển thị dữ liệu, đặc biệt là danh sách và biểu mẫu (Data Tables), dựa hoàn toàn vào `StatefulWidget`. Việc chuyển đổi này cho phép ứng dụng phản chiếu (Bind) trực tiếp dữ liệu từ API, đồng thời hiển thị tiến trình đang tải (Loading Animations) và Catch Error bảo thủ giúp ứng dụng không bị văng tĩnh mịch khi đường mạng lỗi.

### 3. Smart Navigation Layout (`lib/main.dart` & `lib/app_drawer.dart`)
- Sử dụng cấu trúc **Navigation Drawer** chung (Nằm trong `app_drawer.dart`), đóng vai trò như một menu điều hướng không thay đổi (Persistent Toolbar).
- Hiển thị linh hoạt dựa vào **`IndexedStack`**: Khảo sát các thay đổi của Controller để chuyển trang. Khi click đổi màn hình, ứng dụng chi lật các chỉ mục (Indexed) thay vì vẽ lại từ đầu. Chìa khóa này giúp **giữ vững (Cache) trạng thái** (State, Data, Cuộn dọc) của một View ngay cả khi bạn đã chuyển qua Tab khác và quay trở lại.

### 4. Reusable UI Components (`lib/widgets.dart`)
Các đoạn code tiện ích giao diện lập lại nhiều lần (như Card tiêu đề, định dạng Table Header, Nút Action) được tách rời vào thư viện dùng chung `widgets.dart`. Quá trình này giúp giữ cho mỗi File `*_view.dart` trở nên trong suốt, ngắn gọn, và dễ dàng Maintain (Bảo trì) khi quy mô ứng dụng mở rộng.
