// Auto-detect API base URL
const DASHBOARD_API_URL = `${window.location.origin}/api/dashboard`;

// Load dashboard data
// Load dashboard data
async function loadDashboard(date = null) {
    try {
        let url = DASHBOARD_API_URL;
        if (date) {
            url += `?day=${date}`;
        } else {
            const dateInput = document.getElementById('dailyAttendanceDate');
            if (dateInput && dateInput.value) {
                url += `?day=${dateInput.value}`;
            }
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        const data = await response.json();
        displayDashboard(data);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast(typeof t !== 'undefined' ? t('dashboard.loadError') : 'Lỗi khi tải dữ liệu dashboard', 'error');
    }
}

// Refresh both dashboard and daily attendance when date changes
function refreshDashboardWithDate() {
    const dateInput = document.getElementById('dailyAttendanceDate');
    if (dateInput && dateInput.value) {
        loadDashboard(dateInput.value);
        if (typeof loadDailyAttendance === 'function') {
            loadDailyAttendance();
        }
    }
}

// Display dashboard data
function displayDashboard(data) {
    const noDataText = typeof t !== 'undefined' ? t('dashboard.noData') : 'Chưa có dữ liệu';



    // Today Attendance Stats
    const todayAttendance = data.todayAttendance || {};
    document.getElementById('dashboardTotalWorking').textContent = todayAttendance.totalWorking || 0;
    document.getElementById('dashboardDayShift').textContent = todayAttendance.totalDayShift || 0;
    document.getElementById('dashboardNightShift').textContent = todayAttendance.totalNightShift || 0;

    // Display all employees working today has been removed per user request

    // Display attendance by project
    const attendanceByProjectBody = document.getElementById('attendanceByProjectBody');
    attendanceByProjectBody.innerHTML = '';
    const attendanceByProject = data.todayAttendanceByProject || [];
    
    if (attendanceByProject.length === 0) {
        attendanceByProjectBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p>${noDataText}</p>
                </td>
            </tr>
        `;
    } else {
        attendanceByProject.forEach((project, index) => {
            const row = document.createElement('tr');
            row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
            
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="font-semibold text-slate-800">${project.projectName}</div>
                    <div class="text-xs text-slate-500">${project.projectCode}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shadow-sm">
                        ${project.dayShiftCount}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        ${project.nightShiftCount}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                        ${project.totalCount}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="viewProjectDetail(${project.projectId})" 
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20 font-bold text-xs shadow-sm">
                        <i class="fas fa-eye text-[10px]"></i>${typeof t !== 'undefined' ? t('employee.detail') : 'Chi tiết'}
                    </button>
                </td>
            `;
            attendanceByProjectBody.appendChild(row);
        });
    }

    // Display absence by project
    const absenceByProjectBody = document.getElementById('absenceByProjectBody');
    absenceByProjectBody.innerHTML = '';
    const absenceByProject = data.todayAbsenceByProject || [];
    
    if (absenceByProject.length === 0) {
        absenceByProjectBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p>${noDataText}</p>
                </td>
            </tr>
        `;
    } else {
        absenceByProject.forEach((project, index) => {
            const row = document.createElement('tr');
            row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
            
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="font-semibold text-slate-800">${project.projectName}</div>
                    <div class="text-xs text-slate-500">${project.projectCode}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shadow-sm">
                        ${project.dayShiftCount}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        ${project.nightShiftCount}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm">
                        ${project.totalCount}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="viewProjectAbsentDetail(${project.projectId})" 
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20 font-bold text-xs shadow-sm">
                        <i class="fas fa-eye text-[10px]"></i>${typeof t !== 'undefined' ? t('employee.detail') : 'Chi tiết'}
                    </button>
                </td>
            `;
            absenceByProjectBody.appendChild(row);
        });
    }
}

// Helper functions
function viewEmployeeDetail(employeeId) {
    // Navigate to employee detail or show modal
    if (typeof showEmployeeDetail === 'function') {
        showEmployeeDetail(employeeId);
    } else {
        showToast('Chức năng xem chi tiết nhân viên', 'info');
    }
}

// Close project employees modal (make it available globally)
function closeProjectEmployeesModal() {
    const modal = document.getElementById('projectEmployeesModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Close employee detail modal (make it available globally)
function closeEmployeeDetailModal() {
    const modal = document.getElementById('employeeDetailModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// View project employees who worked today
async function viewProjectDetail(projectId) {
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Get project info
        const projectResponse = await fetch(`${window.location.origin}/api/project/${projectId}`);
        const project = await projectResponse.json();
        
        // Get employees who worked today in this project
        const employeesResponse = await fetch(`${window.location.origin}/api/project/${projectId}/employees/date/${todayStr}`);
        const employees = await employeesResponse.json();
        
        // Set modal title
        document.getElementById('projectEmployeesModalTitle').textContent = 
            `${project.projectName} (${project.projectCode}) - ${employees.length} nhân viên đi làm hôm nay`;
        
        // Display employees
        const tbody = document.getElementById('projectEmployeesTableBody');
        tbody.innerHTML = '';
        
        if (employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                        <i class="fas fa-inbox text-4xl mb-4 block"></i>
                        <p>Không có nhân viên nào đi làm hôm nay trong dự án này</p>
                    </td>
                </tr>
            `;
        } else {
            employees.forEach((employee, index) => {
                const row = document.createElement('tr');
                row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
                
                const displayName = employee.fullname || employee.fullnameOther || 'N/A';
                const typeBadge = employee.type === 1 
                    ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm">VN</span>'
                    : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm">TQ</span>';
                
                row.innerHTML = `
                    <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">#${employee.employeeId}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-700">
                                ${displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 dark:text-slate-200">${displayName}</div>
                                ${employee.fullnameOther ? `<div class="text-[10px] text-slate-500 font-medium">${employee.fullnameOther}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">${typeBadge}</td>
                    <td class="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">${employee.areaName || 'N/A'}</td>
                    <td class="px-6 py-4">
                        <button onclick="showEmployeeDetail(${employee.employeeId}); closeProjectEmployeesModal();" 
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20 font-bold text-xs shadow-sm">
                            <i class="fas fa-eye text-[10px]"></i>${typeof t !== 'undefined' ? t('employee.detail') : 'Chi tiết'}
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        
        // Show modal
        document.getElementById('projectEmployeesModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading project employees:', error);
        showToast('Lỗi khi tải danh sách nhân viên', 'error');
    }
}

// View project employees who are absent today (status != 1)
async function viewProjectAbsentDetail(projectId) {
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Get project info
        const projectResponse = await fetch(`${window.location.origin}/api/project/${projectId}`);
        const project = await projectResponse.json();
        
        // Get employees who are absent today in this project (status != 1)
        const employeesResponse = await fetch(`${window.location.origin}/api/project/${projectId}/employees/date/${todayStr}/status`);
        const employees = await employeesResponse.json();
        
        // Set modal title
        document.getElementById('projectEmployeesModalTitle').textContent = 
            `${project.projectName} (${project.projectCode}) - ${employees.length} nhân viên nghỉ hôm nay`;
        
        // Display employees
        const tbody = document.getElementById('projectEmployeesTableBody');
        tbody.innerHTML = '';
        
        if (employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                        <i class="fas fa-inbox text-4xl mb-4 block"></i>
                        <p>Không có nhân viên nào nghỉ hôm nay trong dự án này</p>
                    </td>
                </tr>
            `;
        } else {
            employees.forEach((employee, index) => {
                const row = document.createElement('tr');
                row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
                
                const displayName = employee.fullname || employee.fullnameOther || 'N/A';
                const typeBadge = employee.type === 1 
                    ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm">VN</span>'
                    : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm">TQ</span>';
                
                row.innerHTML = `
                    <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">#${employee.employeeId}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-700">
                                ${displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 dark:text-slate-200">${displayName}</div>
                                ${employee.fullnameOther ? `<div class="text-[10px] text-slate-500 font-medium">${employee.fullnameOther}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">${typeBadge}</td>
                    <td class="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">${employee.areaName || 'N/A'}</td>
                    <td class="px-6 py-4">
                        <button onclick="showEmployeeDetail(${employee.employeeId}); closeProjectEmployeesModal();" 
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20 font-bold text-xs shadow-sm">
                            <i class="fas fa-eye text-[10px]"></i>${typeof t !== 'undefined' ? t('employee.detail') : 'Chi tiết'}
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        
        // Show modal
        document.getElementById('projectEmployeesModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading project absent employees:', error);
        showToast('Lỗi khi tải danh sách nhân viên nghỉ', 'error');
    }
}

// View today's timesheets - navigate to timesheet management with today's date filter
function viewTodayTimesheets() {
    // Get today's date in YYYY-MM-DD format (local time)
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    // Navigate to timesheet management with today's date filter
    if (typeof showTimesheetManagement === 'function') {
        showTimesheetManagement(null, todayStr);
    } else {
        showToast('Chức năng xem bảng công hôm nay', 'info');
    }
}