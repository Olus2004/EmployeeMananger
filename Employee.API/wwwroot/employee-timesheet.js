// Employee Timesheet Page (Standalone for employees) - requires login
const TIMESHEET_API_BASE_URL = `${window.location.origin}/api/timesheet`;
const FEEDBACK_API_BASE_URL = `${window.location.origin}/api/feedback`;

let etsTimesheets = [];
let etsFeedbackByTimesheet = {}; // timesheetId -> feedback
let etsCurrentUser = null;

// Safe translation function - ensures t() is available
function safeT(key, fallback) {
    if (typeof t !== 'undefined' && typeof t === 'function') {
        try {
            return t(key);
        } catch (e) {
            return fallback;
        }
    }
    return fallback;
}

// Auth guard
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        // Chưa đăng nhập -> quay về trang login
        window.location.href = 'index.html';
        return;
    }

    try {
        etsCurrentUser = JSON.parse(savedUser);
        // Debug: Log user object structure to help diagnose issues
        console.log('Loaded user from localStorage:', etsCurrentUser);
        console.log('User ID fields:', {
            'id (camelCase - expected)': etsCurrentUser?.id,
            'Id (PascalCase)': etsCurrentUser?.Id,
            'userId': etsCurrentUser?.userId
        });
    } catch {
        etsCurrentUser = null;
    }

    if (!etsCurrentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Nếu tài khoản không có employeeId, báo lỗi rõ ràng nhưng KHÔNG redirect vòng lặp
    if (!etsCurrentUser.employeeId) {
        etsShowToast('Tài khoản chưa được liên kết với nhân viên. Vui lòng liên hệ admin để gán nhân viên cho tài khoản.', 'error');
        return;
    }

    // Chỉ load timesheet của nhân viên hiện tại
    etsLoadTimesheets();
    
    // Load profile information
    etsLoadProfileInfo();
});

// Logout for employee timesheet
function etsLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
window.etsLogout = etsLogout;

// Simple toast
function etsShowToast(message, type = 'success') {
    const containerId = 'toastContainer';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }

    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-orange-500'
    };

    const div = document.createElement('div');
    div.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 min-w-[260px] max-w-sm`;
    div.innerHTML = `
        <span class="flex-1 font-semibold text-sm">${message}</span>
        <button class="text-white/80 hover:text-white text-xs" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Simple confirm dialog
function etsShowConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4';

        const dialog = document.createElement('div');
        dialog.className = 'bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl';
        dialog.innerHTML = `
            <h3 class="text-lg font-bold text-slate-800 mb-3">${typeof t !== 'undefined' && typeof t === 'function' ? t('ets.confirmTitle') : 'Xác nhận'}</h3>
            <p class="text-slate-600 mb-5 text-sm">${message}</p>
            <div class="flex space-x-3">
                <button id="etsConfirmYes" class="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">${typeof t !== 'undefined' && typeof t === 'function' ? t('ets.confirmYes') : 'Đồng ý'}</button>
                <button id="etsConfirmNo" class="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-300">${typeof t !== 'undefined' && typeof t === 'function' ? t('ets.confirmNo') : 'Hủy'}</button>
            </div>
        `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('etsConfirmYes').onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        document.getElementById('etsConfirmNo').onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        };
    });
}

// Format time
function etsFormatTime(timeString) {
    if (!timeString) return '-';
    try {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        return timeString;
    } catch {
        return timeString;
    }
}

// Load tất cả bảng công
async function etsLoadTimesheets() {
    try {
        const [tsRes, fbRes] = await Promise.all([
            fetch(`${TIMESHEET_API_BASE_URL}/employee/${etsCurrentUser.employeeId}`),
            fetch(FEEDBACK_API_BASE_URL)
        ]);

        const timesheetData = await tsRes.json();
        const feedbackData = await fbRes.json();

        etsTimesheets = (Array.isArray(timesheetData) ? timesheetData : []);
        etsFeedbackByTimesheet = {};
        (feedbackData || []).forEach(f => {
            const key = f.timesheetId;
            if (key != null) {
                etsFeedbackByTimesheet[key] = f;
            }
        });

        etsUpdateStats(etsTimesheets);
        etsRenderTimesheets(etsTimesheets);
    } catch (err) {
        console.error(err);
        etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('ets.loadError') : 'Lỗi khi tải danh sách bảng công', 'error');
    }
}

// Update stats for employee: work, leave, unauthorized leave
function etsUpdateStats(list) {
    const work = list.filter(t => t.status === 1).length;
    const leave = list.filter(t => t.status === 2).length;
    const unauthorized = list.filter(t => t.status === 2 && t.absenceType === 0).length;
    // Night shift: ca đi làm có giờ bắt đầu từ 22h trở đi hoặc trước 6h sáng
    const night = list.filter(t => {
        if (t.status !== 1 || !t.workStart) return false;
        try {
            const parts = String(t.workStart).split(':');
            const hour = parseInt(parts[0], 10);
            return isNaN(hour) ? false : (hour >= 22 || hour < 6);
        } catch {
            return false;
        }
    }).length;

    const workEl = document.getElementById('etsWorkCount');
    const leaveEl = document.getElementById('etsLeaveCount');
    const unauthEl = document.getElementById('etsUnauthorizedCount');
    const nightEl = document.getElementById('etsNightShiftCount');
    if (workEl) workEl.textContent = work;
    if (leaveEl) leaveEl.textContent = leave;
    if (unauthEl) unauthEl.textContent = unauthorized;
    if (nightEl) nightEl.textContent = night;
}

// Filter by date range & confirmation status
function etsFilterTimesheets() {
    if (!Array.isArray(etsTimesheets)) {
        etsRenderTimesheets([]);
        return;
    }

    const fromInput = document.getElementById('etsFilterDateFrom');
    const toInput = document.getElementById('etsFilterDateTo');
    const statusInput = document.getElementById('etsFilterStatus');

    const fromValue = fromInput && fromInput.value ? fromInput.value : null; // yyyy-MM-dd
    const toValue = toInput && toInput.value ? toInput.value : null;
    const statusValue = statusInput && statusInput.value ? statusInput.value : 'all';

    const fromDate = fromValue ? new Date(fromValue + 'T00:00:00') : null;
    const toDate = toValue ? new Date(toValue + 'T00:00:00') : null;

    const filtered = etsTimesheets.filter(t => {
        // Filter by date range
        if (t.day) {
            const d = new Date(t.day);
            if (!isNaN(d.getTime())) {
                const onlyDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                if (fromDate && onlyDate < fromDate) return false;
                if (toDate && onlyDate > toDate) return false;
            }
        }

        // Filter by confirmation status (feedback)
        if (statusValue === 'all') return true;

        const feedback = etsFeedbackByTimesheet[t.timesheetId];
        const st = feedback ? (feedback.employeeStatus ?? feedback.status) : null;

        if (statusValue === 'unconfirmed') {
            return !feedback;
        }
        if (statusValue === 'correct') {
            return st === 1;
        }
        if (statusValue === 'wrong') {
            return st === 2;
        }
        if (statusValue === 'processing') {
            return st === 3;
        }

        return true;
    });

    etsRenderTimesheets(filtered);
}

// Render table
function etsRenderTimesheets(list) {
    const tbody = document.getElementById('employeeTimesheetTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Graceful translation helper to avoid errors if t() is missing
    const translate = typeof t === 'function' ? t : () => undefined;

        if (!list || list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="px-6 py-10 text-center text-slate-500">
                    <i class="fas fa-inbox text-3xl mb-3 block"></i>
                    <p class="text-base">${translate('ets.noTimesheets') || 'Chưa có bảng công nào'}</p>
                </td>
            </tr>
        `;
        return;
    }

    list.forEach((timesheet, idx) => {
        const row = document.createElement('tr');
        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
        row.className = `border-b border-slate-200 transition-all ${rowBg} group`;

        const workLabel = translate('timesheet.workStatus') || 'Đi làm';
        const leaveLabel = translate('timesheet.leaveStatus') || 'Nghỉ ngơi';
        const requestLeaveLabel = translate('timesheet.requestLeave') || translate('employee.requestLeave') || 'Xin nghỉ';
        const travelLabel = translate('timesheet.travel') || 'Di chuyển';
        const visaLabel = translate('timesheet.visa') || 'Làm visa';
        const trainingLabel = translate('timesheet.training') || 'Đào tạo';
        const permissionLabel = translate('timesheet.permission') || 'Mở quyền hạn';
        const personalLabel = translate('timesheet.absencePersonalShort') || 'Cá nhân';
        const nonPersonalLabel = translate('timesheet.absenceNonPersonalShort') || 'Không cá nhân';
        
        // Status badge based on status value (1-7) - with responsive text sizing
        let statusBadge = '';
        if (timesheet.status === 1) {
            statusBadge = `<span class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-check-circle mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${workLabel}</span></span>`;
        } else if (timesheet.status === 2) {
            statusBadge = `<span class="bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-bed mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${leaveLabel}</span></span>`;
        } else if (timesheet.status === 3) {
            statusBadge = `<span class="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-calendar-minus mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${requestLeaveLabel}</span></span>`;
        } else if (timesheet.status === 4) {
            statusBadge = `<span class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-plane mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${travelLabel}</span></span>`;
        } else if (timesheet.status === 5) {
            statusBadge = `<span class="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-passport mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${visaLabel}</span></span>`;
        } else if (timesheet.status === 6) {
            statusBadge = `<span class="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-graduation-cap mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${trainingLabel}</span></span>`;
        } else if (timesheet.status === 7) {
            statusBadge = `<span class="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-key mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${permissionLabel}</span></span>`;
        } else {
            statusBadge = `<span class="bg-slate-500 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium inline-flex items-center whitespace-nowrap"><i class="fas fa-question mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">Không xác định</span></span>`;
        }

        const absenceTypeBadge = timesheet.absenceType === null
            ? '<span class="text-slate-500 text-[10px] sm:text-xs whitespace-nowrap">-</span>'
            : timesheet.absenceType === 0
                ? `<span class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap">${personalLabel}</span>`
                : `<span class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium whitespace-nowrap">${nonPersonalLabel}</span>`;

        const day = new Date(timesheet.day).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const workStart = timesheet.workStart ? etsFormatTime(timesheet.workStart) : '-';
        const workEnd = timesheet.workEnd ? etsFormatTime(timesheet.workEnd) : '-';

        const feedback = etsFeedbackByTimesheet[timesheet.timesheetId];
        let actionContent = '';

        if (feedback) {
            // Dùng employeeStatus: 1 = Đúng, 2 = Sai, 3 = Đang xử lí
            const st = feedback.employeeStatus ?? feedback.status;
            const correctLabel = translate('ets.correct') || 'Đúng';
            const wrongLabel = translate('ets.wrong') || 'Sai';
            const processingLabel = translate('ets.processing') || 'Đang xử lí';
            let badge = '';
            if (st === 1) {
                badge = `<span class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold inline-flex items-center whitespace-nowrap shadow-md"><i class="fas fa-check-circle mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${correctLabel}</span></span>`;
            } else if (st === 2) {
                badge = `<span class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold inline-flex items-center whitespace-nowrap shadow-md"><i class="fas fa-times-circle mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${wrongLabel}</span></span>`;
            } else if (st === 3) {
                badge = `<span class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold inline-flex items-center whitespace-nowrap shadow-md"><i class="fas fa-clock mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${processingLabel}</span></span>`;
            } else {
                badge = '<span class="bg-slate-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold inline-flex items-center whitespace-nowrap shadow-md"><span class="whitespace-nowrap">Đã phản hồi</span></span>';
            }
            actionContent = badge;
        } else {
            const correctBtnLabel = translate('ets.correct') || 'Đúng';
            const wrongBtnLabel = translate('ets.wrong') || 'Sai';
            actionContent = `
                <div class="flex space-x-1 sm:space-x-2">
                    <button onclick="etsConfirmCorrect(${timesheet.timesheetId})"
                        class="bg-emerald-500 hover:bg-emerald-600 text-white px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-all shadow-sm hover:shadow whitespace-nowrap">
                        <i class="fas fa-check mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${correctBtnLabel}</span>
                    </button>
                    <button onclick="etsConfirmWrong(${timesheet.timesheetId})"
                        class="bg-red-500 hover:bg-red-600 text-white px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-all shadow-sm hover:shadow whitespace-nowrap">
                        <i class="fas fa-times mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i><span class="whitespace-nowrap">${wrongBtnLabel}</span>
                    </button>
                </div>`;
        }

        // Get project codes
        const projectCodes = timesheet.projectCodes || timesheet.employeeProjectCodes || [];
        const projectCodesText = projectCodes.length > 0 ? projectCodes.join(', ') : '-';

        row.innerHTML = `
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 font-medium text-slate-700 whitespace-nowrap text-[10px] sm:text-xs">#${timesheet.timesheetId}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 whitespace-nowrap">
                <div class="font-medium text-slate-800 text-[10px] sm:text-xs">${timesheet.employeeName || 'N/A'}</div>
            </td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 text-slate-600 whitespace-nowrap text-[10px] sm:text-xs">${projectCodesText}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 text-slate-600 whitespace-nowrap text-[10px] sm:text-xs">${day}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 text-slate-600 whitespace-nowrap text-[10px] sm:text-xs font-mono">${workStart}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 text-slate-600 whitespace-nowrap text-[10px] sm:text-xs font-mono">${workEnd}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 whitespace-nowrap">${statusBadge}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 whitespace-nowrap">${absenceTypeBadge}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 text-slate-600 whitespace-nowrap text-[10px] sm:text-xs">${timesheet.areaName || '-'}</td>
            <td class="px-1 sm:px-2 py-1.5 sm:py-2 text-slate-600 text-[10px] sm:text-xs whitespace-nowrap">
                <div class="truncate" title="${timesheet.notes || ''}" style="max-width: 120px;">
                    ${timesheet.notes || '-'}
                </div>
            </td>
            <td id="ets-action-cell-${timesheet.timesheetId}" class="px-1 sm:px-2 py-1.5 sm:py-2 whitespace-nowrap sticky right-0 ${rowBg} group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-slate-50 z-10 border-l border-slate-200">
                ${actionContent}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Confirm correct: chỉ hỏi xác nhận lựa chọn
function etsConfirmCorrect(timesheetId) {
    const translateFn = (typeof t === 'function') ? t : null;
    const notFoundMsg = translateFn ? translateFn('ets.notFound') : 'Không tìm thấy bảng công';
    const confirmMsg = translateFn ? translateFn('ets.confirmCorrect') : 'Bạn có chắc chắn bảng công này ĐÚNG?';

    if (!etsTimesheets || etsTimesheets.length === 0) {
        etsShowToast(notFoundMsg, 'error');
        return;
    }
    const ts = etsTimesheets.find(x => x.timesheetId === timesheetId);
    if (!ts) {
        etsShowToast(notFoundMsg, 'error');
        return;
    }

    etsShowConfirm(confirmMsg).then(ok => {
        if (!ok) return;
        etsDoConfirmCorrect(ts);
    });
}

// Confirm wrong: hỏi xác nhận, sau đó mở modal nhập lý do sai
function etsConfirmWrong(timesheetId) {
    const translateFn = (typeof t === 'function') ? t : null;
    const notFoundMsg = translateFn ? translateFn('ets.notFound') : 'Không tìm thấy bảng công';
    const confirmMsg = translateFn ? translateFn('ets.confirmWrong') : 'Bạn có chắc chắn bảng công này SAI và muốn gửi phản hồi?';

    if (!etsTimesheets || etsTimesheets.length === 0) {
        etsShowToast(notFoundMsg, 'error');
        return;
    }
    const ts = etsTimesheets.find(x => x.timesheetId === timesheetId);
    if (!ts) {
        etsShowToast(notFoundMsg, 'error');
        return;
    }

    etsShowConfirm(confirmMsg).then(ok => {
        if (!ok) return;
        etsOpenWrongModal(ts);
    });
}

async function etsDoConfirmCorrect(timesheet) {
    try {
        const res = await fetch(FEEDBACK_API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeId: timesheet.employeeId,
                timesheetId: timesheet.timesheetId,
                description: 'Bảng công này đúng',
                status: 1 // 1 = Đúng
            })
        });
        const data = await res.json();
        if (res.ok) {
            etsFeedbackByTimesheet[timesheet.timesheetId] = data;
            etsRenderTimesheets(etsTimesheets);
            etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('ets.confirmCorrectSuccess') : 'Đã xác nhận bảng công đúng!', 'success');
        } else {
            etsShowToast(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (err) {
        console.error(err);
        etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('ets.confirmError') : 'Lỗi khi xác nhận bảng công', 'error');
    }
}

// Mở modal nhập lý do sai (sau khi đã xác nhận tên NV)
function etsOpenWrongModal(timesheet) {
    const modal = document.getElementById('wrongTimesheetReasonModal');
    const idInput = document.getElementById('wrongTimesheetId');
    const infoDiv = document.getElementById('wrongTimesheetInfo');
    const reasonInput = document.getElementById('modalWrongReason');
    const errorDiv = document.getElementById('wrongTimesheetReasonModalError');

    if (!modal || !idInput || !infoDiv || !reasonInput || !errorDiv) return;

    idInput.value = timesheet.timesheetId;

    const day = new Date(timesheet.day).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const workStart = timesheet.workStart ? etsFormatTime(timesheet.workStart) : '-';
    const workEnd = timesheet.workEnd ? etsFormatTime(timesheet.workEnd) : '-';

    infoDiv.innerHTML = `
        <p><strong>ID:</strong> #${timesheet.timesheetId}</p>
        <p><strong>Ngày:</strong> ${day}</p>
        <p><strong>Giờ làm việc:</strong> ${workStart} - ${workEnd}</p>
        <p><strong>Trạng thái:</strong> ${(() => {
            const translateFn = typeof t !== 'undefined' && typeof t === 'function' ? t : null;
            if (timesheet.status === 1) return translateFn ? translateFn('timesheet.workStatus') : 'Đi làm';
            if (timesheet.status === 2) return translateFn ? translateFn('timesheet.leaveStatus') : 'Nghỉ ngơi';
            if (timesheet.status === 3) return translateFn ? (translateFn('timesheet.requestLeave') || translateFn('employee.requestLeave')) : 'Xin nghỉ';
            if (timesheet.status === 4) return translateFn ? translateFn('timesheet.travel') : 'Di chuyển';
            if (timesheet.status === 5) return translateFn ? translateFn('timesheet.visa') : 'Làm visa';
            if (timesheet.status === 6) return translateFn ? translateFn('timesheet.training') : 'Đào tạo';
            if (timesheet.status === 7) return translateFn ? translateFn('timesheet.permission') : 'Mở quyền hạn';
            return 'Không xác định';
        })()}</p>
    `;

    reasonInput.value = '';
    errorDiv.classList.add('hidden');
    modal.classList.remove('hidden');
}

function etsCloseWrongModal() {
    const modal = document.getElementById('wrongTimesheetReasonModal');
    const form = document.getElementById('wrongTimesheetReasonForm');
    const errorDiv = document.getElementById('wrongTimesheetReasonModalError');
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
    if (errorDiv) errorDiv.classList.add('hidden');
}

// Submit wrong reason form
document.addEventListener('DOMContentLoaded', () => {
    const wrongForm = document.getElementById('wrongTimesheetReasonForm');
    if (wrongForm) {
        wrongForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('wrongTimesheetReasonModalError');
            const errorText = document.getElementById('wrongTimesheetReasonModalErrorText');
            const idInput = document.getElementById('wrongTimesheetId');
            const reasonInput = document.getElementById('modalWrongReason');

            if (!idInput || !reasonInput) {
                etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('ets.missingInfo') : 'Thiếu thông tin để gửi phản hồi', 'error');
                return;
            }

            const timesheetId = parseInt(idInput.value);
            const reason = reasonInput.value.trim();
            if (!reason) {
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = typeof t !== 'undefined' && typeof t === 'function' ? t('ets.enterReason') : 'Vui lòng nhập lý do sai';
                return;
            }

            try {
                const t = etsTimesheets.find(x => x.timesheetId === timesheetId);
                if (!t) {
                    etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('ets.notFound') : 'Không tìm thấy bảng công', 'error');
                    return;
                }

                const res = await fetch(FEEDBACK_API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        employeeId: t.employeeId,
                        timesheetId,
                        description: reason,
                        status: 3 // 3 = Đang xử lí khi nhân viên báo Sai
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    etsCloseWrongModal();
                    etsFeedbackByTimesheet[timesheetId] = data;
                    etsRenderTimesheets(etsTimesheets);
                    etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('ets.feedbackSent') : 'Đã gửi phản hồi về bảng công sai!', 'success');
                } else {
                    if (errorDiv) errorDiv.classList.remove('hidden');
                    if (errorText) errorText.textContent = data.message || 'Có lỗi xảy ra';
                    etsShowToast(data.message || 'Có lỗi xảy ra', 'error');
                }
            } catch (err) {
                console.error(err);
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = typeof t !== 'undefined' && typeof t === 'function' ? t('ets.serverError') : 'Lỗi kết nối đến server';
                etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('ets.serverError') : 'Lỗi kết nối đến server', 'error');
            }
        });
    }

    // Không gọi etsLoadTimesheets() ở đây nữa; đã được gọi trong auth guard phía trên
});

// Profile functions
const USER_API_BASE_URL = `${window.location.origin}/api/user`;
const EMPLOYEE_API_BASE_URL = `${window.location.origin}/api/employee`;
let etsCurrentEmployee = null;

// Load and display profile information
function etsLoadProfileInfo() {
    if (!etsCurrentUser) return;
    
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileAvatarText = document.getElementById('profileAvatarText');
    
    if (profileName) {
        const username = etsCurrentUser.username || 'Người dùng';
        profileName.textContent = username;
        // Truncate long names on mobile
        if (window.innerWidth < 640) {
            profileName.textContent = username.length > 8 ? username.substring(0, 8) + '...' : username;
        }
    }
    
    if (profileRole) {
        profileRole.textContent = typeof t !== 'undefined' && typeof t === 'function' ? t('profile.employee') : 'Nhân viên';
    }
    
    if (profileAvatarText && etsCurrentUser.username) {
        const initial = etsCurrentUser.username.charAt(0).toUpperCase();
        profileAvatarText.textContent = initial;
    } else if (profileAvatar && etsCurrentUser.username) {
        const initial = etsCurrentUser.username.charAt(0).toUpperCase();
        profileAvatar.innerHTML = `<span class="text-xs sm:text-sm md:text-base">${initial}</span>`;
    }
    
    // Handle window resize for responsive name truncation
    window.addEventListener('resize', () => {
        if (profileName && etsCurrentUser) {
            const username = etsCurrentUser.username || 'Người dùng';
            if (window.innerWidth < 640) {
                profileName.textContent = username.length > 8 ? username.substring(0, 8) + '...' : username;
            } else {
                profileName.textContent = username;
            }
        }
    });
}

// Toggle profile dropdown
function etsToggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const chevron = document.getElementById('profileChevron');
    
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (chevron) {
            chevron.classList.toggle('rotate-180');
        }
    }
}
window.etsToggleProfileDropdown = etsToggleProfileDropdown;

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const container = document.getElementById('profileDropdownContainer');
    const dropdown = document.getElementById('profileDropdown');
    
    if (container && dropdown && !container.contains(e.target)) {
        dropdown.classList.add('hidden');
        const chevron = document.getElementById('profileChevron');
        if (chevron) chevron.classList.remove('rotate-180');
    }
});

// Open Edit Profile Modal
async function etsOpenEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const fullnameInput = document.getElementById('editProfileFullname');
    const fullnameOtherInput = document.getElementById('editProfileFullnameOther');
    const typeInput = document.getElementById('editProfileType');
    const saleInput = document.getElementById('editProfileSale');
    const visaExtensionInput = document.getElementById('editProfileVisaExtension');
    const errorDiv = document.getElementById('editProfileModalError');
    
    if (!modal || !etsCurrentUser || !etsCurrentUser.employeeId) {
        etsShowToast('Không tìm thấy thông tin nhân viên', 'error');
        return;
    }
    
    // Close dropdown
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.add('hidden');
    
    // Hide error
    if (errorDiv) errorDiv.classList.add('hidden');
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Load employee data
    try {
        const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${etsCurrentUser.employeeId}`);
        if (response.ok) {
            etsCurrentEmployee = await response.json();
            
            // Fill form with employee data
            if (fullnameInput) fullnameInput.value = etsCurrentEmployee.fullname || '';
            if (fullnameOtherInput) fullnameOtherInput.value = etsCurrentEmployee.fullnameOther || '';
            if (typeInput) typeInput.value = etsCurrentEmployee.type || '1';
            if (saleInput) saleInput.value = etsCurrentEmployee.sale || '';
            if (visaExtensionInput) visaExtensionInput.value = etsCurrentEmployee.visaExtension || '0';
        } else {
            etsShowToast('Không thể tải thông tin nhân viên', 'error');
        }
    } catch (err) {
        console.error(err);
        etsShowToast('Lỗi khi tải thông tin nhân viên', 'error');
    }
}
window.etsOpenEditProfileModal = etsOpenEditProfileModal;

// Close Edit Profile Modal
function etsCloseEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const errorDiv = document.getElementById('editProfileModalError');
    
    if (modal) modal.classList.add('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');
    
    // Reset form
    const form = document.getElementById('editProfileForm');
    if (form) form.reset();
}
window.etsCloseEditProfileModal = etsCloseEditProfileModal;

// Handle Edit Profile Form Submit
document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullnameInput = document.getElementById('editProfileFullname');
            const fullnameOtherInput = document.getElementById('editProfileFullnameOther');
            const typeInput = document.getElementById('editProfileType');
            const saleInput = document.getElementById('editProfileSale');
            const visaExtensionInput = document.getElementById('editProfileVisaExtension');
            const errorDiv = document.getElementById('editProfileModalError');
            const errorText = document.getElementById('editProfileModalErrorText');
            
            if (!etsCurrentUser || !etsCurrentUser.employeeId) {
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = 'Không tìm thấy thông tin nhân viên';
                return;
            }
            
            // Validate required fields
            if (!fullnameInput?.value?.trim()) {
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = 'Họ và tên không được để trống';
                return;
            }
            
            try {
                const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${etsCurrentUser.employeeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullname: fullnameInput?.value?.trim() || '',
                        fullnameOther: fullnameOtherInput?.value?.trim() || '',
                        type: parseInt(typeInput?.value || '1'),
                        sale: saleInput?.value?.trim() || '',
                        visaExtension: parseInt(visaExtensionInput?.value || '0'),
                        active: etsCurrentEmployee?.active || 1,
                        projectCode: etsCurrentEmployee?.projectCode || '',
                        plantName: etsCurrentEmployee?.plantName || '',
                        areaId: etsCurrentEmployee?.areaId || null,
                        travelDays: etsCurrentEmployee?.travelDays || 0,
                        permissionGranted: etsCurrentEmployee?.permissionGranted || 0,
                        trainingDays: etsCurrentEmployee?.trainingDays || 0
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('profile.updateSuccess') : 'Cập nhật thông tin thành công!', 'success');
                    etsCloseEditProfileModal();
                    // Reload timesheets to refresh data
                    etsLoadTimesheets();
                } else {
                    if (errorDiv) errorDiv.classList.remove('hidden');
                    if (errorText) errorText.textContent = data.message || 'Có lỗi xảy ra';
                }
            } catch (err) {
                console.error(err);
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = typeof t !== 'undefined' && typeof t === 'function' ? t('ets.serverError') : 'Lỗi kết nối đến server';
            }
        });
    }
});

// Open Change Password Modal
function etsOpenChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const errorDiv = document.getElementById('changePasswordModalError');
    
    if (!modal || !etsCurrentUser) return;
    
    // Close dropdown
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.add('hidden');
    
    // Hide error
    if (errorDiv) errorDiv.classList.add('hidden');
    
    // Reset form
    const form = document.getElementById('changePasswordForm');
    if (form) form.reset();
    
    // Show modal
    modal.classList.remove('hidden');
}
window.etsOpenChangePasswordModal = etsOpenChangePasswordModal;

// Close Change Password Modal
function etsCloseChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const errorDiv = document.getElementById('changePasswordModalError');
    
    if (modal) modal.classList.add('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');
    
    // Reset form
    const form = document.getElementById('changePasswordForm');
    if (form) form.reset();
}
window.etsCloseChangePasswordModal = etsCloseChangePasswordModal;

// Handle Change Password Form Submit
document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPasswordInput = document.getElementById('changePasswordCurrent');
            const newPasswordInput = document.getElementById('changePasswordNew');
            const confirmPasswordInput = document.getElementById('changePasswordConfirm');
            const errorDiv = document.getElementById('changePasswordModalError');
            const errorText = document.getElementById('changePasswordModalErrorText');
            
            // Hide error initially
            if (errorDiv) errorDiv.classList.add('hidden');
            
            // Validate passwords match
            if (newPasswordInput?.value !== confirmPasswordInput?.value) {
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = typeof t !== 'undefined' && typeof t === 'function' ? t('profile.passwordMismatch') : 'Mật khẩu mới và xác nhận không khớp';
                return;
            }
            
            // Validate password length
            if (newPasswordInput?.value && newPasswordInput.value.length < 6) {
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = typeof t !== 'undefined' && typeof t === 'function' ? t('profile.passwordTooShort') : 'Mật khẩu phải có ít nhất 6 ký tự';
                return;
            }
            
            // Debug: log user object to see its structure
            console.log('Current User Object:', etsCurrentUser);
            
            if (!etsCurrentUser) {
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = 'Không tìm thấy thông tin người dùng';
                return;
            }
            
            // Try multiple possible field names for user ID
            // Note: JSON serializer uses CamelCase, so 'Id' becomes 'id'
            const userId = etsCurrentUser.id || etsCurrentUser.Id || etsCurrentUser.userId;
            
            if (!userId) {
                console.error('User ID not found. User object:', etsCurrentUser);
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = 'Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.';
                return;
            }
            
            console.log('Using User ID:', userId);
            
            try {
                console.log('Sending change password request to:', `${USER_API_BASE_URL}/${userId}/change-password`);
                
                const response = await fetch(`${USER_API_BASE_URL}/${userId}/change-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword: currentPasswordInput?.value || '',
                        newPassword: newPasswordInput?.value || ''
                    })
                });
                
                console.log('Response status:', response.status);
                
                let data;
                try {
                    data = await response.json();
                    console.log('Response data:', data);
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    const text = await response.text();
                    console.error('Response text:', text);
                    if (errorDiv) errorDiv.classList.remove('hidden');
                    if (errorText) errorText.textContent = 'Lỗi khi xử lý phản hồi từ server';
                    return;
                }
                
                if (response.ok) {
                    etsShowToast(typeof t !== 'undefined' && typeof t === 'function' ? t('profile.passwordChangeSuccess') : 'Đổi mật khẩu thành công!', 'success');
                    etsCloseChangePasswordModal();
                } else {
                    console.error('Change password failed:', data);
                    if (errorDiv) errorDiv.classList.remove('hidden');
                    if (errorText) errorText.textContent = data.message || `Lỗi: ${response.status} ${response.statusText}`;
                }
            } catch (err) {
                console.error('Exception in change password:', err);
                if (errorDiv) errorDiv.classList.remove('hidden');
                if (errorText) errorText.textContent = typeof t !== 'undefined' && typeof t === 'function' ? t('ets.serverError') : 'Lỗi kết nối đến server';
            }
        });
    }
});


