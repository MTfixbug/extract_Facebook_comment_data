import tkinter as tk
from tkinter import messagebox
from apify_client import ApifyClient
import csv
import customtkinter as ctk
import os
from datetime import datetime

# Cài đặt theme cho customtkinter
ctk.set_appearance_mode("System")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"

def scrape_comments():
    # Lấy API Token từ input
    api_token = api_token_entry.get().strip()
    if not api_token:
        show_notification("Lỗi", "Vui lòng nhập Token API Apify.")
        return

    url = url_entry.get().strip()
    if not url:
        show_notification("Lỗi", "Vui lòng nhập URL bài viết Facebook.")
        return
        
    # Lấy số lượng comment từ input field
    try:
        max_comments = int(comments_entry.get().strip())
        if max_comments <= 0:
            max_comments = 100  # Mặc định 100 nếu nhập số âm hoặc 0
    except ValueError:
        max_comments = 100  # Mặc định 100 nếu không nhập số hợp lệ
    
    # Hiển thị trạng thái đang xử lý
    status_label.configure(text="Đang xử lý...", text_color="orange")
    root.update()
    
    try:
        client = ApifyClient(api_token)
        
        # Cấu hình input cho Actor
        run_input = {
            "startUrls": [{"url": url}],
            "resultsLimit": max_comments,  # Sử dụng số lượng comment từ input
            "includeNestedComments": True,
            "viewOption": "RANKED_UNFILTERED"
        }
        
        # Hiển thị thông báo đang quét
        status_label.configure(text="Đang quét dữ liệu từ Facebook...", text_color="blue")
        root.update()
        
        # Chạy Actor và chờ hoàn thành
        run = client.actor("apify/facebook-comments-scraper").call(run_input=run_input)
        
        # Hiển thị thông báo đang lấy dữ liệu
        status_label.configure(text="Đang lấy dữ liệu bình luận...", text_color="blue")
        root.update()
        
        # Lấy dữ liệu từ dataset
        dataset_items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        
        if not dataset_items:
            show_notification("Thông báo", "Không tìm thấy bình luận nào.")
            status_label.configure(text="Không tìm thấy bình luận", text_color="red")
            return
        
        # Tạo tên file với timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"facebook_comments_{timestamp}.csv"
        
        # Hiển thị thông báo đang lưu file
        status_label.configure(text="Đang lưu dữ liệu vào file CSV...", text_color="blue")
        root.update()
        
        # Ghi dữ liệu ra file CSV
        with open(filename, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            # Ghi tiêu đề cột
            writer.writerow([
                "commentUrl", "date", "facebookId", "facebookUrl", "feedbackId", "id",
                "inputUrl", "likesCount", "pageAdLibrary/id", "pageAdLibrary/is_business_page_active",
                "postTitle", "profileId", "profileName", "profilePicture", "profileUrl",
                "text", "threadingDepth"
            ])
            
            # Đếm số lượng bình luận đã lấy được
            comment_count = 0
            
            # Ghi dữ liệu từng dòng
            for item in dataset_items:
                writer.writerow([
                    item.get("commentUrl", ""),
                    item.get("date", ""),
                    item.get("facebookId", ""),
                    item.get("facebookUrl", ""),
                    item.get("feedbackId", ""),
                    item.get("id", ""),
                    item.get("inputUrl", ""),
                    item.get("likesCount", ""),
                    item.get("pageAdLibrary", {}).get("id", ""),
                    item.get("pageAdLibrary", {}).get("is_business_page_active", ""),
                    item.get("postTitle", ""),
                    item.get("profileId", ""),
                    item.get("profileName", ""),
                    item.get("profilePicture", ""),
                    item.get("profileUrl", ""),
                    item.get("text", ""),
                    item.get("threadingDepth", "")
                ])
                comment_count += 1
        
        # Hiển thị thông báo thành công
        show_notification("Thành công", f"Đã lưu {comment_count} bình luận vào '{filename}'")
        status_label.configure(text=f"Đã lưu {comment_count} bình luận", text_color="green")
        
        # Hiển thị đường dẫn đầy đủ đến file
        file_path = os.path.abspath(filename)
        path_label.configure(text=f"Đường dẫn: {file_path}")
        
    except Exception as e:
        show_notification("Lỗi", f"Đã xảy ra lỗi: {e}")
        status_label.configure(text="Lỗi khi xử lý dữ liệu", text_color="red")

def show_notification(title, message):
    """Hiển thị thông báo với giao diện tùy chỉnh"""
    messagebox.showinfo(title, message)

# Tạo giao diện người dùng
root = ctk.CTk()
root.title("Facebook Comment Scraper")
root.geometry("600x480")  # Tăng kích thước để chứa thêm field API token
root.resizable(True, True)

# Tạo container chính
main_frame = ctk.CTkFrame(root)
main_frame.pack(fill="both", expand=True, padx=20, pady=20)

# Thêm tiêu đề
header_label = ctk.CTkLabel(
    main_frame, 
    text="📊 Facebook Comment Scraper", 
    font=ctk.CTkFont(size=24, weight="bold")
)
header_label.pack(pady=10)

description_label = ctk.CTkLabel(
    main_frame,
    text="Công cụ trích xuất và phân tích bình luận từ bài viết Facebook",
    font=ctk.CTkFont(size=14)
)
description_label.pack(pady=5)

# Frame chứa input API token
api_token_frame = ctk.CTkFrame(main_frame)
api_token_frame.pack(fill="x", pady=10)

api_token_label = ctk.CTkLabel(api_token_frame, text="Token API Apify:", font=ctk.CTkFont(size=14))
api_token_label.pack(anchor="w", padx=10, pady=5)

api_token_entry = ctk.CTkEntry(api_token_frame, width=400, height=35, placeholder_text="Nhập token API Apify của bạn")
api_token_entry.pack(fill="x", padx=10, pady=5)
api_token_entry.insert(0, "apify_api_bnhOVb47RCCFd1iIRyGxP1qGIQRoiJ11cG15")  # Token mẫu để người dùng dễ nhận biết

# Frame chứa input url
input_frame = ctk.CTkFrame(main_frame)
input_frame.pack(fill="x", pady=10)

url_label = ctk.CTkLabel(input_frame, text="URL bài viết Facebook:", font=ctk.CTkFont(size=14))
url_label.pack(anchor="w", padx=10, pady=5)

url_entry = ctk.CTkEntry(input_frame, width=400, height=35, placeholder_text="Nhập URL bài viết Facebook")
url_entry.pack(fill="x", padx=10, pady=5)

# Frame chứa input số lượng comment
comment_frame = ctk.CTkFrame(main_frame)
comment_frame.pack(fill="x", pady=10)

comments_label = ctk.CTkLabel(
    comment_frame, 
    text="Số lượng bình luận cần lấy:", 
    font=ctk.CTkFont(size=14)
)
comments_label.pack(anchor="w", padx=10, pady=5)

comments_entry = ctk.CTkEntry(
    comment_frame, 
    width=200, 
    height=35, 
    placeholder_text="Mặc định: 100"
)
comments_entry.pack(anchor="w", padx=10, pady=5)
comments_entry.insert(0, "100")  # Giá trị mặc định

# Thêm nút quét
button_frame = ctk.CTkFrame(main_frame)
button_frame.pack(fill="x", pady=10)

scan_button = ctk.CTkButton(
    button_frame, 
    text="Bắt đầu quét", 
    command=scrape_comments,
    height=40,
    font=ctk.CTkFont(size=16, weight="bold")
)
scan_button.pack(pady=10)

# Thêm trạng thái
status_label = ctk.CTkLabel(
    main_frame, 
    text="Sẵn sàng quét", 
    font=ctk.CTkFont(size=14, weight="bold"),
    text_color="green"
)
status_label.pack(pady=5)

# Thêm đường dẫn file
path_label = ctk.CTkLabel(
    main_frame, 
    text="", 
    font=ctk.CTkFont(size=12),
    wraplength=550
)
path_label.pack(pady=5)

# Thêm footer
footer_label = ctk.CTkLabel(
    main_frame,
    text="© 2023 - Phát triển bởi ForLeChi",
    font=ctk.CTkFont(size=11),
    text_color="gray"
)
footer_label.pack(side="bottom", pady=5)

root.mainloop()
