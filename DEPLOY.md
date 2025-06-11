# Hướng dẫn Triển khai trên GitHub Pages

Dưới đây là các bước để đẩy mã nguồn lên GitHub và triển khai trang web trên GitHub Pages:

## Bước 1: Đẩy mã nguồn lên GitHub

```bash
# Chuyển đến thư mục dự án
cd /home/Thaddeus/Desktop/Code/ForLeChi

# Khởi tạo Git repository nếu chưa có
git init

# Thêm tất cả các file vào staging area
git add .

# Commit các thay đổi
git commit -m "Initial commit: Web version with Tailwind CSS"

# Kết nối với GitHub repository của bạn
git remote add origin https://github.com/MTfixbug/extract_Facebook_comment_data.git

# Đẩy mã nguồn lên GitHub
git push -u origin main
# Hoặc dùng "master" nếu nhánh chính là "master"
# git push -u origin master
```

## Bước 2: Cấu hình GitHub Pages

1. Mở trình duyệt và truy cập vào repository GitHub của bạn: `https://github.com/MTfixbug/extract_Facebook_comment_data`

2. Vào tab "Settings" (Cài đặt)

3. Ở menu bên trái, nhấp vào "Pages" (GitHub Pages)

4. Trong phần "Build and deployment", chọn:
   - Source: Deploy from a branch
   - Branch: main (hoặc master) / root
   - Nhấn Save

5. Đợi vài phút để GitHub Pages được kích hoạt và triển khai

## Bước 3: Kiểm tra trang web

Sau khi triển khai thành công, trang web của bạn sẽ có sẵn tại URL:
```
https://mtfixbug.github.io/extract_Facebook_comment_data/
```

## Lưu ý:

1. Đảm bảo file `index.html` tồn tại ở thư mục gốc của repository

2. GitHub Pages có thể mất vài phút để cập nhật sau khi đẩy mã nguồn lên

3. Nếu bạn gặp vấn đề với việc triển khai, bạn có thể kiểm tra tab "Actions" trên GitHub để xem nhật ký xây dựng

4. Đảm bảo tất cả các đường dẫn trong HTML là đường dẫn tương đối hoặc URL tuyệt đối (không sử dụng đường dẫn tuyệt đối của máy)

5. Không bao gồm thông tin nhạy cảm như token API cá nhân trong mã nguồn được đẩy lên GitHub 