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
- [x] **Mở rộng `api_service.dart`**: Viết thêm hàm `fetchEmployees()` để lấy dữ liệu từ endpoint `GET http://localhost:5000/api/employee`.
- [x] **Chuyển đổi View sang State**: Refactor `employees_view.dart` thành `StatefulWidget`.
- [x] **Data Binding**: Ánh xạ dữ liệu JSON trả về với các tham số tương ứng trên UI (như `id`, `name`, `type/quoctich`, `area/khuvuc`, `project`, `status`).
- [x] **Xử lý UX/UI**: Viết mã xử lý hiệu ứng Loading, Catch Error (Báo lỗi Mạng/API) khi đang tải danh sách.
- [x] **Thêm thao tác tính năng**: Liên kết sự kiện nhấn nút "Thêm NV", "Sửa", "Xóa" tương ứng với các hàm gọi API C#.

**Hướng dẫn kiểm thử dự kiến:**
1. Chạy API Backend (Cổng mặc định: 5000).
2. Tải giao diện Flutter tab "Nhân viên".
3. Xác nhận bảng danh sách phản chiếu đúng CSDL, và thanh công cụ đếm (Tổng NV, Hoạt động, Đang nghỉ, VN/CN) đồng bộ chính xác với API.

***

### 📝 ISSUE 4: Xây dựng Form Thêm/Sửa Cập nhật Nhân viên ✅

**Tiêu đề:** 
`[Feature] Xây dựng UI Form và Tích hợp API Thêm mới, Cập nhật thông tin Nhân viên`

**Mô tả:**
Hoàn thiện quy trình quản lý nhân sự bằng cách thiết kế Popup (Dialog) để nhập liệu cấu trúc thông tin của nhân viên mới hoặc chỉnh sửa nhân viên hiện có. Gắn kết dữ liệu nhập liệu từ Form với các endpoint `POST` và `PUT` của `Employee.API\Controllers\EmployeeController`.

**Các công việc đã thực hiện:**
- [x] **Mở rộng `api_service.dart`**: Viết thêm hàm `createEmployee(data)` và `updateEmployee(id, data)` để gửi HTTP Request dạng JSON lên Backend.
- [x] **Thiết kế UI Dialog (`EmployeeFormDialog`)**: Tạo Widget độc lập chứa các Field điền vào (Họ tên, Tên khác, Khu vực, Loại/Quốc tịch, Trạng thái hoạt động).
- [x] **Xác thực dữ liệu (Validation)**: Ràng buộc lỗi đỏ trên giao diện khi người dùng để trống các thông tin bắt buộc (Họ tên, Khu vực).
- [x] **Tích hợp Nút bấm**: Liên kết sự kiện mở Popup vào nút "Thêm NV" và icon nút "Sửa" trên từng dòng của bảng.
- [x] **Làm mới dữ liệu (Refresh State)**: Khi API trả về thành công, tự động tắt Dialog và gọi lại `_fetchData()` để cập nhật danh sách mới nhất.

**Hướng dẫn kiểm thử:**
1. Khởi chạy Backend `Employee.API` (Port 5005).
2. Chạy Flutter app, vào tab "Nhân viên".
3. Nhấn nút **"Thêm NV"** → Dialog xuất hiện → Điền thông tin → Nhấn "Thêm mới".
4. Nhấn icon **✏️ Sửa** trên hàng bất kỳ → Dialog xuất hiện với dữ liệu cũ → Chỉnh sửa → Nhấn "Cập nhật".
5. Xác nhận danh sách tự động làm mới sau mỗi thao tác thành công.

***

### 📝 ISSUE 5: Tìm kiếm & Lọc Nhân viên (Kế hoạch)

**Tiêu đề:** 
`[Feature Plan] Triển khai tính năng Tìm kiếm và Lọc nâng cao trên bảng Nhân viên`

**Mô tả:**
Nâng cao tính năng quản lý nhân viên bằng cách kích hoạt thanh tìm kiếm và bộ lọc tại màn hình `employees_view.dart`. Cho phép người dùng thu hẹp danh sách theo từ khóa, loại nhân viên (VN/TQ), trạng thái hoạt động, hoặc khu vực – toàn bộ thực hiện phía Flutter (client-side filtering) mà không cần gọi thêm API.

**Kế hoạch triển khai (To-Do):**
- [ ] **State cho bộ lọc**: Thêm biến `_searchQuery`, `_filterType` (`null | 1 | 2`) và `_filterActive` (`null | true | false`) vào `_EmployeesPageState`.
- [ ] **Computed list**: Tạo getter `_filteredEmployees` trả về danh sách đã lọc từ `_employees` dựa trên các biến trạng thái trên.
- [ ] **Kích hoạt TextField tìm kiếm**: Gắn `onChanged` vào ô "Tìm kiếm nhân viên..." để cập nhật `_searchQuery` và gọi `setState`.
- [ ] **Thanh Filter Chip**: Thêm hàng Filter Chip (Tất cả / VN / TQ / Hoạt động / Không HĐ) ngay phía dưới thanh tìm kiếm.
- [ ] **Đếm kết quả**: Hiển thị số lượng kết quả lọc hiện tại (ví dụ: "Đang hiển thị 12/34 nhân viên") trên header bảng.

**Hướng dẫn kiểm thử dự kiến:**
1. Gõ một phần tên nhân viên vào thanh tìm kiếm → bảng tự thu hẹp về các dòng khớp.
2. Nhấn Chip "TQ" → chỉ hiển thị nhân viên Trung Quốc.
3. Nhấn Chip "Hoạt động" kết hợp với tìm kiếm → danh sách kết hợp đúng cả hai điều kiện.
4. Nhấn "Tất cả" để reset về danh sách đầy đủ.
