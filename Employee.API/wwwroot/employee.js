// Employee Management JavaScript
const EMPLOYEE_API_BASE_URL = `${window.location.origin}/api/employee`;
const AREA_API_BASE_URL_FOR_EMPLOYEE = `${window.location.origin}/api/area`;
const PROJECT_API_BASE_URL_FOR_EMPLOYEE = `${window.location.origin}/api/project`;
const TIMESHEET_API_BASE_URL_FOR_EMPLOYEE = `${window.location.origin}/api/timesheet`;

let areas = [];
let allEmployees = []; // Lưu danh sách nhân viên gốc để filter
let projectsForEmployee = []; // Danh sách dự án để gợi ý
let allTimesheetsForEmployee = []; // Tất cả timesheets để tính toán stats
let employeeDateFilter = { startDate: null, endDate: null }; // Filter ngày cho employee stats

// Show employee management
function showEmployeeManagement(event) {
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
    if (employeeSection) employeeSection.classList.remove('hidden');
    if (timesheetSection) timesheetSection.classList.add('hidden');
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
    
    loadEmployees();
    loadAreasForEmployee();
    loadProjectsForEmployee();
    loadTimesheetsForEmployee();
}

// Load areas for dropdown
async function loadAreasForEmployee() {
    try {
        const response = await fetch(AREA_API_BASE_URL_FOR_EMPLOYEE);
        areas = await response.json();
        
        const select = document.getElementById('modalAreaId');
        if (select) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.setAttribute('data-i18n', 'employee.selectArea');
            defaultOption.textContent = t('employee.selectArea');
            select.innerHTML = '';
            select.appendChild(defaultOption);
            areas.forEach(area => {
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

// Load timesheets for calculating stats
async function loadTimesheetsForEmployee() {
    try {
        const response = await fetch(TIMESHEET_API_BASE_URL_FOR_EMPLOYEE);
        allTimesheetsForEmployee = await response.json();
        // Recalculate stats when timesheets are loaded
        if (allEmployees && allEmployees.length > 0) {
            filterEmployees();
        }
    } catch (error) {
        console.error('Error loading timesheets for employee stats:', error);
    }
}

// Apply date filter for employee stats
function applyEmployeeDateFilter() {
    const startDate = document.getElementById('employeeFilterStartDate')?.value;
    const endDate = document.getElementById('employeeFilterEndDate')?.value;
    
    employeeDateFilter.startDate = startDate || null;
    employeeDateFilter.endDate = endDate || null;
    
    // Recalculate and display employees with filtered stats
    filterEmployees();
}

// Clear date filter for employee stats
function clearEmployeeDateFilter() {
    document.getElementById('employeeFilterStartDate').value = '';
    document.getElementById('employeeFilterEndDate').value = '';
    employeeDateFilter.startDate = null;
    employeeDateFilter.endDate = null;
    filterEmployees();
}

// Calculate employee stats based on date filter
function calculateEmployeeStats(employeeId, useDetailFilter = false) {
    let timesheets = allTimesheetsForEmployee.filter(t => t.employeeId === employeeId);
    
    // Use detail filter if in detail modal, otherwise use employee list filter
    const dateFilter = useDetailFilter ? detailDateFilter : employeeDateFilter;
    
    // Apply date filter if exists
    if (dateFilter.startDate || dateFilter.endDate) {
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate + 'T00:00:00') : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate + 'T23:59:59') : null;
        
        timesheets = timesheets.filter(t => {
            if (!t.day) return false;
            const timesheetDate = new Date(t.day);
            if (startDate) {
                const compareDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const timesheetCompareDate = new Date(timesheetDate.getFullYear(), timesheetDate.getMonth(), timesheetDate.getDate());
                if (timesheetCompareDate < compareDate) return false;
            }
            if (endDate) {
                const compareDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                const timesheetCompareDate = new Date(timesheetDate.getFullYear(), timesheetDate.getMonth(), timesheetDate.getDate());
                if (timesheetCompareDate > compareDate) return false;
            }
            return true;
        });
    }
    
    // Calculate stats from timesheets
    const workDays = timesheets.filter(t => t.status === 1).length; // Đi làm (work_days)
    const travelDays = timesheets.filter(t => t.status === 4).length; // Di chuyển (travel_days)
    const leaveDays = timesheets.filter(t => t.status === 2).length; // Nghỉ ngơi (leave_days)
    const unauthorizedLeave = timesheets.filter(t => t.status === 3).length; // Xin nghỉ (unauthorized_leave - status = 3)
    const totalDays = timesheets.length;
    
    // Calculate night shift days (workStart >= 20:00 or workEnd <= 8:00)
    let nightShiftDays = 0;
    timesheets.forEach(t => {
        if (t.workStart && t.workEnd) {
            const startHour = parseInt(t.workStart.split(':')[0]);
            const endHour = parseInt(t.workEnd.split(':')[0]);
            if (startHour >= 20 || endHour <= 8) {
                nightShiftDays++;
            }
        }
    });
    
    return { 
        workDays,          // work_days (status = 1)
        travelDays,        // travel_days (status = 4)
        leaveDays,         // leave_days (status = 2) - Nghỉ ngơi
        unauthorizedLeave, // unauthorized_leave (status = 3) - Xin nghỉ
        nightShiftDays,   // night_shift_days
        totalDays 
    };
}

// Load employees
async function loadEmployees() {
    try {
        const response = await fetch(EMPLOYEE_API_BASE_URL);
        const employees = await response.json();
        allEmployees = employees; // Lưu danh sách gốc
        
        // Giữ lại filter hiện tại (search term và date filter)
        // filterEmployees() sẽ tự động áp dụng lại search term từ input
        // Date filter đã được lưu trong employeeDateFilter và sẽ được áp dụng trong displayEmployees
        filterEmployees(); // Hiển thị với filter hiện tại
    } catch (error) {
        console.error('Error loading employees:', error);
        showToast(t('message.error'), 'error');
    }
}

// Filter employees based on search
function filterEmployees() {
    // Kiểm tra nếu allEmployees chưa được load
    if (!allEmployees || allEmployees.length === 0) {
        return;
    }
    
    const searchInput = document.getElementById('searchEmployee');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    if (!searchTerm) {
        displayEmployees(allEmployees);
        return;
    }
    
    const filtered = allEmployees.filter(employee => {
        const fullname = (employee.fullname || '').toLowerCase();
        const fullnameOther = (employee.fullnameOther || '').toLowerCase();
        const employeeId = employee.employeeId.toString();
        const areaName = (employee.areaName || '').toLowerCase();
        const projectCodesText = (employee.projectCodes || []).join(', ').toLowerCase();
        const sale = (employee.sale || '').toLowerCase();
        
        return fullname.includes(searchTerm) ||
               fullnameOther.includes(searchTerm) ||
               employeeId.includes(searchTerm) ||
               areaName.includes(searchTerm) ||
               projectCodesText.includes(searchTerm) ||
               sale.includes(searchTerm);
    });
    
    displayEmployees(filtered);
}

// Clear employee search
function clearEmployeeSearch() {
    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
        searchInput.value = '';
        filterEmployees();
    }
}

// Display employees in table
function displayEmployees(employees) {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';


    if (employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p>Chưa có nhân viên nào</p>
                </td>
            </tr>
        `;
        return;
    }

    employees.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
        
        const typeBadge = employee.type === 1 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"><i class="fas fa-flag mr-1.5 text-[10px]"></i>VN</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"><i class="fas fa-flag mr-1.5 text-[10px]"></i>TQ</span>';

        const statusBadge = employee.active === 1 
            ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"><i class="fas fa-check-circle mr-1.5 text-[10px]"></i>${typeof t !== 'undefined' ? t('user.activeStatus') : 'Hoạt động'}</span>`
            : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium"><i class="fas fa-ban mr-1.5 text-[10px]"></i>${typeof t !== 'undefined' ? t('user.inactiveStatus') : 'Không hoạt động'}</span>`;

        const displayName = employee.fullname || employee.fullnameOther || 'N/A';

        // Calculate stats based on date filter
        const stats = calculateEmployeeStats(employee.employeeId);

        row.innerHTML = `
            <td class="px-3 py-2.5">
                <input type="checkbox" class="employee-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
                    value="${employee.employeeId}" onchange="updateEmployeeSelection()">
            </td>
            <td class="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap text-sm">#${employee.employeeId}</td>
            <td class="px-3 py-2.5 text-sm">
                <div class="flex items-center space-x-2">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        ${displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors employee-name-link" data-employee-id="${employee.employeeId}">${displayName}</div>
                        ${employee.fullnameOther ? `<div class="text-xs text-slate-500">${employee.fullnameOther}</div>` : ''}
                    </div>
                </div>
            </td>
            <td class="px-3 py-2.5 text-sm">${typeBadge}</td>
            <td class="px-3 py-2.5 text-slate-600 text-sm">${employee.areaName || 'N/A'}</td>
            <td class="px-3 py-2.5 font-semibold text-blue-600 text-sm">${stats.workDays}</td>
            <td class="px-3 py-2.5 font-semibold text-orange-600 text-sm">${stats.leaveDays}</td>
            <td class="px-3 py-2.5 font-semibold text-slate-800 text-sm">${stats.totalDays}</td>
            <td class="px-3 py-2.5 whitespace-nowrap text-sm">
                ${(() => {
                    const projectCodes = employee.projectCodes || [];
                    if (projectCodes.length > 0) {
                        return `<span class="font-semibold text-purple-600">${projectCodes.join(', ')}</span>`;
                    }
                    return '<span class="text-slate-400">-</span>';
                })()}
            </td>
            <td class="px-3 py-2.5 text-sm">${statusBadge}</td>
            <td class="px-4 py-3 text-sm">
                <div class="flex items-center gap-2">
                    <button onclick="editEmployee(${employee.employeeId})" 
                        class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20" title="${typeof t !== 'undefined' ? t('common.edit') : 'Sửa'}">
                        <i class="fas fa-pen-to-square text-xs"></i>
                    </button>
                    <button onclick="deleteEmployee(${employee.employeeId})" 
                        class="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all border border-rose-100 dark:border-rose-500/20" title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}">
                        <i class="fas fa-trash-can text-xs"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
        
        // Add click event to employee name
        const nameLink = row.querySelector('.employee-name-link');
        if (nameLink) {
            nameLink.addEventListener('click', function() {
                const employeeId = parseInt(this.getAttribute('data-employee-id'));
                showEmployeeDetail(employeeId);
            });
        }
    });
}

// Show create employee modal
function showCreateEmployeeModal() {
    const modalTitle = document.getElementById('employeeModalTitle');
    const employeeForm = document.getElementById('employeeForm');
    const employeeModal = document.getElementById('employeeModal');
    
    if (!modalTitle || !employeeForm || !employeeModal) {
        console.error('Employee modal elements not found');
        return;
    }
    
    modalTitle.textContent = t('employee.add');
    employeeForm.reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('modalType').value = '1';
    document.getElementById('modalEmployeeActive').value = '1';
    // Set default values for number fields
    document.getElementById('modalTravelDays').value = '0';
    document.getElementById('modalVisaExtension').value = '0';
    document.getElementById('modalPermissionGranted').value = '0';
    document.getElementById('modalTrainingDays').value = '0';
    document.getElementById('modalSkillLv').value = '0';
    document.getElementById('modalSkillNote').value = '';
    document.getElementById('modalTimeTest').value = '';
    const errorDiv = document.getElementById('employeeModalError');
    if (errorDiv) errorDiv.classList.add('hidden');
    employeeModal.classList.remove('hidden');
    loadAreasForEmployee();
    
    // Initialize month input
    const monthInput = document.getElementById('modalProjectMonth');
    if (monthInput) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        monthInput.value = currentMonth;
    }

    // Load projects and reset project multi-select
    loadProjectsForEmployee().then(() => {
        setupProjectSearch([]);
    });
}

// Edit employee
async function editEmployee(id) {
    try {
        const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${id}`);
        const employee = await response.json();
        
        const modalTitle = document.getElementById('employeeModalTitle');
        const employeeModal = document.getElementById('employeeModal');
        
        if (!modalTitle || !employeeModal) {
            console.error('Employee modal elements not found');
            return;
        }
        
        modalTitle.textContent = t('common.edit') + ' ' + t('employee.title');
        document.getElementById('employeeId').value = employee.employeeId;
        document.getElementById('modalFullname').value = employee.fullname || '';
        document.getElementById('modalFullnameOther').value = employee.fullnameOther || '';
        document.getElementById('modalType').value = employee.type.toString();
        document.getElementById('modalSale').value = employee.sale || '';
        document.getElementById('modalPlantName').value = employee.plantName || '';
        document.getElementById('modalSkillLv').value = employee.skillLv || 0;
        document.getElementById('modalSkillNote').value = employee.skillNote || '';
        if (employee.timeTest) {
            const date = new Date(employee.timeTest);
            const formattedDate = date.toISOString().split('T')[0];
            document.getElementById('modalTimeTest').value = formattedDate;
        } else {
            document.getElementById('modalTimeTest').value = '';
        }
        document.getElementById('modalTravelDays').value = employee.travelDays || 0;
        document.getElementById('modalVisaExtension').value = employee.visaExtension || 0;
        document.getElementById('modalPermissionGranted').value = employee.permissionGranted || 0;
        document.getElementById('modalTrainingDays').value = employee.trainingDays || 0;
        document.getElementById('modalEmployeeActive').value = employee.active.toString();
        const errorDiv = document.getElementById('employeeModalError');
        if (errorDiv) errorDiv.classList.add('hidden');
        employeeModal.classList.remove('hidden');
        
        // Load areas first, then set the selected value
        await loadAreasForEmployee();
        document.getElementById('modalAreaId').value = employee.areaId || '';
        
        // Initialize month input to current month if empty
        const monthInput = document.getElementById('modalProjectMonth');
        if (monthInput && !monthInput.value) {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            monthInput.value = currentMonth;
        }

        // Load projects for the selected month
        await loadEmployeeProjectsForMonth();
    } catch (error) {
        console.error('Error loading employee:', error);
        showToast(t('message.error'), 'error');
    }
}

// Load employee projects for a specific month (Edit Modal)
async function loadEmployeeProjectsForMonth() {
    const employeeId = document.getElementById('employeeId').value;
    const month = document.getElementById('modalProjectMonth').value;
    
    if (!employeeId || !month) {
        // For new employee or no month selected, just load projects and reset UI
        await loadProjectsForEmployee();
        setupProjectSearch([]);
        return;
    }

    try {
        const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${employeeId}/projects/month/${month}`);
        const projects = await response.json();
        const projectCodes = projects.map(p => p.projectCode);
        
        await loadProjectsForEmployee();
        setupProjectSearch(projectCodes);
    } catch (error) {
        console.error('Error loading projects for month:', error);
    }
}

// Close employee modal
function closeEmployeeModal() {
    const employeeModal = document.getElementById('employeeModal');
    const employeeForm = document.getElementById('employeeForm');
    const errorDiv = document.getElementById('employeeModalError');
    
    if (employeeModal) employeeModal.classList.add('hidden');
    if (employeeForm) employeeForm.reset();
    if (errorDiv) errorDiv.classList.add('hidden');
}

// Submit employee form
document.getElementById('employeeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('employeeModalError');
    const employeeId = document.getElementById('employeeId').value;
    const fullname = document.getElementById('modalFullname').value;
    const fullnameOther = document.getElementById('modalFullnameOther').value;
    const type = parseInt(document.getElementById('modalType').value);
    const projectCodes = getSelectedProjectCodes();
    const sale = document.getElementById('modalSale').value;
    const plantName = document.getElementById('modalPlantName').value;
    const travelDays = parseInt(document.getElementById('modalTravelDays').value) || 0;
    const visaExtension = parseInt(document.getElementById('modalVisaExtension').value) || 0;
    const permissionGranted = parseInt(document.getElementById('modalPermissionGranted').value) || 0;
    const trainingDays = parseInt(document.getElementById('modalTrainingDays').value) || 0;
    const skillLv = parseInt(document.getElementById('modalSkillLv').value) || 0;
    const skillNote = document.getElementById('modalSkillNote').value;
    const timeTest = document.getElementById('modalTimeTest').value || null;
    const areaId = document.getElementById('modalAreaId').value ? parseInt(document.getElementById('modalAreaId').value) : null;
    const active = parseInt(document.getElementById('modalEmployeeActive').value);

    if (!fullname && !fullnameOther) {
        const errorText = document.getElementById('employeeModalErrorText') || errorDiv;
        if (errorText.id === 'employeeModalErrorText') {
            errorText.textContent = t('message.emptyName');
        } else {
            errorText.textContent = t('message.emptyName');
        }
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        const month = document.getElementById('modalProjectMonth').value;
        const monthQuery = month ? `?month=${month}` : '';
        
        if (employeeId) {
            // Update employee
            const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${employeeId}${monthQuery}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    fullname, 
                    fullnameOther, 
                    type, 
                    projectCodes, 
                    sale, 
                    plantName,
                    travelDays,
                    visaExtension,
                    permissionGranted,
                    trainingDays,
                    skillLv,
                    skillNote,
                    timeTest,
                    areaId, 
                    active 
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeEmployeeModal();
                loadEmployees();
                showToast(t('message.updateSuccess'), 'success');
            } else {
                const errorText = document.getElementById('employeeModalErrorText') || errorDiv;
                if (errorText.id === 'employeeModalErrorText') {
                    errorText.textContent = data.message || t('message.updateFailed');
                } else {
                    errorText.textContent = data.message || t('message.updateFailed');
                }
                errorDiv.classList.remove('hidden');
                showToast(data.message || t('message.updateFailed'), 'error');
            }
        } else {
            // Create employee
            const response = await fetch(EMPLOYEE_API_BASE_URL + monthQuery, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    fullname, 
                    fullnameOther, 
                    type, 
                    projectCodes, 
                    sale, 
                    plantName,
                    travelDays,
                    visaExtension,
                    permissionGranted,
                    trainingDays,
                    skillLv,
                    skillNote,
                    timeTest,
                    areaId, 
                    active 
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeEmployeeModal();
                loadEmployees();
                showToast(t('message.createSuccess'), 'success');
            } else {
                const errorText = document.getElementById('employeeModalErrorText') || errorDiv;
                if (errorText.id === 'employeeModalErrorText') {
                    errorText.textContent = data.message || t('message.createFailed');
                } else {
                    errorText.textContent = data.message || t('message.createFailed');
                }
                errorDiv.classList.remove('hidden');
                showToast(data.message || t('message.createFailed'), 'error');
            }
        }
    } catch (error) {
        const errorText = document.getElementById('employeeModalErrorText') || errorDiv;
        if (errorText.id === 'employeeModalErrorText') {
            errorText.textContent = t('message.connectionError');
        } else {
            errorText.textContent = t('message.connectionError');
        }
        errorDiv.classList.remove('hidden');
        showToast(t('message.connectionError'), 'error');
        console.error('Save employee error:', error);
    }
});


// Delete employee
async function deleteEmployee(id) {
    const confirmed = await showConfirmDialog('Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác!', 'danger');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadEmployees();
            showToast(t('message.deleteSuccess'), 'success');
        } else {
            showToast(data.message || t('message.error'), 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast(t('message.error'), 'error');
    }
}

// Show employee detail modal
let currentDetailEmployeeId = null;
let detailDateFilter = { startDate: null, endDate: null };

async function showEmployeeDetail(id) {
    try {
        currentDetailEmployeeId = id;
        const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${id}`);
        const employee = await response.json();
        
        // Reset date filter when opening detail
        detailDateFilter = { startDate: null, endDate: null };
        const detailStartDateInput = document.getElementById('detailFilterStartDate');
        const detailEndDateInput = document.getElementById('detailFilterEndDate');
        if (detailStartDateInput) detailStartDateInput.value = '';
        if (detailEndDateInput) detailEndDateInput.value = '';
        
        // Populate detail modal
        document.getElementById('detailFullname').textContent = employee.fullname || '-';
        document.getElementById('detailFullnameOther').textContent = employee.fullnameOther || '-';
        document.getElementById('detailType').textContent = employee.type === 1 ? t('employee.typeVN') + ' (VN)' : t('employee.typeTQ') + ' (TQ)';
        document.getElementById('detailPlantName').textContent = employee.plantName || '-';
        document.getElementById('detailSale').textContent = employee.sale || '-';
        
        // Display project codes
        const projectCodes = employee.projectCodes || [];
        document.getElementById('detailProjectCodes').textContent = projectCodes.length > 0 ? projectCodes.join(', ') : '-';
        
        // Display work time
        const workTime = employee.totalWorkTime ?? employee.TotalWorkTime;
        document.getElementById('detailWorkTime').textContent = workTime != null && workTime !== undefined 
            ? `${Number(workTime).toFixed(2)}h` 
            : '-';
        
        // Initialize project month and load projects for current month
        const monthInput = document.getElementById('detailProjectMonth');
        if (monthInput) {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            monthInput.value = currentMonth;
        }
        
        // Clear assignment info section
        const assignmentInfo = document.getElementById('detailAssignmentInfo');
        if (assignmentInfo) assignmentInfo.classList.add('hidden');

        refreshEmployeeDetailProject();

        // Save skill info globally to be displayed when "Detail" is clicked in project table
        window.currentEmployeeSkillInfo = {
            skillLv: employee.skillLv || 0,
            skillNote: employee.skillNote || '-',
            timeTest: employee.timeTest ? new Date(employee.timeTest).toLocaleDateString('vi-VN') : '-'
        };

        // Calculate and display stats based on date filter (from timesheets)
        updateDetailStats();
        
        // Display values from employee table (not affected by date filter)
        document.getElementById('detailVisaExtension').textContent = employee.visaExtension || 0;
        document.getElementById('detailPermissionGranted').textContent = employee.permissionGranted || 0;
        document.getElementById('detailTrainingDays').textContent = employee.trainingDays || 0;
        
        // Show modal
        document.getElementById('employeeDetailModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading employee detail:', error);
        showToast(t('message.error'), 'error');
    }
}

// Refresh employee detail project based on selected month
async function refreshEmployeeDetailProject() {
    const month = document.getElementById('detailProjectMonth').value;
    if (!currentDetailEmployeeId || !month) return;

    try {
        const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${currentDetailEmployeeId}?month=${month}`);
        const employee = await response.json();
        
        const tbody = document.getElementById('detailProjectTableBody');
        const emptyDiv = document.getElementById('detailProjectEmpty');
        const projects = employee.projectCodes || [];

        if (tbody) {
            tbody.innerHTML = '';
            if (projects.length > 0) {
                projects.forEach(code => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <i class="fas fa-diagram-project text-xs"></i>
                                </div>
                                ${code}
                            </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="showAssignmentDetail()" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold text-xs transition-all">
                                <span>${t('common.detail')}</span>
                                <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                if (emptyDiv) emptyDiv.classList.add('hidden');
            } else {
                if (emptyDiv) emptyDiv.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error refreshing employee detail project:', error);
    }
}

// Show assignment detail (using global skill info for now)
function showAssignmentDetail() {
    const info = window.currentEmployeeSkillInfo || { skillLv: '-', skillNote: '-', timeTest: '-' };
    const detailSkillLv = document.getElementById('detailSkillLv');
    const detailSkillNote = document.getElementById('detailSkillNote');
    const detailTimeTest = document.getElementById('detailTimeTest');
    const assignmentInfo = document.getElementById('detailAssignmentInfo');

    if (detailSkillLv) detailSkillLv.textContent = info.skillLv;
    if (detailSkillNote) detailSkillNote.textContent = info.skillNote;
    if (detailTimeTest) detailTimeTest.textContent = info.timeTest;
    
    if (assignmentInfo) {
        assignmentInfo.classList.remove('hidden');
        assignmentInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Update detail stats based on date filter
function updateDetailStats() {
    if (!currentDetailEmployeeId) return;
    
    const stats = calculateEmployeeStats(currentDetailEmployeeId, true);
    
    // Stats calculated from timesheets (affected by date filter)
    document.getElementById('detailWorkDays').textContent = stats.workDays; // Số ngày đi làm
    document.getElementById('detailTravelDays').textContent = stats.travelDays; // Số ngày di chuyển
    document.getElementById('detailLeaveDays').textContent = stats.leaveDays; // Nghỉ ngơi (leave_days)
    document.getElementById('detailUnauthorizedLeave').textContent = stats.unauthorizedLeave; // Xin nghỉ (unauthorized_leave)
    document.getElementById('detailNightShiftDays').textContent = stats.nightShiftDays; // Ca đêm
    document.getElementById('detailTotalDays').textContent = stats.totalDays; // Tổng ngày
}

// Apply date filter for detail modal
function applyDetailDateFilter() {
    const startDate = document.getElementById('detailFilterStartDate')?.value;
    const endDate = document.getElementById('detailFilterEndDate')?.value;
    
    detailDateFilter.startDate = startDate || null;
    detailDateFilter.endDate = endDate || null;
    
    updateDetailStats();
}

// Clear date filter for detail modal
function clearDetailDateFilter() {
    const detailStartDateInput = document.getElementById('detailFilterStartDate');
    const detailEndDateInput = document.getElementById('detailFilterEndDate');
    if (detailStartDateInput) detailStartDateInput.value = '';
    if (detailEndDateInput) detailEndDateInput.value = '';
    detailDateFilter.startDate = null;
    detailDateFilter.endDate = null;
    updateDetailStats();
}

// Close employee detail modal
function closeEmployeeDetailModal() {
    document.getElementById('employeeDetailModal').classList.add('hidden');
}

// Multi-select functions for employees
function toggleSelectAllEmployees(checkbox) {
    const checkboxes = document.querySelectorAll('.employee-checkbox');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    updateEmployeeSelection();
}

function updateEmployeeSelection() {
    const checkboxes = document.querySelectorAll('.employee-checkbox:checked');
    const count = checkboxes.length;
    const bulkActions = document.getElementById('employeeBulkActions');
    const selectedCount = document.getElementById('employeeSelectedCount');
    
    if (count > 0) {
        bulkActions.classList.remove('hidden');
        selectedCount.textContent = `${t('common.selected')}: ${count}`;
    } else {
        bulkActions.classList.add('hidden');
    }
    
    // Update select all checkbox
    const selectAll = document.getElementById('selectAllEmployees');
    const allCheckboxes = document.querySelectorAll('.employee-checkbox');
    if (selectAll && allCheckboxes.length > 0) {
        selectAll.checked = allCheckboxes.length === checkboxes.length;
    }
}

async function deleteSelectedEmployees() {
    const checkboxes = document.querySelectorAll('.employee-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showToast('Vui lòng chọn ít nhất một nhân viên để xóa', 'warning');
        return;
    }
    
    const confirmed = await showConfirmDialog(
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn?`,
        'Xác nhận xóa nhân viên'
    );
    if (!confirmed) {
        return;
    }
    
    try {
        // Delete each employee
        for (const id of selectedIds) {
            const response = await fetch(`/api/employee/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Lỗi khi xóa nhân viên');
            }
        }
        
        showToast(`Đã xóa thành công ${selectedIds.length} nhân viên`, 'success');
        loadEmployees();
        updateEmployeeSelection();
    } catch (error) {
        console.error('Error deleting employees:', error);
        showToast(`Lỗi khi xóa nhân viên: ${error.message}`, 'error');
    }
}

// Refresh employee stats (recalculate all)
async function refreshEmployeeStats() {
    try {
        if (typeof showToast === 'function') {
            showToast('Đang tính toán lại bảng công...', 'info');
        }
        
        const response = await fetch(`${EMPLOYEE_API_BASE_URL}/recalculate-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            let errorMessage = 'Lỗi khi tính toán lại bảng công';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
            }
            if (typeof showToast === 'function') {
                showToast(errorMessage, 'error');
            }
            return;
        }
        
        const data = await response.json();
        
        if (typeof showToast === 'function') {
            showToast(data.message || 'Đã tính toán lại bảng công thành công!', 'success');
        }
        // Reload employees to show updated stats
        await loadEmployees();
        // Reload timesheets for employee stats calculation
        await loadTimesheetsForEmployee();
    } catch (error) {
        console.error('Error refreshing employee stats:', error);
        if (typeof showToast === 'function') {
            showToast('Lỗi khi tính toán lại bảng công', 'error');
        }
    }
}

// Load projects for dropdown (multi-select)
async function loadProjectsForEmployee() {
    try {
        const response = await fetch(PROJECT_API_BASE_URL_FOR_EMPLOYEE);
        projectsForEmployee = await response.json();
    } catch (error) {
        console.error('Error loading projects for employee:', error);
    }
}

// Helpers for project multi-select in employee modal
function renderProjectTags(selectedCodes) {
    const tagsContainer = document.getElementById('modalProjectTags');
    const placeholder = document.getElementById('modalProjectPlaceholder');
    if (!tagsContainer) return;
    
    // Clear existing tags but keep placeholder if it exists
    const existingTags = tagsContainer.querySelectorAll('.project-tag');
    existingTags.forEach(tag => tag.remove());

    if (!selectedCodes || selectedCodes.length === 0) {
        // Show placeholder if no tags
        if (placeholder) {
            placeholder.style.display = 'inline';
        } else {
            const placeholderEl = document.createElement('span');
            placeholderEl.id = 'modalProjectPlaceholder';
            placeholderEl.className = 'text-slate-400 text-sm';
            placeholderEl.textContent = 'Chưa chọn dự án';
            tagsContainer.appendChild(placeholderEl);
        }
        return;
    }

    // Hide placeholder when tags exist
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    selectedCodes.forEach(code => {
        const tag = document.createElement('span');
        tag.className = 'project-tag inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium mr-2 mb-1';
        tag.setAttribute('data-code', code);
        tag.innerHTML = `
            <span class="mr-2">${code}</span>
            <button type="button" class="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none" data-remove-project="${code}">
                <i class="fas fa-times text-xs"></i>
            </button>
        `;
        tagsContainer.appendChild(tag);
    });

    // Attach remove handlers
    tagsContainer.querySelectorAll('button[data-remove-project]').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-remove-project');
            removeSelectedProjectCode(code);
        });
    });
}

function getSelectedProjectCodes() {
    const tagsContainer = document.getElementById('modalProjectTags');
    if (!tagsContainer) return [];
    return Array.from(tagsContainer.querySelectorAll('.project-tag')).map(tag => tag.getAttribute('data-code')).filter(Boolean);
}

function addSelectedProjectCode(code) {
    if (!code) return;
    const current = getSelectedProjectCodes();
    if (!current.includes(code)) {
        current.push(code);
        renderProjectTags(current);
    }
}

function removeSelectedProjectCode(code) {
    const current = getSelectedProjectCodes().filter(c => c !== code);
    renderProjectTags(current);
}

function setupProjectSearch(initialCodes = []) {
    const searchInput = document.getElementById('modalProjectSearch');
    const resultsContainer = document.getElementById('modalProjectSearchResults');
    if (!searchInput || !resultsContainer) return;

    renderProjectTags(initialCodes);
    searchInput.value = '';
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('hidden');

    searchInput.oninput = function () {
        const term = searchInput.value.trim().toLowerCase();
        if (!term) {
            resultsContainer.classList.add('hidden');
            resultsContainer.innerHTML = '';
            return;
        }

        const filtered = projectsForEmployee.filter(p =>
            p.projectCode.toLowerCase().includes(term) ||
            (p.projectName || '').toLowerCase().includes(term)
        ).slice(0, 20);

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<div class="px-4 py-2 text-sm text-slate-500">Không tìm thấy dự án</div>';
            resultsContainer.classList.remove('hidden');
            return;
        }

        resultsContainer.innerHTML = filtered.map(p => `
            <div class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-slate-100 project-search-item"
                 data-code="${p.projectCode}">
                <div class="font-semibold text-slate-800">${p.projectCode}</div>
                <div class="text-xs text-slate-500">${p.projectName || ''}</div>
            </div>
        `).join('');

        resultsContainer.querySelectorAll('.project-search-item').forEach(item => {
            item.addEventListener('click', () => {
                const code = item.getAttribute('data-code');
                addSelectedProjectCode(code);
                searchInput.value = '';
                resultsContainer.classList.add('hidden');
            });
        });

        resultsContainer.classList.remove('hidden');
    };
}

