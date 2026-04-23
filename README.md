# StockHub - Nền tảng Thông tin Chứng khoán & Hệ thống Giám sát An ninh

**StockHub** là đồ án kết thúc môn Vibe Coding, tập trung vào việc xây dựng một giao diện website tài chính chuyên nghiệp kết hợp với cơ chế bảo mật đa tầng.

## 🚀 Tính năng chính
- **Giao diện Tài chính:** Theo dõi chỉ số VN-Index thời gian thực thông qua TradingView Widget.
- **Central Security Server:** Hệ thống máy chủ trung tâm giám sát luồng dữ liệu (Sniffing), quản trị rủi ro và ngăn chặn xâm nhập.
- **Xác thực đa tầng:** Tích hợp Firebase Realtime Database để quản lý người dùng và xác thực OTP qua EmailJS.
- **Phân quyền người dùng:** Chế độ hiển thị nội dung Premium (Tin tức chi tiết, Đội ngũ chuyên gia) chỉ dành cho người dùng đã đăng nhập.

## 🛠 Công nghệ sử dụng
- **Frontend:** HTML5, CSS3, JavaScript (ES6), Boxicons.
- **Backend/Database:** Firebase Realtime Database.
- **Security:** Sniffing logic, EmailJS (OTP Service).
- **Tools:** Visual Studio Code, GitHub Pages.

## 📂 Cấu trúc dự án
- `index.html`: Giao diện chính và luồng đăng nhập/đăng ký.
- `server_2.html`: Giao diện điều khiển của máy chủ an ninh trung tâm.
- `style.css`: Quản lý giao diện và hiệu ứng Premium mode.
- `script.js`: Xử lý logic nghiệp vụ, kết nối Firebase và giám sát traffic.

## 👤 Thành viên thực hiện
Nhóm StockHub - Trường Đại học Ngân hàng TP.HCM (HUB).
