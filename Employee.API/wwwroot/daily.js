// Daily Attendance functionality
let dailyAttendanceData = [];

// API URL
const DAILY_API_URL = `${window.location.origin}/api/daily`;

// Status options mapping
const statusOptions = [
    { value: 0, text: typeof t !== 'undefined' ? t('timesheet.status0') : 'Trống' },
    { value: 1, text: typeof t !== 'undefined' ? t('timesheet.workStatus') : 'Làm' },
    { value: 2, text: typeof t !== 'undefined' ? t('timesheet.leaveStatus') : 'Nghỉ' },
    { value: 3, text: typeof t !== 'undefined' ? t('timesheet.requestLeave') : 'Xin nghỉ' },
    { value: 4, text: typeof t !== 'undefined' ? t('timesheet.travel') : 'Di chuyển' },
    { value: 5, text: typeof t !== 'undefined' ? t('timesheet.visa') : 'Làm visa' },
    { value: 6, text: typeof t !== 'undefined' ? t('timesheet.training') : 'Đào tạo' },
    { value: 7, text: typeof t !== 'undefined' ? t('timesheet.permission') : 'Mở quyền hạn' }
];

async function loadDailyAttendance() {
    const dateInput = document.getElementById('dailyAttendanceDate');
    const day = dateInput.value;
    if (!day) return;

    try {
        const response = await fetch(`${DAILY_API_URL}?day=${day}`);
        dailyAttendanceData = await response.json();
        await fetchAndSetSyncedStatus(day, dailyAttendanceData);
        renderDailyAttendanceTable(dailyAttendanceData);
        updateDailyStats(dailyAttendanceData);
        loadDailyStats(day); // Load VN/CN monthly stats
    } catch (error) {
        console.error('Error loading daily attendance:', error);
        showToast('Lỗi khi tải danh sách điểm danh', 'error');
    }
}

async function loadDailyStats(day) {
    try {
        const response = await fetch(`${DAILY_API_URL}/stats?day=${day}`);
        const stats = await response.json();
        
        document.getElementById('dailyVNCount').textContent = stats.vnCount;
        document.getElementById('dailyCNCount').textContent = stats.cnCount;
        
        // Update month label if needed
        const monthLabel = document.getElementById('dailyStatsMonthLabel');
        if (monthLabel) {
            monthLabel.textContent = `Nhân lực tháng ${stats.monthDisplay}`;
        }
    } catch (error) {
        console.error('Error loading monthly stats:', error);
    }
}

async function fetchAndSetSyncedStatus(day, data) {
    try {
        const tsResponse = await fetch(`${window.location.origin}/api/timesheet/date-range?startDate=${day}&endDate=${day}`);
        if (tsResponse.ok) {
            const timesheets = await tsResponse.json();
            const syncedIds = new Set(timesheets.map(t => t.employeeId));
            data.forEach(d => {
                d.isSynced = syncedIds.has(d.employeeId);
            });
        }
    } catch (error) {
        console.error('Error checking synced status:', error);
    }
}

async function initializeDailyAttendance() {
    const dateInput = document.getElementById('dailyAttendanceDate');
    const day = dateInput.value;
    if (!day) return;

    const confirmed = await showConfirmDialog(typeof t !== 'undefined' ? t('daily.initConfirm').replace('{day}', day) : `Bạn có muốn khởi tạo danh sách điểm danh cho ngày ${day}?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`${DAILY_API_URL}/initialize?day=${day}`);
        if (response.ok) {
            dailyAttendanceData = await response.json();
            await fetchAndSetSyncedStatus(day, dailyAttendanceData);
            renderDailyAttendanceTable(dailyAttendanceData);
            updateDailyStats(dailyAttendanceData);
            loadDailyStats(day);
            showToast('Khởi tạo danh sách thành công', 'success');
        } else {
            showToast('Lỗi khi khởi tạo danh sách', 'error');
        }
    } catch (error) {
        console.error('Error initializing daily attendance:', error);
        showToast('Lỗi kết nối server', 'error');
    }
}

function renderDailyAttendanceTable(data) {
    const tbody = document.getElementById('dailyAttendanceTableBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-calendar-day text-4xl mb-4 block opacity-20"></i>
                    <p>Chưa có dữ liệu điểm danh cho ngày này.</p>
                    <button onclick="initializeDailyAttendance()" class="mt-4 text-blue-600 font-semibold hover:underline">
                        Bấm vào đây để khởi tạo danh sách
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100 main-row';
        row.setAttribute('data-daily-id', item.dailyId);
        row.id = `daily-row-${item.dailyId}`;
        
        // Status dropdown html
        let statusHtml = `<select id="status_${item.dailyId}" onchange="updateDailyRecord(${item.dailyId}, this, 'status')" class="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:border-blue-500 outline-none">`;
        statusOptions.forEach(opt => {
            statusHtml += `<option value="${opt.value}" ${item.status === opt.value ? 'selected' : ''}>${opt.text}</option>`;
        });
        statusHtml += `</select>`;

        const projectCodesBadge = (() => {
            const codes = item.projectCodes || [];
            if (codes.length > 0) {
                return `<span class="font-semibold text-purple-600">${codes.join(', ')}</span>`;
            }
            return '<span class="text-slate-400">-</span>';
        })();

        row.innerHTML = `
            <td class="px-4 py-3">
                <div class="flex flex-col">
                    <span class="font-bold text-slate-800">${item.fullname || 'N/A'}</span>
                    <span class="text-[10px] text-slate-400">ID: ${item.employeeId}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">${item.areaName || '-'}</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">${projectCodesBadge}</td>
            <td class="px-4 py-3">${statusHtml}</td>
            <td class="px-4 py-3">
                <input type="text" placeholder="HH:mm" id="start_${item.dailyId}" value="${item.workStart || ''}" onchange="updateDailyRecord(${item.dailyId}, this, 'workStart')"
                    class="time-picker w-16 bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:border-blue-500 outline-none text-center">
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-1 justify-center">
                    <input type="text" placeholder="HH:mm" id="end_${item.dailyId}" value="${item.workEnd || ''}" onchange="updateDailyRecord(${item.dailyId}, this, 'workEnd')"
                        class="time-picker w-16 bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:border-blue-500 outline-none text-center">
                    <select id="quick_shift_${item.dailyId}" onchange="applyQuickShift(${item.dailyId}, this.value)" class="w-14 bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[10px] focus:border-blue-500 outline-none text-slate-500 cursor-pointer" title="Chọn ca nhanh">
                        <option value="">Ca</option>
                        <option value="07:30|18:30">07:30-18:30</option>
                        <option value="08:00|19:00">08:00-19:00</option>
                        <option value="19:30|06:30">19:30-06:30</option>
                        <option value="20:00|07:00">20:00-07:00</option>
                    </select>
                </div>
            </td>
            <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="toggleDailyDetail(${item.dailyId}, ${item.employeeId}, this)" 
                        class="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm transition-all text-xs font-bold flex items-center gap-1"
                        title="${typeof t !== 'undefined' ? t('common.detail') : 'Chi tiết'}">
                        <i class="fas fa-search-plus"></i> <span data-i18n="common.detail">Chi tiết</span>
                    </button>
                    <button onclick="syncDailyToTimesheet(${item.dailyId}, this)" 
                        class="${item.isSynced ? 'bg-emerald-500 text-white' : 'text-emerald-600 hover:bg-emerald-50'} p-3 rounded-xl border border-emerald-100 shadow-sm transition-all flex items-center justify-center" 
                        title="${item.isSynced ? 'Đã xác nhận' : (typeof t !== 'undefined' ? t('common.confirm') : 'Xác nhận')} [v]">
                        <i class="fas ${item.isSynced ? 'fa-check' : 'fa-check-circle'} text-xl"></i>
                    </button>
                    <button onclick="deleteDailyRecord(${item.dailyId})" 
                        class="text-slate-400 hover:text-red-500 p-3 rounded-xl border border-slate-100 shadow-sm transition-all flex items-center justify-center" 
                        title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'} [x]">
                        <i class="fas fa-times-circle text-xl"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (typeof window.initTimePickers === 'function') {
        window.initTimePickers();
    }
}

async function toggleDailyDetail(dailyId, employeeId, btn) {
    const existingDetail = document.getElementById(`detail-row-${dailyId}`);
    if (existingDetail) {
        existingDetail.remove();
        btn.innerHTML = `<i class="fas fa-search-plus"></i> <span data-i18n="common.detail">${t('common.detail')}</span>`;
        btn.classList.remove('bg-blue-600', 'text-white');
        return;
    }

    // Close any other open details first (optional but cleaner)
    document.querySelectorAll('.detail-row').forEach(row => row.remove());
    document.querySelectorAll('[onclick^="toggleDailyDetail"]').forEach(b => {
        b.innerHTML = `<i class="fas fa-search-plus"></i> <span data-i18n="common.detail">${t('common.detail')}</span>`;
        b.classList.remove('bg-blue-600', 'text-white');
    });

    btn.innerHTML = `<i class="fas fa-times"></i> <span data-i18n="common.close">${t('common.close')}</span>`;
    btn.classList.add('bg-blue-600', 'text-white');

    const mainRow = document.getElementById(`daily-row-${dailyId}`);
    const detailRow = document.createElement('tr');
    detailRow.id = `detail-row-${dailyId}`;
    detailRow.className = 'bg-blue-50/30 detail-row';
    
    // Find item data
    const item = dailyAttendanceData.find(d => d.dailyId === dailyId);
    if (!item) return;

    const timeTest = item.timeTest ? item.timeTest.split('T')[0] : '';
    const dateInput = document.getElementById('dailyAttendanceDate');
    const month = dateInput.value ? dateInput.value.substring(0, 7) : new Date().toISOString().substring(0, 7);

    detailRow.innerHTML = `
        <td colspan="7" class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-blue-100 border-dashed">
                <!-- Left: Projects -->
                <div>
                    <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <i class="fas fa-project-diagram text-blue-500"></i> ${t('daily.details.projects')} ${month}
                    </h4>
                    <div id="project-list-${dailyId}" class="min-h-[100px] flex items-center justify-center">
                        <div class="animate-pulse text-slate-400 text-xs">${t('daily.details.loading')}</div>
                    </div>
                </div>
                <!-- Right: Skill Details -->
                <div class="space-y-4">
                    <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <i class="fas fa-star text-blue-500"></i> ${t('daily.details.skills')}
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1" data-i18n="employee.skillLv">${t('employee.skillLv')}</label>
                            <input type="number" id="skillLv_${dailyId}" value="${item.skillLv || 0}" onchange="updateDailyRecord(${dailyId}, this, 'skillLv')"
                                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1" data-i18n="employee.timeTest">${t('employee.timeTest')}</label>
                            <input type="date" id="timeTest_${dailyId}" value="${timeTest}" onchange="updateDailyRecord(${dailyId}, this, 'timeTest')"
                                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1" data-i18n="employee.skillNote">${t('employee.skillNote')}</label>
                        <textarea id="skillNote_${dailyId}" onchange="updateDailyRecord(${dailyId}, this, 'skillNote')" rows="2"
                            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all" placeholder="${t('daily.details.placeholderNote')}">${item.skillNote || ''}</textarea>
                    </div>
                </div>
            </div>
        </td>
    `;
    
    mainRow.after(detailRow);

    // Fetch and render projects
    try {
        const response = await fetch(`${window.location.origin}/api/employee/${employeeId}/projects/month/${month}`);
        const projects = await response.json();
        const projectListDiv = document.getElementById(`project-list-${dailyId}`);
        
        if (projects && projects.length > 0) {
            let plistHtml = `<div class="flex flex-wrap gap-2">`;
            projects.forEach(p => {
                plistHtml += `
                    <div class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-semibold flex items-center gap-2 shadow-sm">
                        <i class="fas fa-tag opacity-50"></i> ${p.projectCode}
                    </div>`;
            });
            plistHtml += `</div>`;
            projectListDiv.innerHTML = plistHtml;
        } else {
            projectListDiv.innerHTML = `<div class="text-slate-400 text-xs italic">${t('daily.details.empty')}</div>`;
        }
    } catch (error) {
        console.error('Error fetching employee projects:', error);
        document.getElementById(`project-list-${dailyId}`).innerHTML = `<div class="text-red-400 text-xs">${t('daily.details.error')}</div>`;
    }
}

function updateDailyStats(data) {
    const total = data.length;
    const attended = data.filter(i => i.status === 1).length;
    const remaining = data.filter(i => i.status === 0).length;

    document.getElementById('dailyTotalCount').textContent = total;
    document.getElementById('dailyAttendedCount').textContent = attended;
    document.getElementById('dailyRemainingCount').textContent = remaining;
}

async function updateDailyRecord(id, input, field) {
    const statusVal = parseInt(document.getElementById(`status_${id}`).value);
    const startVal = document.getElementById(`start_${id}`).value;
    const endVal = document.getElementById(`end_${id}`).value;
    
    // Skill fields might be in the detail row, so check if they exist
    const skillLvEl = document.getElementById(`skillLv_${id}`);
    const skillNoteEl = document.getElementById(`skillNote_${id}`);
    const timeTestEl = document.getElementById(`timeTest_${id}`);
    
    const skillLvVal = skillLvEl ? parseInt(skillLvEl.value) : (dailyAttendanceData.find(d => d.dailyId === id)?.skillLv || 0);
    const skillNoteVal = skillNoteEl ? skillNoteEl.value : (dailyAttendanceData.find(d => d.dailyId === id)?.skillNote || '');
    const timeTestVal = timeTestEl ? timeTestEl.value : (dailyAttendanceData.find(d => d.dailyId === id)?.timeTest || '').split('T')[0];

    const updateModel = {
        status: statusVal,
        workStart: startVal || null,
        workEnd: endVal || null,
        skillLv: skillLvVal,
        skillNote: skillNoteVal,
        timeTest: timeTestVal || null
    };

    try {
        const response = await fetch(`${DAILY_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateModel)
        });

        if (response.ok) {
            // Update local data
            const idx = dailyAttendanceData.findIndex(d => d.dailyId === id);
            if (idx !== -1) {
                dailyAttendanceData[idx].status = statusVal;
                dailyAttendanceData[idx].workStart = startVal;
                dailyAttendanceData[idx].workEnd = endVal;
                dailyAttendanceData[idx].skillLv = skillLvVal;
                dailyAttendanceData[idx].skillNote = skillNoteVal;
                dailyAttendanceData[idx].timeTest = timeTestVal;
                updateDailyStats(dailyAttendanceData);
            }
            if (typeof refreshDashboardProjects === 'function') refreshDashboardProjects();
            input.classList.add('border-emerald-500');
            setTimeout(() => input.classList.remove('border-emerald-500'), 1000);
        } else {
            showToast('Lỗi khi cập nhật dữ liệu', 'error');
        }
    } catch (error) {
        console.error('Error updating daily record:', error);
        showToast('Lỗi kết nối server', 'error');
    }
}

async function syncDailyToTimesheet(id, btn) {
    try {
        btn.disabled = true;
        const icon = btn.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'fas fa-spinner fa-spin';

        const response = await fetch(`${DAILY_API_URL}/${id}/sync`, {
            method: 'POST'
        });

        if (response.ok) {
            showToast('Đã đồng bộ sang bảng công và cập nhật hồ sơ nhân viên', 'success');
            // Visual feedback
            icon.className = 'fas fa-check-double text-emerald-600';
            btn.closest('tr').classList.add('bg-emerald-50/30');
            if (typeof refreshDashboardProjects === 'function') refreshDashboardProjects();
        } else {
            const err = await response.json();
            showToast(err.message || 'Lỗi khi đồng bộ', 'error');
            icon.className = originalClass;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error syncing daily to timesheet:', error);
        showToast('Lỗi kết nối server', 'error');
        btn.disabled = false;
    }
}

async function deleteDailyRecord(id) {
    const confirmed = await showConfirmDialog('Bạn có chắc chắn muốn xóa bản ghi điểm danh này? (Hành động này tương đương xác nhận thông tin Sai/Không hợp lệ)');
    if (!confirmed) return;

    try {
        const response = await fetch(`${DAILY_API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            dailyAttendanceData = dailyAttendanceData.filter(d => d.dailyId !== id);
            renderDailyAttendanceTable(dailyAttendanceData);
            updateDailyStats(dailyAttendanceData);
            if (typeof refreshDashboardProjects === 'function') refreshDashboardProjects();
            showToast('Đã xóa bản ghi điểm danh', 'success');
        } else {
            showToast('Lỗi khi xóa bản ghi', 'error');
        }
    } catch (error) {
        console.error('Error deleting daily record:', error);
        showToast('Lỗi kết nối server', 'error');
    }
}

function filterDailyEmployees() {
    const term = document.getElementById('searchDailyEmployee').value.toLowerCase();
    const rows = document.querySelectorAll('#dailyAttendanceTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
}

function refreshDashboardProjects() {
    const dateInput = document.getElementById('dailyAttendanceDate');
    if (dateInput && dateInput.value && typeof loadDashboard === 'function') {
        loadDashboard(dateInput.value);
    }
}

function applyQuickShift(id, val) {
    if (!val) return;
    const parts = val.split('|');
    const start = parts[0];
    const end = parts[1];
    
    const startInput = document.getElementById(`start_${id}`);
    const endInput = document.getElementById(`end_${id}`);
    
    if (startInput) {
        startInput.value = start;
        if (startInput._flatpickr) startInput._flatpickr.setDate(start);
    }
    if (endInput) {
        endInput.value = end;
        if (endInput._flatpickr) endInput._flatpickr.setDate(end);
    }
    
    if (startInput) {
        updateDailyRecord(id, startInput, 'quickShift');
    }
    
    const select = document.getElementById(`quick_shift_${id}`);
    if (select) select.value = '';
}
