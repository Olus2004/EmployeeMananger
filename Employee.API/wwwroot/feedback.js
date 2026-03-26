const FEEDBACK_API_BASE_URL = `${window.location.origin}/api/feedback`;
const EMPLOYEE_API_BASE_URL_FOR_FEEDBACK = `${window.location.origin}/api/employee`;
const TIMESHEET_API_BASE_URL_FOR_FEEDBACK = `${window.location.origin}/api/timesheet`;

let allFeedbacks = [];

// Wrapper dùng chung dialog xác nhận từ app.js
function showConfirm(message, type = 'info') {
    // Always use showConfirmDialog if available, otherwise create a simple modal
    if (typeof showConfirmDialog === 'function') {
        return showConfirmDialog(message, type);
    }
    // Fallback: create a simple confirm modal
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            // Use the existing modal
            const titleEl = document.getElementById('confirmModalTitle');
            const messageEl = document.getElementById('confirmModalMessage');
            const okBtn = document.getElementById('confirmModalOk');
            const cancelBtn = document.getElementById('confirmModalCancel');
            
            if (titleEl && messageEl && okBtn && cancelBtn) {
                titleEl.textContent = t('common.confirm');
                messageEl.textContent = message;
                modal.classList.remove('hidden');
                
                const cleanup = () => {
                    modal.classList.add('hidden');
                    okBtn.onclick = null;
                    cancelBtn.onclick = null;
                };
                
                okBtn.onclick = () => {
                    cleanup();
                    resolve(true);
                };
                
                cancelBtn.onclick = () => {
                    cleanup();
                    resolve(false);
                };
                return;
            }
        }
        // Last resort: use native confirm (should not happen if app.js is loaded)
        resolve(window.confirm(message));
    });
}

// Show feedback management section
function showFeedbackManagement(event) {
    // Hide all sections
    document.getElementById('dashboardSection')?.classList.add('hidden');
    document.getElementById('userManagementSection')?.classList.add('hidden');
    document.getElementById('employeeManagementSection')?.classList.add('hidden');
    document.getElementById('timesheetManagementSection')?.classList.add('hidden');
    document.getElementById('areaManagementSection')?.classList.add('hidden');
    document.getElementById('projectManagementSection')?.classList.add('hidden');
    document.getElementById('excelManagementSection')?.classList.add('hidden');
    document.getElementById('feedbackManagementSection')?.classList.remove('hidden');

    // Update active button
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-link');
    });
    if (event && event.target) {
        const button = event.target.closest('button');
        if (button) button.classList.add('active-link');
    }

    loadFeedbacks();
}

// Load feedbacks
async function loadFeedbacks() {
    try {
        const response = await fetch(FEEDBACK_API_BASE_URL);
        const feedbacks = await response.json();
        if (!Array.isArray(feedbacks)) {
            console.error('Invalid feedbacks response:', feedbacks);
            showToast('Dữ liệu phản hồi trả về không đúng định dạng', 'error');
            return;
        }
        allFeedbacks = feedbacks;
        displayFeedbacks(feedbacks);
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        showToast('Lỗi khi tải danh sách phản hồi', 'error');
    }
}

// Display feedbacks in table
function displayFeedbacks(feedbacks) {
    const tbody = document.getElementById('feedbackTableBody');
    tbody.innerHTML = '';

    // Apply filters
    const statusFilter = document.getElementById('filterStatus')?.value;
    const searchFilter = document.getElementById('searchFeedback')?.value?.toLowerCase() || '';

    let filteredFeedbacks = feedbacks;
    
    if (statusFilter) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.status.toString() === statusFilter);
    }

    if (searchFilter) {
        filteredFeedbacks = filteredFeedbacks.filter(f => 
            (f.employeeName || '').toLowerCase().includes(searchFilter)
        );
    }

    // Update stats (theo trạng thái admin/status_response)
    const total = feedbacks.length;
    const processing = feedbacks.filter(f => f.status === 1).length;
    const closed = feedbacks.filter(f => f.status === 2).length;
    const completed = feedbacks.filter(f => f.status === 3).length;

    document.getElementById('totalFeedbacks').textContent = total;
    document.getElementById('processingCount').textContent = processing;
    document.getElementById('closedCount').textContent = closed;
    document.getElementById('completedCount').textContent = completed;

    if (filteredFeedbacks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p data-i18n="feedback.noFeedback">Chưa có phản hồi nào</p>
                </td>
            </tr>
        `;
        return;
    }

    filteredFeedbacks.forEach((feedback, index) => {
        const row = document.createElement('tr');
        const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50';
        row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${rowBg} group`;

        // Trạng thái admin (status_response)
        const processingLabel = typeof t !== 'undefined' ? t('feedback.statusProcessing') : 'Đang xử lí';
        const closedLabel = typeof t !== 'undefined' ? t('feedback.closed') : 'Đã đóng';
        const completedLabel = typeof t !== 'undefined' ? t('feedback.completed') : 'Đã hoàn thành';
        const statusBadge = feedback.status === 1
            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shadow-sm"><i class="fas fa-clock mr-1.5"></i>${processingLabel}</span>`
            : feedback.status === 2
            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm"><i class="fas fa-times-circle mr-1.5"></i>${closedLabel}</span>`
            : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"><i class="fas fa-check-circle mr-1.5"></i>${completedLabel}</span>`;

        // Trạng thái phản hồi (status/employeeStatus: 1=Đúng,2=Sai,3=Đang xử lí)
        const empStatus = feedback.employeeStatus ?? feedback.status;
        const correctLabel = typeof t !== 'undefined' ? t('feedback.statusCorrect') : 'Đúng';
        const wrongLabel = typeof t !== 'undefined' ? t('feedback.statusWrong') : 'Sai';
        const processingLabelEmp = typeof t !== 'undefined' ? t('feedback.statusProcessing') : 'Đang xử lí';
        const updateStatusLabel = typeof t !== 'undefined' ? t('feedback.updateStatusAction') : 'Cập nhật trạng thái';
        const deleteLabel = typeof t !== 'undefined' ? t('feedback.deleteAction') : 'Xóa';
        const descriptionLabel = typeof t !== 'undefined' ? t('feedback.description') : 'Mô tả phản hồi:';
        let responseStatusHtml = '';
        if (empStatus === 1) {
            responseStatusHtml = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"><i class="fas fa-check-circle mr-1.5"></i>${correctLabel}</span>`;
        } else if (empStatus === 2) {
            responseStatusHtml = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 shadow-sm"><i class="fas fa-times-circle mr-1.5"></i>${wrongLabel}</span>`;
        } else if (empStatus === 3) {
            responseStatusHtml = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shadow-sm"><i class="fas fa-clock mr-1.5"></i>${processingLabelEmp}</span>`;
        } else {
            responseStatusHtml = '<span class="text-slate-400 text-xs">-</span>';
        }

        const submittedDate = new Date(feedback.submittedAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const submittedTime = new Date(feedback.submittedAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const respondedDate = feedback.respondedAt
            ? new Date(feedback.respondedAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
            : null;
        const respondedTime = feedback.respondedAt
            ? new Date(feedback.respondedAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : null;

        const timesheetDay = feedback.timesheetDay
            ? new Date(feedback.timesheetDay).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
            : '-';

        // Main row with basic info
        row.innerHTML = `
            <td class="px-6 py-4">
                <input type="checkbox" class="feedback-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
                    value="${feedback.feedbackId}" onchange="updateFeedbackSelection()">
            </td>
            <td class="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">#${feedback.feedbackId}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-semibold text-slate-800">${feedback.employeeName || 'N/A'}</div>
                <div class="text-xs text-slate-500 mt-1">ID: ${feedback.employeeId}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-slate-600 font-medium">#${feedback.timesheetId}</div>
                <div class="text-xs text-slate-500 mt-1">${timesheetDay}</div>
            </td>
            <td class="px-6 py-4 text-slate-600 whitespace-nowrap">
                <div>${submittedDate}</div>
                <div class="text-xs text-slate-500 mt-1">${submittedTime}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${responseStatusHtml}
            </td>
            <td class="px-6 py-4 whitespace-nowrap sticky right-0 ${rowBg} group-hover:from-blue-50/80 group-hover:to-white/80 dark:group-hover:from-blue-900/40 dark:group-hover:to-slate-900/80 backdrop-blur-md z-10 border-l border-slate-200 dark:border-slate-700">
                <div class="flex flex-col gap-2">
                    <button onclick="openUpdateEmployeeStatusModal(${feedback.feedbackId}, ${empStatus})" 
                        class="h-8 px-3 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20 font-bold text-[10px] whitespace-nowrap shadow-sm">
                        <i class="fas fa-edit mr-1.5"></i>${updateStatusLabel}
                    </button>
                    <button onclick="deleteFeedback(${feedback.feedbackId})" 
                        class="h-8 px-3 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all border border-rose-100 dark:border-rose-500/20 font-bold text-[10px] whitespace-nowrap shadow-sm">
                        <i class="fas fa-trash mr-1.5"></i>${deleteLabel}
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);

        // Row for "Mô tả phản hồi"
        const descRow = document.createElement('tr');
        descRow.className = `${rowBg} border-b border-slate-200`;
        descRow.innerHTML = `
            <td colspan="5" class="px-6 py-3 bg-slate-50/50">
                <div class="flex items-start">
                    <span class="font-semibold text-slate-700 mr-3 whitespace-nowrap">${descriptionLabel}</span>
                    <div class="text-slate-600 flex-1" style="line-height: 1.6; word-wrap: break-word; word-break: break-word;">
                        ${feedback.description || '-'}
                    </div>
                </div>
            </td>
            <td class="px-6 py-3 sticky right-0 ${rowBg} border-l border-slate-200"></td>
        `;
        tbody.appendChild(descRow);

    });
}


// Delete feedback
async function deleteFeedback(id) {
    const confirmed = await showConfirm('Bạn có chắc chắn muốn xóa phản hồi này?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${FEEDBACK_API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Có lỗi xảy ra');
        }

        loadFeedbacks();
        showToast(typeof t !== 'undefined' ? t('feedback.deleteSuccess') : 'Xóa phản hồi thành công', 'success');
    } catch (error) {
        console.error('Error deleting feedback:', error);
        showToast(typeof t !== 'undefined' ? t('feedback.deleteError') : 'Lỗi khi xóa phản hồi', 'error');
    }
}

// Mở modal cập nhật trạng thái phản hồi
function openUpdateEmployeeStatusModal(id, currentStatus) {
    const modal = document.getElementById('updateEmployeeStatusModal');
    const idInput = document.getElementById('updateEmployeeStatusId');
    const select = document.getElementById('updateEmployeeStatusSelect');

    if (!modal || !idInput || !select) return;

    idInput.value = id;
    select.value = String(currentStatus || 3);
    modal.classList.remove('hidden');
}

function closeUpdateEmployeeStatusModal() {
    const modal = document.getElementById('updateEmployeeStatusModal');
    const form = document.getElementById('updateEmployeeStatusForm');
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
}

// Admin chỉnh sửa trạng thái phản hồi (status: 1=Đúng,2=Sai,3=Đang xử lí)
async function updateEmployeeStatus(id, value) {
    const status = parseInt(value, 10);
    if (![1, 2, 3].includes(status)) {
        showToast('Trạng thái không hợp lệ', 'error');
        return;
    }

    try {
        const response = await fetch(`${FEEDBACK_API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái phản hồi');
        }

        showToast(typeof t !== 'undefined' ? t('feedback.updateStatusSuccess') : 'Cập nhật trạng thái phản hồi thành công', 'success');
        loadFeedbacks();
    } catch (error) {
        console.error('Error updating employee status:', error);
        showToast(error.message || (typeof t !== 'undefined' ? t('feedback.updateStatusError') : 'Lỗi khi cập nhật trạng thái phản hồi'), 'error');
    }
}

// Submit form cập nhật trạng thái phản hồi
document.getElementById('updateEmployeeStatusForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('updateEmployeeStatusId').value;
    const value = document.getElementById('updateEmployeeStatusSelect').value;
    await updateEmployeeStatus(id, value);
    closeUpdateEmployeeStatusModal();
});

// Multi-select functions for feedbacks
function toggleSelectAllFeedbacks(checkbox) {
    const checkboxes = document.querySelectorAll('.feedback-checkbox');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    updateFeedbackSelection();
}

function updateFeedbackSelection() {
    const checkboxes = document.querySelectorAll('.feedback-checkbox:checked');
    const count = checkboxes.length;
    const bulkActions = document.getElementById('feedbackBulkActions');
    const selectedCount = document.getElementById('feedbackSelectedCount');
    
    if (count > 0) {
        bulkActions.classList.remove('hidden');
        selectedCount.textContent = `Đã chọn: ${count}`;
    } else {
        bulkActions.classList.add('hidden');
    }
    
    // Update select all checkbox
    const selectAll = document.getElementById('selectAllFeedbacks');
    const allCheckboxes = document.querySelectorAll('.feedback-checkbox');
    if (selectAll && allCheckboxes.length > 0) {
        selectAll.checked = allCheckboxes.length === checkboxes.length;
    }
}

async function deleteSelectedFeedbacks() {
    const checkboxes = document.querySelectorAll('.feedback-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showToast('Vui lòng chọn ít nhất một phản hồi để xóa', 'warning');
        return;
    }
    
    const confirmed = await showConfirmDialog(
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} phản hồi đã chọn?`,
        'Xác nhận xóa phản hồi'
    );
    if (!confirmed) {
        return;
    }
    
    try {
        // Delete each feedback
        for (const id of selectedIds) {
            const response = await fetch(`/api/feedback/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Lỗi khi xóa phản hồi');
            }
        }
        
        showToast(`Đã xóa thành công ${selectedIds.length} phản hồi`, 'success');
        loadFeedbacks();
        updateFeedbackSelection();
    } catch (error) {
        console.error('Error deleting feedbacks:', error);
        showToast(`Lỗi khi xóa phản hồi: ${error.message}`, 'error');
    }
}

