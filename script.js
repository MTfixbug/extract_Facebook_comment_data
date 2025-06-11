// Các biến toàn cục
let extractedData = [];
let csvContent = '';

// Các công cụ trợ giúp DOM
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Khởi tạo các phần tử DOM khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo các công cụ lắng nghe sự kiện
    initEventListeners();

    // Không điền token mặc định
    // Để trống để người dùng tự nhập API key của họ
});

// Khởi tạo các công cụ lắng nghe sự kiện
function initEventListeners() {
    // Xử lý việc gửi biểu mẫu
    $('#scraper-form').addEventListener('submit', handleFormSubmit);

    // Xử lý nút chuyển đổi hiển thị token
    $('#toggle-token').addEventListener('click', toggleTokenVisibility);

    // Xử lý nút tải xuống CSV
    $('#download-csv-btn').addEventListener('click', downloadCSV);

    // Xử lý nút trích xuất mới
    $('#new-extraction-btn').addEventListener('click', resetForm);
}

// Xử lý việc gửi biểu mẫu
async function handleFormSubmit(e) {
    e.preventDefault();

    // Lấy các giá trị đầu vào
    const apifyToken = $('#apify-token').value.trim();
    const postUrl = $('#post-url').value.trim();
    const maxComments = parseInt($('#max-comments').value) || 100;

    // Kiểm tra API token
    if (!apifyToken) {
        alert('Vui lòng nhập Token API Apify.');
        return;
    }

    // Kiểm tra URL
    if (!postUrl) {
        alert('Vui lòng nhập URL bài đăng Facebook.');
        return;
    }

    // Hiển thị thẻ trạng thái và ẩn thẻ kết quả và biểu mẫu
    $('#scraper-form').parentElement.classList.add('hidden');
    $('#status-card').classList.remove('hidden');
    $('#results-card').classList.add('hidden');

    // Đặt lại các biến toàn cục
    extractedData = [];
    csvContent = '';

    try {
        // Ghi nhật ký
        addLogEntry('Đang khởi tạo quá trình trích xuất...');
        updateProgress(10, 'Đang thiết lập kết nối với Apify...');

        // Gọi API Apify để bắt đầu trích xuất bình luận
        const runData = await startApifyActor(apifyToken, postUrl, maxComments);
        
        if (!runData || !runData.id) {
            throw new Error('Không thể khởi động Actor Apify.');
        }

        const runId = runData.id;
        addLogEntry(`Actor đã được khởi động. ID: ${runId}`);
        updateProgress(30, 'Đang thu thập dữ liệu bình luận...');

        // Theo dõi trạng thái của lượt chạy cho đến khi hoàn thành
        await waitForRunToFinish(apifyToken, runId);
        
        addLogEntry('Quá trình thu thập dữ liệu đã hoàn tất.');
        updateProgress(60, 'Đang tải dữ liệu từ Apify...');

        // Lấy dữ liệu từ bộ dữ liệu Apify
        const comments = await fetchDatasetItems(apifyToken, runData.defaultDatasetId);
        
        if (!comments || comments.length === 0) {
            addLogEntry('Không tìm thấy bình luận nào.');
            showResults([]);
            return;
        }

        addLogEntry(`Đã tải ${comments.length} bình luận.`);
        updateProgress(80, 'Đang xử lý dữ liệu...');

        // Chuyển dữ liệu thành định dạng CSV
        processFacebookCommentsData(comments);

        // Hiển thị kết quả
        updateProgress(100, 'Hoàn tất!');
        addLogEntry('Đã xử lý xong dữ liệu.');
        showResults(comments);

    } catch (error) {
        console.error('Lỗi:', error);
        addLogEntry(`LỖI: ${error.message}`);
        updateProgress(100, 'Đã xảy ra lỗi!');
        
        // Hiển thị thông báo lỗi
        setTimeout(() => {
            alert(`Đã xảy ra lỗi: ${error.message}`);
            resetForm();
        }, 1000);
    }
}

// Bắt đầu Actor Apify để trích xuất bình luận
async function startApifyActor(token, url, maxComments) {
    // Sử dụng Actor trực tiếp thay vì task
    const response = await fetch('https://api.apify.com/v2/acts/apify~facebook-comments-scraper/runs?token=' + token, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "startUrls": [{ "url": url }],
            "commentsMode": "RANKED_THREADED",
            "maxComments": maxComments,
            "maxReplies": 999999,
            "maxNestedReplies": 3,
            "scrapeCommentImages": true,
            "scrapeCommenterTimeline": true,
            "includeNestedReplies": true
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Lỗi khi bắt đầu Actor: ${error.message || response.statusText}`);
    }

    return response.json();
}

// Đợi cho lượt chạy hoàn thành
async function waitForRunToFinish(token, runId) {
    let status = 'PENDING';
    
    while (status !== 'SUCCEEDED' && status !== 'FAILED' && status !== 'ABORTED' && status !== 'TIMED_OUT') {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Đợi 3 giây trước khi kiểm tra lại
        
        const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
        if (!response.ok) {
            throw new Error(`Không thể kiểm tra trạng thái của lượt chạy: ${response.statusText}`);
        }
        
        const data = await response.json();
        status = data.status;
        
        // Cập nhật nhật ký
        addLogEntry(`Trạng thái hiện tại: ${status}`);
        
        if (status === 'RUNNING') {
            updateProgress(40, 'Đang thu thập bình luận...');
        } else if (status === 'SUCCEEDED') {
            updateProgress(50, 'Thu thập thành công!');
        } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED_OUT') {
            throw new Error(`Lượt chạy đã ${status}`);
        }
    }
}

// Lấy các mục từ bộ dữ liệu
async function fetchDatasetItems(token, datasetId) {
    const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    
    if (!response.ok) {
        throw new Error(`Không thể lấy dữ liệu: ${response.statusText}`);
    }
    
    return response.json();
}

// Xử lý các bình luận Facebook
function processFacebookCommentsData(comments) {
    // Đặt dữ liệu đã trích xuất
    extractedData = comments;
    
    // Tạo nội dung CSV
    const header = [
        "commentUrl", "date", "facebookId", "facebookUrl", "feedbackId", "id",
        "inputUrl", "likesCount", "pageAdLibrary/id", "pageAdLibrary/is_business_page_active",
        "postTitle", "profileId", "profileName", "profilePicture", "profileUrl",
        "text", "threadingDepth"
    ];
    
    // Thêm hàng tiêu đề
    let rows = [header.join(',')];
    
    // Thêm dữ liệu bình luận
    for (const item of comments) {
        const row = [
            csvEscape(item.commentUrl || ""),
            csvEscape(item.date || ""),
            csvEscape(item.facebookId || ""),
            csvEscape(item.facebookUrl || ""),
            csvEscape(item.feedbackId || ""),
            csvEscape(item.id || ""),
            csvEscape(item.inputUrl || ""),
            csvEscape(item.likesCount?.toString() || "0"),
            csvEscape(item.pageAdLibrary?.id || ""),
            csvEscape(item.pageAdLibrary?.is_business_page_active?.toString() || ""),
            csvEscape(item.postTitle || ""),
            csvEscape(item.profileId || ""),
            csvEscape(item.profileName || ""),
            csvEscape(item.profilePicture || ""),
            csvEscape(item.profileUrl || ""),
            csvEscape(item.text || ""),
            csvEscape(item.threadingDepth?.toString() || "0")
        ];
        
        rows.push(row.join(','));
    }
    
    csvContent = rows.join('\n');
}

// Hiển thị kết quả
function showResults(comments) {
    // Hiển thị thẻ kết quả và ẩn thẻ trạng thái
    $('#status-card').classList.add('hidden');
    $('#results-card').classList.remove('hidden');
    
    // Cập nhật tóm tắt kết quả
    $('#result-summary').textContent = `Đã trích xuất thành công ${comments.length} bình luận.`;
    
    // Xóa bảng xem trước cũ
    $('#preview-table-body').innerHTML = '';
    
    // Chỉ hiển thị 5 bình luận đầu tiên trong bảng xem trước
    const previewComments = comments.slice(0, 5);
    
    // Điền dữ liệu xem trước
    for (const comment of previewComments) {
        const row = document.createElement('tr');
        
        // Người bình luận
        const nameCell = document.createElement('td');
        nameCell.className = 'px-6 py-4 whitespace-nowrap';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'flex items-center';
        
        const imgDiv = document.createElement('div');
        imgDiv.className = 'flex-shrink-0 h-10 w-10 mr-3';
        
        const img = document.createElement('img');
        img.className = 'h-10 w-10 rounded-full';
        img.src = comment.profilePicture || 'https://via.placeholder.com/40';
        img.alt = 'Profile picture';
        
        imgDiv.appendChild(img);
        nameDiv.appendChild(imgDiv);
        
        const textDiv = document.createElement('div');
        textDiv.textContent = comment.profileName || 'Unknown';
        textDiv.className = 'ml-1';
        
        nameDiv.appendChild(textDiv);
        nameCell.appendChild(nameDiv);
        
        // Nội dung bình luận
        const textCell = document.createElement('td');
        textCell.className = 'px-6 py-4';
        textCell.textContent = comment.text || '(Empty)';
        
        // Thời gian
        const timeCell = document.createElement('td');
        timeCell.className = 'px-6 py-4 whitespace-nowrap';
        
        // Định dạng thời gian nếu có sẵn, nếu không, sử dụng chuỗi gốc
        let formattedDate = comment.date;
        try {
            if (comment.date) {
                const date = new Date(comment.date);
                formattedDate = date.toLocaleString();
            }
        } catch (e) {
            console.error('Lỗi khi định dạng thời gian:', e);
        }
        
        timeCell.textContent = formattedDate || 'Unknown';
        
        row.appendChild(nameCell);
        row.appendChild(textCell);
        row.appendChild(timeCell);
        
        $('#preview-table-body').appendChild(row);
    }
    
    // Nếu không có bình luận, hiển thị thông báo
    if (comments.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.className = 'px-6 py-4 text-center text-gray-500';
        cell.textContent = 'Không tìm thấy bình luận nào.';
        row.appendChild(cell);
        $('#preview-table-body').appendChild(row);
    }
}

// Chuyển đổi hiển thị token
function toggleTokenVisibility() {
    const tokenInput = $('#apify-token');
    const toggleButton = $('#toggle-token');
    
    if (tokenInput.type === 'password') {
        tokenInput.type = 'text';
        toggleButton.innerHTML = '<i class="far fa-eye-slash"></i>';
    } else {
        tokenInput.type = 'password';
        toggleButton.innerHTML = '<i class="far fa-eye"></i>';
    }
}

// Tải xuống CSV
function downloadCSV() {
    if (!csvContent) {
        alert('Không có dữ liệu để tải xuống.');
        return;
    }
    
    // Tạo blob và URL tải xuống
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Tạo một phần tử liên kết để tải xuống
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Tạo tên file với timestamp
    const date = new Date();
    const timestamp = date.toISOString().replace(/[-:.]/g, '').substring(0, 14);
    link.setAttribute('download', `facebook_comments_${timestamp}.csv`);
    
    // Giả lập nhấp chuột để tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Đặt lại biểu mẫu
function resetForm() {
    // Xóa URL và giữ nguyên token
    $('#post-url').value = '';
    
    // Đặt lại số lượng bình luận về giá trị mặc định
    $('#max-comments').value = '100';
    
    // Hiển thị biểu mẫu và ẩn thẻ trạng thái và kết quả
    $('#scraper-form').parentElement.classList.remove('hidden');
    $('#status-card').classList.add('hidden');
    $('#results-card').classList.add('hidden');
    
    // Đặt lại nhật ký và thanh tiến trình
    $('#log-container').innerHTML = '';
    updateProgress(0, 'Đang khởi tạo...');
}

// Thêm mục nhật ký
function addLogEntry(message) {
    const logEntry = document.createElement('p');
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
    
    $('#log-container').appendChild(logEntry);
    
    // Cuộn xuống cuối danh sách nhật ký
    $('#log-container').scrollTop = $('#log-container').scrollHeight;
}

// Cập nhật thanh tiến trình
function updateProgress(percent, message) {
    $('#progress-bar').style.width = `${percent}%`;
    $('#progress-percentage').textContent = `${percent}%`;
    $('#progress-text').textContent = message;
}

// Escape giá trị cho CSV
function csvEscape(value) {
    if (value === null || value === undefined) return '';
    
    // Chuyển đổi thành chuỗi
    const str = String(value);
    
    // Nếu chuỗi chứa dấu phẩy, dấu ngoặc kép hoặc ký tự xuống dòng, đặt trong dấu ngoặc kép và escape các dấu ngoặc kép
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
} 