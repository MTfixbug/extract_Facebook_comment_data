# Facebook Comment Extractor 🔍

Tool trích xuất bình luận từ các bài đăng công khai trên Facebook, hỗ trợ cả phiên bản Desktop và Web.

![Banner](https://i.imgur.com/YpvTBkJ.png)

## 📖 Giới thiệu

Facebook Comment Extractor là công cụ giúp bạn trích xuất bình luận từ các bài đăng công khai trên Facebook. Công cụ này sử dụng API của Apify để thu thập dữ liệu bình luận và cung cấp cho bạn khả năng lưu trữ và phân tích dữ liệu.

### 🌟 Tính năng chính

- **Thu thập bình luận:** Trích xuất bình luận từ các bài đăng Facebook thông qua URL
- **Tùy chỉnh số lượng:** Chọn số lượng bình luận muốn trích xuất
- **Bình luận lồng nhau:** Hỗ trợ thu thập các phản hồi lồng nhau
- **Xuất dữ liệu:** Lưu kết quả dưới dạng CSV để phân tích sau
- **Giao diện:** Có cả phiên bản Desktop (Python) và Web (JavaScript)

### 📊 Các trường dữ liệu trích xuất được

- `commentUrl`: URL của bình luận
- `date`: Thời gian bình luận
- `facebookId`: ID của bình luận trên Facebook
- `facebookUrl`: URL của bình luận trên Facebook
- `feedbackId`: ID phản hồi
- `id`: ID bình luận
- `inputUrl`: URL của bài đăng gốc
- `likesCount`: Số lượng lượt thích cho bình luận
- `pageAdLibrary/id`: ID của thư viện quảng cáo trang
- `pageAdLibrary/is_business_page_active`: Trạng thái hoạt động của trang doanh nghiệp
- `postTitle`: Tiêu đề của bài đăng
- `profileId`: ID của người bình luận
- `profileName`: Tên của người bình luận
- `profilePicture`: URL ảnh đại diện của người bình luận
- `profileUrl`: URL đến trang cá nhân của người bình luận
- `text`: Nội dung bình luận
- `threadingDepth`: Độ sâu của bình luận

## 🌐 Phiên bản Web

### Sử dụng phiên bản web

Truy cập trang web tại: [https://mtfixbug.github.io/extract_Facebook_comment_data/](https://mtfixbug.github.io/extract_Facebook_comment_data/)

1. Nhập Token API Apify của bạn (hoặc sử dụng token mặc định)
2. Nhập URL bài đăng Facebook
3. Chọn số lượng bình luận tối đa muốn trích xuất
4. Nhấn "Bắt đầu trích xuất" và đợi quá trình hoàn tất
5. Tải xuống kết quả dưới dạng file CSV

### Tính năng nổi bật của phiên bản web

- Giao diện người dùng đẹp mắt với Tailwind CSS
- Không lưu trữ token API - đảm bảo an toàn
- Hiển thị tiến trình xử lý theo thời gian thực
- Xem trước dữ liệu trước khi tải xuống
- Hoạt động hoàn toàn ở phía client, không yêu cầu server

## 💻 Phiên bản Desktop (Python)

### Cài đặt

1. Clone repository:
   ```bash
   git clone https://github.com/MTfixbug/extract_Facebook_comment_data.git
   cd extract_Facebook_comment_data
   ```

2. Tạo và kích hoạt môi trường ảo:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # hoặc
   venv\Scripts\activate  # Windows
   ```

3. Cài đặt dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Sử dụng

1. Chạy ứng dụng:
   ```bash
   python facebook_comment_scraper.py
   ```

2. Nhập thông tin yêu cầu vào giao diện
3. Nhấn "Bắt đầu quét" và đợi quá trình hoàn tất

## 📜 Lưu ý

- Công cụ này chỉ trích xuất được bình luận công khai từ các bài đăng công khai
- Token API Apify có giới hạn số lượng API call cho tài khoản miễn phí
- Tôn trọng quyền riêng tư của người dùng khi sử dụng dữ liệu thu thập được

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo issue hoặc pull request nếu bạn muốn cải thiện dự án.

## 📄 Giấy phép

Dự án này được phát hành dưới giấy phép MIT.