### 📝 ISSUE 1: Tái cấu trúc giao diện và tích hợp ứng dụng Flutter

**Tiêu đề:** 
`[UI/Refactor] Tái cấu trúc giao diện và thiết lập khung điều hướng (Navigation Bar) chính thức`

**Mô tả:**
Tái cấu trúc lại các màn hình (view) độc lập hiện tại thành các Component có thể tái sử dụng và ghép nối chúng thành một ứng dụng Flutter hoàn chỉnh thông qua file `main.dart`. 

**Các công việc đã thực hiện:**
- [x] Sắp xếp lại cấu trúc thư mục chuẩn của Flutter: Nhóm thư mục `lib/` và file `pubspec.yaml` vào project độc lập `EmployeeMobileApp`.
- [x] Khởi tạo các file cấu hình nền tảng (Web, Windows) bằng lệnh `flutter create .`.
- [x] Lược bỏ các Scaffold dư thừa và hàm `main()` rác trong 7 file view (Dashboard, Accounts, Employees, Areas, Projects, Schedules, Feedback).
- [x] Nhúng toàn bộ các View vào khung sườn `IndexedStack` để giữ trạng thái màn hình khi chuyển tab qua menu Drawer trong `main.dart`.

***

### 📝 ISSUE 2: Kết nối API Backend cho màn hình Bảng công

**Tiêu đề:** 
`[Feature] Kết nối API báo cáo Bảng công (Daily) với Backend ASP.NET Core`

**Mô tả:**
Triển khai HTTP client để thay thế dữ liệu giao diện (hardcode) tại màn hình Bảng công (`schedules_view.dart`) bằng dữ liệu thực (Real-time data) gọi từ Backend C# (`Employee.API\Controllers\DailyController`).

**Các công việc đã thực hiện:**
- [x] Tích hợp package `http: ^1.2.0` vào `pubspec.yaml` để hỗ trợ gọi API.
- [x] Tạo service class `api_service.dart` chuyên đảm nhiệm kết nối với endpoint `http://localhost:5000/api/daily` và phân tích dữ liệu JSON trả về.
- [x] Chuyển đổi `SchedulesPage` từ dạng `StatelessWidget` sang `StatefulWidget` để có thể hứng và xử lý dữ liệu động.
- [x] Ánh xạ (Map) thành công các tham số từ C# API Model (`fullname`, `employeeId`, `workStart`, `workEnd`, `status`) vào Flutter Data Table.
- [x] Xây dựng UI Loading (CircularProgress) hiển thị trong lúc gọi API, và xử lý cảnh báo khi Fetch dữ liệu thất bại.

**Hướng dẫn kiểm thử:**
1. Khởi chạy Backend `Employee.API` trên máy (Port 5000).
2. Chạy ứng dụng Flutter (`flutter run`), chuyển qua tab Bảng công.
3. Xác nhận danh sách nhân viên xuất hiện khớp với Database.

***

### 📝 ISSUE 3: Kết nối API Quản lý Nhân viên (Kế hoạch)

**Tiêu đề:** 
`[Feature Plan] Tích hợp CSDL Backend cho màn hình Quản lý Nhân viên`

**Mô tả:**
Issue này lên kế hoạch cho luồng công việc tích hợp dữ liệu thật từ Backend C# (`Employee.API\Controllers\EmployeeController`) lên giao diện danh sách Nhân viên (`employees_view.dart`) của ứng dụng Flutter. Mục tiêu là thay thế toàn bộ dữ liệu mẫu (dummy data) bằng dữ liệu Database.

**Kế hoạch triển khai (To-Do):**
- [ ] **Mở rộng `api_service.dart`**: Viết thêm hàm `fetchEmployees()` để lấy dữ liệu từ endpoint `GET http://localhost:5000/api/employee`.
- [ ] **Chuyển đổi View sang State**: Refactor `employees_view.dart` thành `StatefulWidget`.
- [ ] **Data Binding**: Ánh xạ dữ liệu JSON trả về với các tham số tương ứng trên UI (như `id`, `name`, `type/quoctich`, `area/khuvuc`, `project`, `status`).
- [ ] **Xử lý UX/UI**: Viết mã xử lý hiệu ứng Loading, Catch Error (Báo lỗi Mạng/API) khi đang tải danh sách.
- [ ] **Thêm thao tác tính năng**: Liên kết sự kiện nhấn nút "Thêm NV", "Sửa", "Xóa" tương ứng với các hàm gọi API C#.

**Hướng dẫn kiểm thử dự kiến:**
1. Chạy API Backend (Cổng mặc định: 5000).
2. Tải giao diện Flutter tab "Nhân viên".
3. Xác nhận bảng danh sách phản chiếu đúng CSDL, và thanh công cụ đếm (Tổng NV, Hoạt động, Đang nghỉ, VN/CN) đồng bộ chính xác với API.
