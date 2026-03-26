// Excel Import/Export functionality

// Show Excel Management Section
function showExcelManagement(event) {
    if (event) event.preventDefault();
    
    // Hide all sections
    document.querySelectorAll('[id$="Section"]').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show Excel section
    const excelSection = document.getElementById('excelManagementSection');
    if (excelSection) {
        excelSection.classList.remove('hidden');
    }
    
    // Update active menu
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-link');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active-link');
    }
    
    // Load history when showing section
    loadExcelHistory();
    
    // Initialize export date selectors
    initializeExportDateSelectors();
}

// Initialize export date selectors
function initializeExportDateSelectors() {
    const yearSelect = document.getElementById('exportYear');
    const monthSelect = document.getElementById('exportMonth');
    
    if (!yearSelect) return;
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Populate years (current year and 5 years before/after)
    yearSelect.innerHTML = `<option value="">${typeof t !== 'undefined' ? t('excel.allYears') : 'Tất cả các năm'}</option>`;
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
    
    // Set current month as default
    if (monthSelect) {
        const currentMonth = new Date().getMonth() + 1;
        monthSelect.value = currentMonth;
    }
}

// Load Excel history
async function loadExcelHistory() {
    try {
        const response = await fetch('/api/excel');
        if (!response.ok) {
            throw new Error(typeof t !== 'undefined' ? t('excel.loadHistoryError') : 'Không thể tải lịch sử');
        }
        
        const excels = await response.json();
        displayExcelHistory(excels);
    } catch (error) {
        console.error('Error loading Excel history:', error);
        const tbody = document.getElementById('excelHistoryTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-12 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2 block"></i>
                        <p>${typeof t !== 'undefined' ? t('excel.loadHistoryFailed') : 'Lỗi khi tải lịch sử'}: ${error.message}</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Display Excel history
function displayExcelHistory(excels) {
    const tbody = document.getElementById('excelHistoryTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (excels.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p>${typeof t !== 'undefined' ? t('excel.noHistory') : 'Chưa có lịch sử import nào'}</p>
                </td>
            </tr>
        `;
        return;
    }
    
    excels.forEach((excel, index) => {
        const row = document.createElement('tr');
        row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
        
        const uploadDate = new Date(excel.timeUpload).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td class="px-6 py-4 font-semibold text-slate-700">#${excel.excelId}</td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-file-excel text-green-600"></i>
                    <span class="text-slate-800 font-medium">${excel.excelName}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600">${uploadDate}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="deleteExcel(${excel.excelId})" 
                    class="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all border border-rose-100 dark:border-rose-500/20 shadow-sm" title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}">
                    <i class="fas fa-trash-can text-xs"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete Excel record
async function deleteExcel(excelId) {
    const confirmed = await showConfirmDialog(
        typeof t !== 'undefined' ? t('excel.confirmDeleteRecord') : 'Bạn có chắc chắn muốn xóa bản ghi này?',
        typeof t !== 'undefined' ? t('excel.confirmDeleteTitle') : 'Xác nhận xóa'
    );
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await fetch(`/api/excel/${excelId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            if (typeof showToast === 'function') {
                showToast(typeof t !== 'undefined' ? t('message.deleteSuccess') : 'Xóa thành công', 'success');
            }
            loadExcelHistory();
        } else {
            const error = await response.json();
            if (typeof showToast === 'function') {
                showToast(error.message || (typeof t !== 'undefined' ? t('excel.deleteFailed') : 'Xóa thất bại'), 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting Excel:', error);
        if (typeof showToast === 'function') {
            showToast(typeof t !== 'undefined' ? t('excel.deleteError') : 'Lỗi khi xóa', 'error');
        }
    }
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const fileNameDiv = document.getElementById('selectedFileName');
        const fileNameText = document.getElementById('fileNameText');
        
        if (fileNameText) {
            fileNameText.textContent = file.name;
        }
        if (fileNameDiv) {
            fileNameDiv.classList.remove('hidden');
        }
    }
}

// Clear file input
function clearFileInput() {
    const fileInput = document.getElementById('excelFileInput');
    const fileNameDiv = document.getElementById('selectedFileName');
    const importResult = document.getElementById('importResult');
    
    if (fileInput) fileInput.value = '';
    if (fileNameDiv) fileNameDiv.classList.add('hidden');
    if (importResult) {
        importResult.classList.add('hidden');
        importResult.innerHTML = '';
    }
}

// Handle Excel Import Form Submit
document.addEventListener('DOMContentLoaded', function() {
    const excelImportForm = document.getElementById('excelImportForm');
    if (excelImportForm) {
        excelImportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('excelFileInput');
            const file = fileInput ? fileInput.files[0] : null;
            
            if (!file) {
                if (typeof showToast === 'function') {
                    showToast(typeof t !== 'undefined' ? t('excel.selectFileError') : 'Vui lòng chọn file Excel để import', 'error');
                }
                return;
            }
            
            // Validate file extension
            const allowedExtensions = ['.xlsx', '.xls'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                if (typeof showToast === 'function') {
                    showToast(typeof t !== 'undefined' ? t('excel.invalidFileType') : 'File phải có định dạng .xlsx hoặc .xls', 'error');
                }
                return;
            }
            
            // Get import options
            const importEmployeesCheckbox = document.getElementById('importEmployees');
            const importTimesheetsCheckbox = document.getElementById('importTimesheets');
            const importEmployees = importEmployeesCheckbox ? importEmployeesCheckbox.checked : true;
            const importTimesheets = importTimesheetsCheckbox ? importTimesheetsCheckbox.checked : true;
            
            // Validate at least one option is selected
            if (!importEmployees && !importTimesheets) {
                if (typeof showToast === 'function') {
                    showToast(typeof t !== 'undefined' ? t('excel.selectDataTypeError') : 'Vui lòng chọn ít nhất một loại dữ liệu để import', 'warning');
                }
                return;
            }
            
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('importEmployees', importEmployees);
            formData.append('importTimesheets', importTimesheets);
            
            // Show loading
            const importResult = document.getElementById('importResult');
            if (importResult) {
                importResult.classList.remove('hidden');
                importResult.innerHTML = `
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-spinner fa-spin text-blue-600 text-xl"></i>
                            <span class="text-blue-700 font-semibold">${typeof t !== 'undefined' ? t('excel.importing') : 'Đang import dữ liệu, vui lòng đợi...'}</span>
                        </div>
                    </div>
                `;
            }
            
            try {
                const response = await fetch('/api/excel/import', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Show success message
                    const importTypes = [];
                    if (importEmployees) importTypes.push(typeof t !== 'undefined' ? t('excel.employees') : 'Nhân viên');
                    if (importTimesheets) importTypes.push(typeof t !== 'undefined' ? t('excel.timesheets') : 'Bảng công');
                    
                    if (importResult) {
                        importResult.innerHTML = `
                            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                                <div class="flex items-start space-x-3">
                                    <i class="fas fa-check-circle text-green-600 text-xl mt-1"></i>
                                    <div class="flex-1">
                                        <h3 class="text-green-800 font-semibold mb-2">${typeof t !== 'undefined' ? t('excel.importSuccess') : 'Import thành công!'}</h3>
                                        <p class="text-green-700 text-sm mb-2">${result.message}</p>
                                        <p class="text-green-700 text-xs mb-2">${typeof t !== 'undefined' ? t('excel.import') : 'Đã import'}: ${importTypes.join(', ')}</p>
                                        <ul class="text-sm text-green-700 space-y-1">
                                            ${importEmployees ? `<li><i class="fas fa-users mr-2"></i>${typeof t !== 'undefined' ? t('excel.employees') : 'Nhân viên'}: ${result.employeesImported}</li>` : ''}
                                            ${importTimesheets ? `<li><i class="fas fa-calendar-check mr-2"></i>${typeof t !== 'undefined' ? t('excel.timesheets') : 'Bảng công'}: ${result.timesheetsImported}</li>` : ''}
                                        </ul>
                                        ${result.errors && result.errors.length > 0 ? `
                                            <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                                                <p class="text-yellow-800 font-semibold text-sm mb-1">${typeof t !== 'undefined' ? t('excel.warning') : 'Cảnh báo:'}</p>
                                                <ul class="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                                                    ${result.errors.map(err => `<li>${err}</li>`).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    
                    if (typeof showToast === 'function') {
                        showToast(typeof t !== 'undefined' ? t('excel.importSuccess') : 'Import Excel thành công!', 'success');
                    }
                    
                    // Clear file input
                    clearFileInput();
                    
                    // Reload history
                    loadExcelHistory();
                    
                    // Reload data if needed
                    if (typeof loadEmployees === 'function') {
                        loadEmployees();
                    }
                    if (typeof loadTimesheets === 'function') {
                        loadTimesheets();
                    }
                    if (typeof loadDashboard === 'function') {
                        loadDashboard();
                    }
                } else {
                    // Show error message
                    if (importResult) {
                        importResult.innerHTML = `
                            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <div class="flex items-start space-x-3">
                                    <i class="fas fa-exclamation-circle text-red-600 text-xl mt-1"></i>
                                    <div class="flex-1">
                                        <h3 class="text-red-800 font-semibold mb-2">${typeof t !== 'undefined' ? t('excel.importFailed') : 'Import thất bại!'}</h3>
                                        <p class="text-red-700 text-sm mb-2">${result.message || (typeof t !== 'undefined' ? t('excel.importError') : 'Đã xảy ra lỗi khi import Excel')}</p>
                                        ${result.errors && result.errors.length > 0 ? `
                                            <ul class="text-sm text-red-700 space-y-1 list-disc list-inside">
                                                ${result.errors.map(err => `<li>${err}</li>`).join('')}
                                            </ul>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    
                    if (typeof showToast === 'function') {
                        showToast(result.message || (typeof t !== 'undefined' ? t('excel.importFailed') : 'Import Excel thất bại'), 'error');
                    }
                }
            } catch (error) {
                console.error('Error importing Excel:', error);
                if (importResult) {
                    importResult.innerHTML = `
                        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div class="flex items-start space-x-3">
                                <i class="fas fa-exclamation-circle text-red-600 text-xl mt-1"></i>
                                <div class="flex-1">
                                    <h3 class="text-red-800 font-semibold mb-2">${typeof t !== 'undefined' ? t('excel.connectionError') : 'Lỗi kết nối!'}</h3>
                                    <p class="text-red-700 text-sm">${typeof t !== 'undefined' ? t('excel.connectionErrorDesc') : 'Không thể kết nối đến server. Vui lòng thử lại sau.'}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
                if (typeof showToast === 'function') {
                    showToast(typeof t !== 'undefined' ? t('excel.serverConnectionError') : 'Lỗi kết nối đến server', 'error');
                }
            }
        });
    }
});

// Export Excel
async function exportExcel() {
    try {
        // Get selected date range (priority)
        const startDateInput = document.getElementById('exportStartDate');
        const endDateInput = document.getElementById('exportEndDate');
        
        const startDate = startDateInput && startDateInput.value ? startDateInput.value : null;
        const endDate = endDateInput && endDateInput.value ? endDateInput.value : null;
        
        // Get selected year and month (fallback)
        const yearSelect = document.getElementById('exportYear');
        const monthSelect = document.getElementById('exportMonth');
        
        const year = yearSelect && yearSelect.value ? parseInt(yearSelect.value) : null;
        const month = monthSelect && monthSelect.value ? parseInt(monthSelect.value) : null;
        
        // Build query string - prioritize date range
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        // Only add year/month if date range is not provided
        if (!startDate && !endDate) {
            if (year) params.append('year', year);
            if (month) params.append('month', month);
        }
        
        const queryString = params.toString();
        const url = queryString ? `/api/excel/export?${queryString}` : '/api/excel/export';
        
        if (typeof showToast === 'function') {
            showToast(typeof t !== 'undefined' ? t('excel.exporting') : 'Đang xử lý export Excel...', 'info');
        }
        
        const response = await fetch(url, {
            method: 'GET'
        });
        
            if (!response.ok) {
            // Try to get error message from response
            try {
                const errorResult = await response.json();
                if (typeof showToast === 'function') {
                    showToast(errorResult.message || (typeof t !== 'undefined' ? t('excel.exportFailed') : 'Export Excel thất bại'), 'error');
                }
            } catch {
                if (typeof showToast === 'function') {
                    showToast(typeof t !== 'undefined' ? t('excel.exportFailed') : 'Export Excel thất bại', 'error');
                }
            }
            return;
        }
        
        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'export.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = fileNameMatch[1].replace(/['"]/g, '');
                // Decode URI if needed
                try {
                    fileName = decodeURIComponent(fileName);
                } catch {
                    // Keep original if decode fails
                }
            }
        }
        
        // Get file as blob
        const blob = await response.blob();
        
        // Create download link
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlBlob);
        
        // Show success message with date info
        let dateInfo = '';
        const fromLabel = typeof t !== 'undefined' ? t('excel.from') : 'từ';
        const toLabel = typeof t !== 'undefined' ? t('excel.to') : 'đến';
        const yearLabel = typeof t !== 'undefined' ? t('excel.yearLabel') : 'năm';
        if (startDate && endDate) {
            dateInfo = ` (${startDate} - ${endDate})`;
        } else if (startDate) {
            dateInfo = ` (${fromLabel} ${startDate})`;
        } else if (endDate) {
            dateInfo = ` (${toLabel} ${endDate})`;
        } else if (year && month) {
            dateInfo = ` (${month}/${year})`;
        } else if (year) {
            dateInfo = ` (${yearLabel} ${year})`;
        }
        
        if (typeof showToast === 'function') {
            showToast(`${typeof t !== 'undefined' ? t('excel.exportSuccess') : 'Export Excel thành công!'}${dateInfo}`, 'success');
        }
    } catch (error) {
        console.error('Error exporting Excel:', error);
        if (typeof showToast === 'function') {
            showToast(typeof t !== 'undefined' ? t('excel.serverConnectionError') : 'Lỗi kết nối đến server', 'error');
        }
    }
}

