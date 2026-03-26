// Timesheet Management JavaScript
const TIMESHEET_API_BASE_URL = `${window.location.origin}/api/timesheet`;
const EMPLOYEE_API_BASE_URL_FOR_TIMESHEET = `${window.location.origin}/api/employee`;
const AREA_API_BASE_URL_FOR_TIMESHEET = `${window.location.origin}/api/area`;

let employees = [];
let allTimesheets = [];
let areasForTimesheet = [];
let currentTimesheetPage = 1;
const TIMESHEETS_PER_PAGE = 50;
let currentTimesheetFilter = { employeeId: null, startDate: null, endDate: null, status: null, nightShift: false }; // Lưu filter hiện tại

// Format time for display
function formatTime(timeString) {
    if (!timeString) return '-';
    try {
        // Handle TimeOnly format (HH:mm:ss or HH:mm)
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        return timeString;
    } catch {
        return timeString;
    }
}

// Show timesheet management
function showTimesheetManagement(event, filterDate = null) {
    const dashboardSection = document.getElementById('dashboardSection');
    const userSection = document.getElementById('userManagementSection');
    const employeeSection = document.getElementById('employeeManagementSection');
    const timesheetSection = document.getElementById('timesheetManagementSection');
    const areaSection = document.getElementById('areaManagementSection');
    const projectSection = document.getElementById('projectManagementSection');
    const feedbackSection = document.getElementById('feedbackManagementSection');
    const excelSection = document.getElementById('excelManagementSection');
    
    if (dashboardSection) dashboardSection.classList.add('hidden');
    if (userSection) userSection.classList.add('hidden');
    if (employeeSection) employeeSection.classList.add('hidden');
    if (timesheetSection) timesheetSection.classList.remove('hidden');
    if (areaSection) areaSection.classList.add('hidden');
    if (projectSection) projectSection.classList.add('hidden');
    if (feedbackSection) feedbackSection.classList.add('hidden');
    if (excelSection) excelSection.classList.add('hidden');
    
    // Update sidebar active state
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-link');
    });
    if (event && event.target) {
        const button = event.target.closest('button');
        if (button) button.classList.add('active-link');
    }
    
    // Nếu có filterDate, set filter và áp dụng
    if (filterDate) {
        const startDateInput = document.getElementById('filterStartDate');
        const endDateInput = document.getElementById('filterEndDate');
        if (startDateInput) startDateInput.value = filterDate;
        if (endDateInput) endDateInput.value = filterDate;
        
        // Set filter và load
        currentTimesheetFilter.startDate = filterDate;
        currentTimesheetFilter.endDate = filterDate;
        loadEmployeesForTimesheet();
        // Load và filter timesheets
        setTimeout(() => {
            filterTimesheets();
        }, 100);
    } else {
        loadTimesheets(false); // Không áp dụng filter khi mở lần đầu
        loadEmployeesForTimesheet();
    }
}

// Load employees for search
async function loadEmployeesForTimesheet() {
    try {
        const response = await fetch(EMPLOYEE_API_BASE_URL_FOR_TIMESHEET);
        employees = await response.json();
        
        // Setup employee search functionality for modal
        setupEmployeeSearch();
        
        // Setup employee search functionality for filter
        setupFilterEmployeeSearch();
    } catch (error) {
        console.error('Error loading employees:', error);
        showToast('Lỗi khi tải danh sách nhân viên', 'error');
    }
}

// Setup employee search for filter
function setupFilterEmployeeSearch() {
    const searchInput = document.getElementById('filterEmployee');
    const resultsContainer = document.getElementById('filterEmployeeSearchResults');
    const hiddenInput = document.getElementById('filterEmployeeId');
    
    if (!searchInput || !resultsContainer || !hiddenInput) return;
    
    // Clear previous event listeners by cloning
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    // Function to display employee suggestions
    function displaySuggestions(filteredEmployees) {
        if (filteredEmployees.length === 0) {
            resultsContainer.innerHTML = `<div class="px-4 py-3 text-slate-500 text-sm text-center">${typeof t !== 'undefined' ? t('employee.notFound') : 'Không tìm thấy nhân viên'}</div>`;
            resultsContainer.classList.remove('hidden');
            return;
        }
        
        resultsContainer.innerHTML = filteredEmployees.map(emp => {
            const displayName = emp.fullname || emp.fullnameOther || `Nhân viên #${emp.employeeId}`;
            const areaInfo = emp.areaName ? ` - ${emp.areaName}` : '';
            return `
                <div class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 filter-employee-search-item transition-colors" 
                     data-employee-id="${emp.employeeId}" 
                     data-employee-name="${displayName}">
                    <div class="font-semibold text-slate-800">${displayName}</div>
                    <div class="text-xs text-slate-500">ID: ${emp.employeeId}${areaInfo}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        resultsContainer.querySelectorAll('.filter-employee-search-item').forEach(item => {
            item.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-employee-id');
                const employeeName = this.getAttribute('data-employee-name');
                
                hiddenInput.value = employeeId;
                newSearchInput.value = employeeName;
                resultsContainer.classList.add('hidden');
            });
        });
        
        resultsContainer.classList.remove('hidden');
    }
    
    // Function to filter employees
    function filterEmployees(searchTerm) {
        if (!searchTerm) {
            return employees; // Return all employees if no search term
        }
        
        const term = searchTerm.toLowerCase().trim();
        return employees.filter(emp => {
            const fullname = (emp.fullname || '').toLowerCase();
            const fullnameOther = (emp.fullnameOther || '').toLowerCase();
            const employeeId = emp.employeeId.toString();
            const areaName = (emp.areaName || '').toLowerCase();
            
            return fullname.includes(term) || 
                   fullnameOther.includes(term) || 
                   employeeId.includes(term) ||
                   areaName.includes(term);
        });
    }
    
    // Event listeners
    newSearchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        const clearBtn = document.getElementById('clearFilterEmployeeBtn');
        
        if (searchTerm.length >= 1) {
            const filtered = filterEmployees(searchTerm);
            displaySuggestions(filtered.slice(0, 10)); // Limit to 10 results
            if (clearBtn) clearBtn.classList.remove('hidden');
        } else {
            resultsContainer.classList.add('hidden');
            hiddenInput.value = '';
            if (clearBtn) clearBtn.classList.add('hidden');
        }
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!newSearchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });
    
    // Clear filter when input is cleared
    newSearchInput.addEventListener('blur', function() {
        // Delay to allow click events to fire first
        setTimeout(() => {
            if (!this.value.trim() && hiddenInput.value) {
                hiddenInput.value = '';
                const clearBtn = document.getElementById('clearFilterEmployeeBtn');
                if (clearBtn) clearBtn.classList.add('hidden');
            }
        }, 200);
    });
    
    // Show clear button if there's a value
    if (newSearchInput.value) {
        const clearBtn = document.getElementById('clearFilterEmployeeBtn');
        if (clearBtn) clearBtn.classList.remove('hidden');
    }
}

// Setup employee search with autocomplete
function setupEmployeeSearch() {
    const searchInput = document.getElementById('modalEmployeeSearch');
    const resultsContainer = document.getElementById('employeeSearchResults');
    const hiddenInput = document.getElementById('modalEmployeeId');
    
    if (!searchInput || !resultsContainer || !hiddenInput) return;
    
    // Clear previous event listeners by cloning
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    // Function to display employee suggestions
    function displaySuggestions(filteredEmployees) {
        if (filteredEmployees.length === 0) {
            resultsContainer.innerHTML = `<div class="px-4 py-3 text-slate-500 text-sm text-center">${typeof t !== 'undefined' ? t('employee.notFound') : 'Không tìm thấy nhân viên'}</div>`;
            resultsContainer.classList.remove('hidden');
            return;
        }
        
        resultsContainer.innerHTML = filteredEmployees.map(emp => {
            const displayName = emp.fullname || emp.fullnameOther || `Nhân viên #${emp.employeeId}`;
            const areaInfo = emp.areaName ? ` - ${emp.areaName}` : '';
            return `
                <div class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 employee-search-item transition-colors" 
                     data-employee-id="${emp.employeeId}" 
                     data-employee-name="${displayName}">
                    <div class="font-semibold text-slate-800">${displayName}</div>
                    <div class="text-xs text-slate-500">ID: ${emp.employeeId}${areaInfo}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        resultsContainer.querySelectorAll('.employee-search-item').forEach(item => {
            item.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-employee-id');
                const employeeName = this.getAttribute('data-employee-name');
                
                hiddenInput.value = employeeId;
                newSearchInput.value = employeeName;
                resultsContainer.classList.add('hidden');
                
                // Trigger validation
                hiddenInput.dispatchEvent(new Event('change'));
            });
        });
        
        resultsContainer.classList.remove('hidden');
    }
    
    // Function to filter employees
    function filterEmployees(searchTerm) {
        if (!searchTerm) {
            return employees; // Return all employees if no search term
        }
        
        const term = searchTerm.toLowerCase().trim();
        return employees.filter(emp => {
            const fullname = (emp.fullname || '').toLowerCase();
            const fullnameOther = (emp.fullnameOther || '').toLowerCase();
            const employeeId = emp.employeeId.toString();
            const areaName = (emp.areaName || '').toLowerCase();
            
            return fullname.includes(term) ||
                   fullnameOther.includes(term) ||
                   employeeId.includes(term) ||
                   areaName.includes(term);
        });
    }
    
    // Show suggestions when typing
    newSearchInput.addEventListener('input', function() {
        const searchTerm = this.value;
        
        if (!searchTerm.trim()) {
            hiddenInput.value = '';
            resultsContainer.classList.add('hidden');
            return;
        }
        
        const filtered = filterEmployees(searchTerm);
        displaySuggestions(filtered);
    });
    
    // Show all employees when focused (if input is empty)
    newSearchInput.addEventListener('focus', function() {
        if (this.value.trim() === '') {
            displaySuggestions(employees);
        } else {
            // If there's already text, filter and show suggestions
            const filtered = filterEmployees(this.value);
            displaySuggestions(filtered);
        }
    });
    
    // Hide results when clicking outside
    let clickOutsideHandler = function(e) {
        if (!newSearchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    };
    document.addEventListener('click', clickOutsideHandler);
    
    // Handle keyboard navigation (Enter key)
    newSearchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstItem = resultsContainer.querySelector('.employee-search-item');
            if (firstItem) {
                firstItem.click();
            }
        } else if (e.key === 'Escape') {
            resultsContainer.classList.add('hidden');
        }
    });
    
    // Clear selection when input is cleared
    newSearchInput.addEventListener('blur', function() {
        // Delay to allow click events to fire first
        setTimeout(() => {
            if (!this.value.trim() && hiddenInput.value) {
                hiddenInput.value = '';
            }
        }, 200);
    });
}

// Load areas for timesheet modal
async function loadAreasForTimesheet() {
    try {
        const response = await fetch(AREA_API_BASE_URL_FOR_TIMESHEET);
        areasForTimesheet = await response.json();
        
        const select = document.getElementById('modalTimesheetAreaId');
        if (select) {
            select.innerHTML = `<option value="">${typeof t !== 'undefined' ? t('employee.selectArea') : '-- Chọn khu vực --'}</option>`;
            areasForTimesheet.forEach(area => {
                const option = document.createElement('option');
                option.value = area.areaId;
                option.textContent = area.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading areas:', error);
    }
}

// Load timesheets
async function loadTimesheets(applyFilter = true) {
    try {
        if (applyFilter && (currentTimesheetFilter.employeeId || currentTimesheetFilter.startDate || currentTimesheetFilter.endDate)) {
            // Apply saved filter instead of loading all
            await applySavedTimesheetFilter();
            return;
        }
        
        const response = await fetch(TIMESHEET_API_BASE_URL);
        allTimesheets = await response.json();
        currentTimesheetPage = 1; // Reset to first page
        displayTimesheets(allTimesheets);
    } catch (error) {
        console.error('Error loading timesheets:', error);
        showToast('Lỗi khi tải danh sách bảng công', 'error');
    }
}

// Clear filter employee
function clearFilterEmployee() {
    const searchInput = document.getElementById('filterEmployee');
    const hiddenInput = document.getElementById('filterEmployeeId');
    const resultsContainer = document.getElementById('filterEmployeeSearchResults');
    const clearBtn = document.getElementById('clearFilterEmployeeBtn');
    
    if (searchInput) searchInput.value = '';
    if (hiddenInput) hiddenInput.value = '';
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');
}

// Filter timesheets
async function filterTimesheets() {
    const employeeId = document.getElementById('filterEmployeeId').value;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const statusFilter = document.getElementById('filterStatus').value;

    // Handle single date selection
    if (startDate && !endDate) endDate = startDate;
    if (!startDate && endDate) startDate = endDate;

    // Save current filter (using updated startDate/endDate)
    currentTimesheetFilter.employeeId = employeeId || null;
    currentTimesheetFilter.startDate = startDate || null;
    currentTimesheetFilter.endDate = endDate || null;
    currentTimesheetFilter.status = statusFilter || null;
    currentTimesheetFilter.nightShift = statusFilter === 'night';

    try {
        let url = TIMESHEET_API_BASE_URL;
        
        if (employeeId && startDate && endDate) {
            url = `${TIMESHEET_API_BASE_URL}/employee/${employeeId}/date-range?startDate=${startDate}&endDate=${endDate}`;
        } else if (employeeId) {
            url = `${TIMESHEET_API_BASE_URL}/employee/${employeeId}`;
        } else if (startDate && endDate) {
            url = `${TIMESHEET_API_BASE_URL}/date-range?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(url);
        let timesheets = await response.json();
        
        // Apply status filter (client-side)
        if (statusFilter) {
            if (statusFilter === 'night') {
                // Filter for night shift (workStart >= 20:00 or workEnd <= 8:00)
                timesheets = timesheets.filter(t => {
                    if (!t.workStart || !t.workEnd) return false;
                    const startHour = parseInt(t.workStart.split(':')[0]);
                    const endHour = parseInt(t.workEnd.split(':')[0]);
                    return startHour >= 20 || endHour <= 8;
                });
            } else {
                // Filter by status number
                const statusNum = parseInt(statusFilter);
                timesheets = timesheets.filter(t => t.status === statusNum);
            }
        }
        
        allTimesheets = timesheets; // Update allTimesheets with filtered results
        currentTimesheetPage = 1; // Reset to first page when filtering
        displayTimesheets(allTimesheets);
    } catch (error) {
        console.error('Error filtering timesheets:', error);
        showToast('Lỗi khi lọc bảng công', 'error');
    }
}

// Apply saved filter after reload
async function applySavedTimesheetFilter() {
    if (currentTimesheetFilter.employeeId || currentTimesheetFilter.startDate || currentTimesheetFilter.endDate || currentTimesheetFilter.status) {
        // Restore filter values
        if (currentTimesheetFilter.employeeId) {
            document.getElementById('filterEmployeeId').value = currentTimesheetFilter.employeeId;
            // Restore employee name in search input if needed
            const employee = employees.find(e => e.employeeId == currentTimesheetFilter.employeeId);
            if (employee) {
                const displayName = employee.fullname || employee.fullnameOther || `Nhân viên #${employee.employeeId}`;
                document.getElementById('filterEmployee').value = displayName;
            }
        }
        if (currentTimesheetFilter.startDate) {
            document.getElementById('filterStartDate').value = currentTimesheetFilter.startDate;
        }
        if (currentTimesheetFilter.endDate) {
            document.getElementById('filterEndDate').value = currentTimesheetFilter.endDate;
        }
        if (currentTimesheetFilter.status) {
            document.getElementById('filterStatus').value = currentTimesheetFilter.status;
        }
        
        // Apply filter
        await filterTimesheets();
    } else {
        // No filter, just load all
        await loadTimesheets();
    }
}

// Display timesheets in table
function displayTimesheets(timesheets) {
    const tbody = document.getElementById('timesheetTableBody');
    tbody.innerHTML = '';

    // Update stats (use all timesheets, not just current page)
    const total = timesheets.length;
    const statusCounts = {};
    timesheets.forEach(t => {
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    const nightShift = timesheets.filter(t => t.workTime && t.workTime > 0).length;
    
    document.getElementById('totalTimesheets').textContent = total;
    for (let i = 1; i <= 7; i++) {
        const el = document.getElementById(`status${i}Count`);
        if (el) el.textContent = statusCounts[i] || 0;
    }
    document.getElementById('nightShiftCount').textContent = nightShift;

    if (timesheets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="px-6 py-10 text-center text-slate-500">
                    <i class="fas fa-inbox text-3xl mb-3 block"></i>
                    <p class="text-base">Chưa có bảng công nào</p>
                </td>
            </tr>
        `;
        // Hide pagination when no data
        const paginationContainer = document.getElementById('timesheetPagination');
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(timesheets.length / TIMESHEETS_PER_PAGE);
    if (currentTimesheetPage > totalPages && totalPages > 0) {
        currentTimesheetPage = totalPages;
    }
    
    const startIndex = (currentTimesheetPage - 1) * TIMESHEETS_PER_PAGE;
    const endIndex = startIndex + TIMESHEETS_PER_PAGE;
    const paginatedTimesheets = timesheets.slice(startIndex, endIndex);

    // Display paginated timesheets
    paginatedTimesheets.forEach((timesheet, index) => {
        const row = document.createElement('tr');
        const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50';
        row.className = `border-b border-slate-200 transition-all ${rowBg} group`;
        
        const statusMap = {
            0: { text: typeof t !== 'undefined' ? t('timesheet.status0') : 'Trống', cls: 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-500/20', icon: 'fa-clock' },
            1: { text: typeof t !== 'undefined' ? t('timesheet.status1') : 'Đi làm', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20', icon: 'fa-check-circle' },
            2: { text: typeof t !== 'undefined' ? t('timesheet.status2') : 'Nghỉ', cls: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20', icon: 'fa-ban' },
            3: { text: typeof t !== 'undefined' ? t('timesheet.status3') : 'Xin nghỉ', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20', icon: 'fa-file-signature' },
            4: { text: typeof t !== 'undefined' ? t('timesheet.status4') : 'Di chuyển', cls: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20', icon: 'fa-truck-moving' },
            5: { text: typeof t !== 'undefined' ? t('timesheet.status5') : 'Làm visa', cls: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-500/20', icon: 'fa-passport' },
            6: { text: typeof t !== 'undefined' ? t('timesheet.status6') : 'Đào tạo', cls: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20', icon: 'fa-chalkboard-teacher' },
            7: { text: typeof t !== 'undefined' ? t('timesheet.status7') : 'Mở quyền hạn', cls: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-500/20', icon: 'fa-user-shield' }
        };
        const statusInfo = statusMap[timesheet.status] || statusMap[1];
        const statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.cls} border shadow-sm"><i class="fas ${statusInfo.icon} mr-1"></i>${statusInfo.text}</span>`;

        const absenceTypeText = timesheet.absenceType === null ? 'Đi làm bình thường' 
            : timesheet.absenceType === 0 ? (typeof t !== 'undefined' ? t('timesheet.absencePersonal') : 'Lý do cá nhân')
            : timesheet.absenceType === 1 ? (typeof t !== 'undefined' ? t('timesheet.absenceNonPersonal') : 'Không phải lý do cá nhân') : '';

        const absenceTypeBadge = timesheet.absenceType === null 
            ? '<span class="text-slate-400 text-sm">-</span>'
            : timesheet.absenceType === 0
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm">${typeof t !== 'undefined' ? t('timesheet.absencePersonalShort') : 'Cá nhân'}</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 shadow-sm">${typeof t !== 'undefined' ? t('timesheet.absenceNonPersonalShort') : 'Không cá nhân'}</span>`;

        const day = new Date(timesheet.day).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const workStart = timesheet.workStart ? formatTime(timesheet.workStart) : '-';
        const workEnd = timesheet.workEnd ? formatTime(timesheet.workEnd) : '-';

        row.innerHTML = `
            <td class="px-3 py-2.5">
                <input type="checkbox" class="timesheet-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
                    value="${timesheet.timesheetId}" onchange="updateTimesheetSelection()">
            </td>
            <td class="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap text-sm">#${timesheet.timesheetId}</td>
            <td class="px-3 py-2.5 whitespace-nowrap">
                <div class="font-medium text-slate-800 text-sm">${timesheet.employeeName || 'N/A'}</div>
            </td>
            <td class="px-3 py-2.5 text-slate-600 whitespace-nowrap text-sm">${day}</td>
            <td class="px-3 py-2.5 text-slate-600 whitespace-nowrap text-sm font-mono">${workStart}</td>
            <td class="px-3 py-2.5 text-slate-600 whitespace-nowrap text-sm font-mono">${workEnd}</td>
            <td class="px-3 py-2.5 whitespace-nowrap">${statusBadge}</td>
            <td class="px-3 py-2.5 whitespace-nowrap">${absenceTypeBadge}</td>
            <td class="px-3 py-2.5 text-slate-600 whitespace-nowrap text-sm">${timesheet.areaName || '-'}</td>
            <td class="px-3 py-2.5 text-slate-600 text-sm max-w-xs">
                <div class="truncate" title="${timesheet.notes || ''}" style="max-width: 200px;">
                    ${timesheet.notes || '-'}
                </div>
            </td>
            <td class="px-3 py-2.5 whitespace-nowrap sticky right-0 ${rowBg} group-hover:from-blue-50/80 group-hover:to-white/80 dark:group-hover:from-blue-900/40 dark:group-hover:to-slate-900/80 backdrop-blur-md z-10 border-l border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2">
                    <button onclick="editTimesheet(${timesheet.timesheetId})" 
                        class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20" title="${typeof t !== 'undefined' ? t('common.edit') : 'Sửa'}">
                        <i class="fas fa-pen-to-square text-xs"></i>
                    </button>
                    <button onclick="deleteTimesheet(${timesheet.timesheetId})" 
                        class="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all border border-rose-100 dark:border-rose-500/20" title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}">
                        <i class="fas fa-trash-can text-xs"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Render pagination
    renderTimesheetPagination(totalPages, total);
}

// Render pagination controls
function renderTimesheetPagination(totalPages, totalItems) {
    const paginationContainer = document.getElementById('timesheetPagination');
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.classList.add('hidden');
        return;
    }

    paginationContainer.classList.remove('hidden');
    
    const startItem = (currentTimesheetPage - 1) * TIMESHEETS_PER_PAGE + 1;
    const endItem = Math.min(currentTimesheetPage * TIMESHEETS_PER_PAGE, totalItems);
    
    let paginationHTML = `
        <div class="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
            <div class="text-sm text-slate-600">
                Hiển thị <span class="font-semibold">${startItem}</span> - <span class="font-semibold">${endItem}</span> trong tổng số <span class="font-semibold">${totalItems}</span> bảng công
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="goToTimesheetPage(${currentTimesheetPage - 1})" 
                    ${currentTimesheetPage === 1 ? 'disabled' : ''}
                    class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <i class="fas fa-chevron-left"></i>
                </button>
    `;

    // Show page numbers (max 5 pages visible)
    const maxVisiblePages = 5;
    let startPage, endPage;
    
    if (totalPages <= maxVisiblePages) {
        // Nếu tổng số trang <= 5, hiển thị tất cả
        startPage = 1;
        endPage = totalPages;
    } else {
        // Tính toán phạm vi hiển thị 5 trang xung quanh trang hiện tại
        const halfVisible = Math.floor(maxVisiblePages / 2);
        startPage = Math.max(1, currentTimesheetPage - halfVisible);
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Điều chỉnh nếu endPage quá gần cuối
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
    }

    // Hiển thị nút trang đầu nếu không nằm trong phạm vi hiển thị
    if (startPage > 1) {
        paginationHTML += `
            <button onclick="goToTimesheetPage(1)" 
                class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all">
                1
            </button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="px-2 text-slate-500">...</span>`;
        }
    }

    // Hiển thị các trang trong phạm vi
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="goToTimesheetPage(${i})" 
                ${i === currentTimesheetPage ? 'class="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg transition-all"' : 'class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"'}>
                ${i}
            </button>
        `;
    }

    // Hiển thị nút trang cuối nếu không nằm trong phạm vi hiển thị
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-2 text-slate-500">...</span>`;
        }
        paginationHTML += `
            <button onclick="goToTimesheetPage(${totalPages})" 
                class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all">
                ${totalPages}
            </button>
        `;
    }

    paginationHTML += `
                <button onclick="goToTimesheetPage(${currentTimesheetPage + 1})" 
                    ${currentTimesheetPage === totalPages ? 'disabled' : ''}
                    class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Go to specific page
function goToTimesheetPage(page) {
    if (page < 1 || page > Math.ceil(allTimesheets.length / TIMESHEETS_PER_PAGE)) {
        return;
    }
    currentTimesheetPage = page;
    displayTimesheets(allTimesheets);
    // Scroll to top of table
    const tableContainer = document.getElementById('timesheetManagementSection');
    if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Show create timesheet modal
function showCreateTimesheetModal() {
    document.getElementById('timesheetModalTitle').textContent = typeof t !== 'undefined' ? t('timesheet.add') : 'Thêm Bảng công';
    document.getElementById('timesheetForm').reset();
    document.getElementById('timesheetId').value = '';
    document.getElementById('modalStatus').value = '1';
    document.getElementById('timesheetModalError').classList.add('hidden');
    document.getElementById('timesheetModal').classList.remove('hidden');
    
    // Show employee search and hide employee display for create
    const employeeSelectContainer = document.getElementById('employeeSelectContainer');
    const employeeDisplayContainer = document.getElementById('employeeDisplayContainer');
    const hiddenInput = document.getElementById('modalEmployeeId');
    const searchInput = document.getElementById('modalEmployeeSearch');
    
    employeeSelectContainer.classList.remove('hidden');
    employeeDisplayContainer.classList.add('hidden');
    if (hiddenInput) {
        hiddenInput.disabled = false;
        hiddenInput.required = true;
    }
    if (searchInput) {
        searchInput.value = '';
        searchInput.disabled = false;
    }
    
    document.getElementById('modalDay').disabled = false;
    document.getElementById('modalDay').required = true;
    
    // Luôn hiển thị ghi chú; ẩn/hiện lý do nghỉ theo loại
    const notesContainer = document.getElementById('notesContainer');
    if (notesContainer) notesContainer.classList.remove('hidden');
    toggleAbsenceFields();
    
    loadEmployeesForTimesheet();
    loadAreasForTimesheet();
    
    // Set today as default date (local time)
    const today = new Date().toLocaleDateString('en-CA');
    document.getElementById('modalDay').value = today;
}

// Edit timesheet
async function editTimesheet(id) {
    try {
        const response = await fetch(`${TIMESHEET_API_BASE_URL}/${id}`);
        const timesheet = await response.json();
        
        document.getElementById('timesheetModalTitle').textContent = typeof t !== 'undefined' ? (t('common.edit') + ' ' + t('timesheet.title')) : 'Sửa Bảng công';
        document.getElementById('timesheetId').value = timesheet.timesheetId;
        
        // Hide employee search and show employee display when editing
        const employeeSelectContainer = document.getElementById('employeeSelectContainer');
        const employeeDisplayContainer = document.getElementById('employeeDisplayContainer');
        const employeeDisplay = document.getElementById('modalEmployeeDisplay');
        const hiddenInput = document.getElementById('modalEmployeeId');
        const searchInput = document.getElementById('modalEmployeeSearch');
        
        employeeSelectContainer.classList.add('hidden');
        employeeDisplayContainer.classList.remove('hidden');
        employeeDisplay.textContent = timesheet.employeeName || 'N/A';
        if (hiddenInput) {
            hiddenInput.value = timesheet.employeeId; // Keep value for form submission
            hiddenInput.required = false; // Remove required when editing (field is hidden)
        }
        if (searchInput) {
            searchInput.value = '';
        }
        
        document.getElementById('modalDay').value = timesheet.day;
        document.getElementById('modalDay').disabled = true; // Disable day selection when editing
        // Format time from "HH:mm:ss" to "HH:mm" for input type="time"
        if (timesheet.workStart) {
            const workStartTime = timesheet.workStart.split(':').slice(0, 2).join(':');
            document.getElementById('modalWorkStart').value = workStartTime;
        } else {
            document.getElementById('modalWorkStart').value = '';
        }
        if (timesheet.workEnd) {
            const workEndTime = timesheet.workEnd.split(':').slice(0, 2).join(':');
            document.getElementById('modalWorkEnd').value = workEndTime;
        } else {
            document.getElementById('modalWorkEnd').value = '';
        }
        document.getElementById('modalStatus').value = timesheet.status.toString();
        const absenceTypeValue = timesheet.absenceType !== null ? timesheet.absenceType.toString() : '';
        document.getElementById('modalAbsenceType').value = absenceTypeValue;
        document.getElementById('modalAbsenceReason').value = timesheet.absenceReason || '';
        document.getElementById('modalNotes').value = timesheet.notes || '';
        document.getElementById('modalTimesheetAreaId').value = timesheet.areaId || '';
        
        // Luôn hiển thị ghi chú; ẩn/hiện lý do nghỉ theo loại
        const notesContainer = document.getElementById('notesContainer');
        if (notesContainer) notesContainer.classList.remove('hidden');
        toggleAbsenceFields();
        
        document.getElementById('timesheetModalError').classList.add('hidden');
        document.getElementById('timesheetModal').classList.remove('hidden');
        loadEmployeesForTimesheet();
        loadAreasForTimesheet();
    } catch (error) {
        console.error('Error loading timesheet:', error);
        showToast('Lỗi khi tải thông tin bảng công', 'error');
    }
}

// Close timesheet modal
function closeTimesheetModal() {
    document.getElementById('timesheetModal').classList.add('hidden');
    document.getElementById('timesheetForm').reset();
    document.getElementById('timesheetModalError').classList.add('hidden');
    
    // Reset fields when closing
    const employeeSelectContainer = document.getElementById('employeeSelectContainer');
    const employeeDisplayContainer = document.getElementById('employeeDisplayContainer');
    const hiddenInput = document.getElementById('modalEmployeeId');
    const searchInput = document.getElementById('modalEmployeeSearch');
    const resultsContainer = document.getElementById('employeeSearchResults');
    
    if (employeeSelectContainer) employeeSelectContainer.classList.remove('hidden');
    if (employeeDisplayContainer) employeeDisplayContainer.classList.add('hidden');
    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.disabled = false;
        hiddenInput.required = true;
    }
    if (searchInput) {
        searchInput.value = '';
        searchInput.disabled = false;
    }
    if (resultsContainer) resultsContainer.classList.add('hidden');
    const dayInput = document.getElementById('modalDay');
    if (dayInput) {
        dayInput.disabled = false;
        dayInput.required = true;
    }
    
    // Hide absence reason and notes fields when closing
    toggleAbsenceFields();
}

// Submit timesheet form
document.getElementById('timesheetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('timesheetModalError');
    const timesheetId = document.getElementById('timesheetId').value;
    const employeeId = parseInt(document.getElementById('modalEmployeeId').value);
    const day = document.getElementById('modalDay').value;
    const workStartValue = document.getElementById('modalWorkStart').value;
    const workEndValue = document.getElementById('modalWorkEnd').value;
    // Convert time format from "HH:mm" to "HH:mm:ss" for TimeOnly, or keep as is if already has seconds
    const workStart = workStartValue && workStartValue.trim() !== '' 
        ? (workStartValue.split(':').length === 2 ? workStartValue + ':00' : workStartValue) 
        : null;
    const workEnd = workEndValue && workEndValue.trim() !== '' 
        ? (workEndValue.split(':').length === 2 ? workEndValue + ':00' : workEndValue) 
        : null;
    const status = parseInt(document.getElementById('modalStatus').value);
    const absenceType = document.getElementById('modalAbsenceType').value ? parseInt(document.getElementById('modalAbsenceType').value) : null;
    const absenceReason = document.getElementById('modalAbsenceReason').value || null;
    const notes = document.getElementById('modalNotes').value || null;
    const areaId = document.getElementById('modalTimesheetAreaId').value ? parseInt(document.getElementById('modalTimesheetAreaId').value) : null;
    
    // Calculate dayOfWeek from day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let dayOfWeek = null;
    if (day) {
        const date = new Date(day);
        dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert to 1-7 (Monday-Sunday)
    }

    // Only validate employeeId and day when creating (not editing)
    if (!timesheetId && (!employeeId || !day)) {
        const errorText = document.getElementById('timesheetModalErrorText') || errorDiv;
        if (errorText.id === 'timesheetModalErrorText') {
            errorText.textContent = typeof t !== 'undefined' ? t('timesheet.emptyEmployeeDate') : 'Nhân viên và ngày không được để trống';
        } else {
            errorText.textContent = typeof t !== 'undefined' ? t('timesheet.emptyEmployeeDate') : 'Nhân viên và ngày không được để trống';
        }
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        if (timesheetId) {
            // Update timesheet
            const response = await fetch(`${TIMESHEET_API_BASE_URL}/${timesheetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    dayOfWeek: dayOfWeek,
                    workStart: workStart,
                    workEnd: workEnd,
                    status, 
                    absenceType, 
                    absenceReason, 
                    notes, 
                    areaId 
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeTimesheetModal();
                loadTimesheets();
                showToast('Cập nhật bảng công thành công!', 'success');
            } else {
                const errorText = document.getElementById('timesheetModalErrorText') || errorDiv;
                if (errorText.id === 'timesheetModalErrorText') {
                    errorText.textContent = data.message || 'Cập nhật thất bại';
                } else {
                    errorText.textContent = data.message || 'Cập nhật thất bại';
                }
                errorDiv.classList.remove('hidden');
                showToast(data.message || 'Cập nhật thất bại', 'error');
            }
        } else {
            // Create timesheet
            const response = await fetch(TIMESHEET_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    employeeId, 
                    day, 
                    workStart: workStart || null,
                    workEnd: workEnd || null,
                    workTime: null, // Calculated automatically on server
                    status, 
                    absenceType, 
                    absenceReason, 
                    notes, 
                    areaId 
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeTimesheetModal();
                loadTimesheets();
                showToast('Tạo bảng công thành công!', 'success');
            } else {
                const errorText = document.getElementById('timesheetModalErrorText') || errorDiv;
                if (errorText.id === 'timesheetModalErrorText') {
                    errorText.textContent = data.message || 'Tạo bảng công thất bại';
                } else {
                    errorText.textContent = data.message || 'Tạo bảng công thất bại';
                }
                errorDiv.classList.remove('hidden');
                showToast(data.message || 'Tạo bảng công thất bại', 'error');
            }
        }
    } catch (error) {
        const errorText = document.getElementById('timesheetModalErrorText') || errorDiv;
        if (errorText.id === 'timesheetModalErrorText') {
            errorText.textContent = 'Lỗi kết nối đến server';
        } else {
            errorText.textContent = 'Lỗi kết nối đến server';
        }
        errorDiv.classList.remove('hidden');
        showToast('Lỗi kết nối đến server', 'error');
        console.error('Save timesheet error:', error);
    }
});

// Delete timesheet
async function deleteTimesheet(id) {
    const confirmed = await showConfirmDialog(typeof t !== 'undefined' ? t('timesheet.confirmDelete') : 'Bạn có chắc chắn muốn xóa bảng công này? Hành động này không thể hoàn tác!', 'danger');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${TIMESHEET_API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadTimesheets();
            showToast(typeof t !== 'undefined' ? t('message.deleteSuccess') : 'Xóa bảng công thành công', 'success');
        } else {
            showToast(data.message || (typeof t !== 'undefined' ? t('message.deleteFailed') : 'Xóa thất bại'), 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Lỗi khi xóa bảng công', 'error');
    }
}

// Toggle absence reason and notes fields based on absence type
function toggleAbsenceFields() {
    const absenceType = document.getElementById('modalAbsenceType');
    if (!absenceType) return;
    
    const absenceTypeValue = absenceType.value;
    const absenceReasonContainer = document.getElementById('absenceReasonContainer');
    const notesContainer = document.getElementById('notesContainer');
    
    // Notes luôn hiển thị để người dùng sửa ghi chú
    if (notesContainer) notesContainer.classList.remove('hidden');

    // Absence reason chỉ hiển thị khi có absenceType
    if (absenceTypeValue && absenceTypeValue !== '') {
        if (absenceReasonContainer) absenceReasonContainer.classList.remove('hidden');
    } else {
        if (absenceReasonContainer) absenceReasonContainer.classList.add('hidden');
        const absenceReason = document.getElementById('modalAbsenceReason');
        if (absenceReason) absenceReason.value = '';
    }
}

// Multi-select functions for timesheets
function toggleSelectAllTimesheets(checkbox) {
    const checkboxes = document.querySelectorAll('.timesheet-checkbox');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    updateTimesheetSelection();
}

function updateTimesheetSelection() {
    const checkboxes = document.querySelectorAll('.timesheet-checkbox:checked');
    const count = checkboxes.length;
    const bulkActions = document.getElementById('timesheetBulkActions');
    const selectedCount = document.getElementById('timesheetSelectedCount');
    
    if (count > 0) {
        bulkActions.classList.remove('hidden');
        selectedCount.textContent = `Đã chọn: ${count}`;
    } else {
        bulkActions.classList.add('hidden');
    }
    
    // Update select all checkbox
    const selectAll = document.getElementById('selectAllTimesheets');
    const allCheckboxes = document.querySelectorAll('.timesheet-checkbox');
    if (selectAll && allCheckboxes.length > 0) {
        selectAll.checked = allCheckboxes.length === checkboxes.length;
    }
}

async function deleteSelectedTimesheets() {
    const checkboxes = document.querySelectorAll('.timesheet-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showToast('Vui lòng chọn ít nhất một bảng công để xóa', 'warning');
        return;
    }
    
    const confirmed = await showConfirmDialog(
        typeof t !== 'undefined' ? t('timesheet.confirmDeleteSelected').replace('{count}', selectedIds.length) : `Bạn có chắc chắn muốn xóa ${selectedIds.length} bảng công đã chọn?`,
        typeof t !== 'undefined' ? t('timesheet.deleteConfirmTitle') : 'Xác nhận xóa bảng công'
    );
    if (!confirmed) {
        return;
    }
    
    try {
        // Delete each timesheet
        for (const id of selectedIds) {
            const response = await fetch(`/api/timesheet/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || (typeof t !== 'undefined' ? t('timesheet.deleteError') : 'Lỗi khi xóa bảng công'));
            }
        }
        
        showToast(`Đã xóa thành công ${selectedIds.length} bảng công`, 'success');
        loadTimesheets();
        updateTimesheetSelection();
    } catch (error) {
        console.error('Error deleting timesheets:', error);
        showToast(`Lỗi khi xóa bảng công: ${error.message}`, 'error');
    }
}
