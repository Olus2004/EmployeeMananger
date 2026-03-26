// Project Management JavaScript
const PROJECT_API_BASE_URL = `${window.location.origin}/api/project`;
const EMPLOYEE_API_BASE_URL_FOR_PROJECT = `${window.location.origin}/api/employee`;

let allProjects = [];
let currentProjectId = null;
let currentMonthStr = ""; // yyyy-MM-01 format for API
let currentDetailMonthStr = ""; // for modal detail

// Initialize current month
function initCurrentMonth() {
    const mainFilter = document.getElementById('mainProjectMonthFilter');
    if (mainFilter && mainFilter.value) {
        currentMonthStr = `${mainFilter.value}-01`;
    } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        currentMonthStr = `${year}-${month}-01`;
        if (mainFilter) mainFilter.value = `${year}-${month}`;
    }
}

// Change project month from main filter
function changeProjectMonth() {
    initCurrentMonth();
    loadProjects();
}

// Show project management
function showProjectManagement(event) {
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
    if (timesheetSection) timesheetSection.classList.add('hidden');
    if (feedbackSection) feedbackSection.classList.add('hidden');
    if (excelSection) excelSection.classList.add('hidden');
    if (areaSection) areaSection.classList.add('hidden');
    if (projectSection) {
        projectSection.classList.remove('hidden');
    } else {
        console.error('projectManagementSection not found');
        return;
    }
    
    // Update sidebar active state
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-link');
    });
    if (event && event.target) {
        const button = event.target.closest('button');
        if (button) button.classList.add('active-link');
    }
    
    initCurrentMonth();
    loadProjects();
}

// Load projects
async function loadProjects() {
    try {
        // Fetch projects with monthly count
        const response = await fetch(`${PROJECT_API_BASE_URL}/month/${currentMonthStr}`);
        allProjects = await response.json();
        displayProjects(allProjects);
    } catch (error) {
        console.error('Error loading projects:', error);
        showToast(typeof t !== 'undefined' ? t('project.loadError') : 'Lỗi khi tải danh sách dự án', 'error');
    }
}

// Display projects in table
function displayProjects(projects) {
    const tbody = document.getElementById('projectTableBody');
    tbody.innerHTML = '';

    // Update stats
    const total = projects.length;
    const totalEmployees = projects.reduce((sum, p) => sum + (p.monthlyEmployeeCount || 0), 0);
    
    document.getElementById('totalProjects').textContent = total;
    document.getElementById('totalProjectEmployees').textContent = totalEmployees;

    if (projects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p>${typeof t !== 'undefined' ? t('project.noProjects') : 'Chưa có dự án nào'}</p>
                </td>
            </tr>
        `;
        return;
    }

    const monthDisplay = currentMonthStr.substring(5, 7) + '/' + currentMonthStr.substring(0, 4);

    projects.forEach((project, index) => {
        const row = document.createElement('tr');
        row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;

        row.innerHTML = `
            <td class="px-6 py-4 font-semibold text-slate-700">#${project.projectId}</td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        ${project.projectCode.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span class="font-semibold text-slate-800 block">${project.projectName}</span>
                        <span class="text-xs text-slate-500">${project.projectCode}</span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600 max-w-xs truncate" title="${project.projectDescription || ''}">
                ${project.projectDescription || '-'}
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        <i class="fas fa-users mr-1.5"></i>${project.monthlyEmployeeCount || 0}
                    </span>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-500 font-medium">
                ${monthDisplay}
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <button onclick="showProjectMonthDetail(${project.projectId})" 
                        class="h-9 px-4 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all border border-indigo-100 dark:border-indigo-500/20 font-bold text-xs" title="Chi tiết">
                        <i class="fas fa-list-ul mr-2 text-[10px]"></i>Chi tiết
                    </button>
                    <button onclick="editProject(${project.projectId})" 
                        class="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20" title="${typeof t !== 'undefined' ? t('common.edit') : 'Sửa'}">
                        <i class="fas fa-pen-to-square text-xs"></i>
                    </button>
                    <button onclick="deleteProject(${project.projectId})" 
                        class="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all border border-rose-100 dark:border-rose-500/20" title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}">
                        <i class="fas fa-trash-can text-xs"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show project month detail modal
async function showProjectMonthDetail(projectId) {
    currentProjectId = projectId;
    const project = allProjects.find(p => p.projectId === projectId);
    
    if (!project) return;

    // Initialize modal month filter with current global month
    const modalMonthFilter = document.getElementById('modalProjectMonthFilter');
    if (modalMonthFilter) {
        modalMonthFilter.value = currentMonthStr.substring(0, 7);
    }
    currentDetailMonthStr = currentMonthStr;

    updateProjectDetailLabels(project);
    
    // Reset search
    document.getElementById('pmDetailEmployeeSearch').value = '';
    document.getElementById('pmDetailEmployeeId').value = '';
    const resultsDiv = document.getElementById('pmDetailEmployeeResults');
    if (resultsDiv) resultsDiv.classList.add('hidden');
    
    loadProjectMonthEmployees(projectId);
    document.getElementById('projectMonthDetailModal').classList.remove('hidden');
}

// Helper to update labels in detail modal
function updateProjectDetailLabels(project) {
    document.getElementById('projectMonthDetailTitle').textContent = `Dự án: ${project.projectName}`;
    document.getElementById('projectMonthDetailSubtitle').textContent = `Quản lý nhân viên`;
}

// Change month within detail modal
function changeProjectDetailMonth() {
    const modalMonthFilter = document.getElementById('modalProjectMonthFilter');
    if (modalMonthFilter && modalMonthFilter.value) {
        currentDetailMonthStr = `${modalMonthFilter.value}-01`;
        loadProjectMonthEmployees(currentProjectId);
    }
}

// Close project month detail modal
function closeProjectMonthDetailModal() {
    document.getElementById('projectMonthDetailModal').classList.add('hidden');
    currentProjectId = null;
    loadProjects(); // Refresh main table to update counts
}

// Load employees in project month
async function loadProjectMonthEmployees(projectId) {
    try {
        const response = await fetch(`${PROJECT_API_BASE_URL}/${projectId}/month/${currentDetailMonthStr}/employees`);
        const employees = await response.json();
        
        const tbody = document.getElementById('pmDetailTableBody');
        tbody.innerHTML = '';
        
        document.getElementById('pmDetailEmployeeCount').innerHTML = `${employees.length} <span data-i18n="project.employeeUnit">${typeof t !== 'undefined' ? t('project.employeeUnit') : 'nhân viên'}</span>`;

        if (employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-10 text-center text-slate-400 italic" data-i18n="project.noEmployeesPresent">
                        Chưa có nhân viên nào trong dự án tháng này
                    </td>
                </tr>
            `;
            return;
        }

        employees.forEach((emp, index) => {
            const row = document.createElement('tr');
            row.className = "hover:bg-slate-50 transition-colors";
            
            const badge = emp.type === 1 
                ? '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm">VN</span>'
                : '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm">TQ</span>';

            row.innerHTML = `
                <td class="px-5 py-3 font-medium text-slate-700">#${emp.employeeId}</td>
                <td class="px-5 py-3">
                    <div class="font-semibold text-slate-800">${emp.fullname}</div>
                    <div class="text-[10px] text-slate-500">${emp.fullnameOther || ''}</div>
                </td>
                <td class="px-5 py-3">${badge}</td>
                <td class="px-5 py-3 text-slate-600">${emp.areaName || '-'}</td>
                <td class="px-5 py-3">
                    <button onclick="removeEmployeeFromProjectMonth(${emp.employeeId})" 
                        class="text-red-500 hover:text-red-700 transition-colors p-1" title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}">
                        <i class="fas fa-user-minus"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading monthly employees:', error);
        showToast('Lỗi khi tải danh sách nhân viên', 'error');
    }
}

// Add employee to project month
async function addEmployeeToProjectMonth() {
    const employeeId = document.getElementById('pmDetailEmployeeId').value;
    if (!employeeId) {
        showToast(typeof t !== 'undefined' ? t('user.selectEmployee') : 'Vui lòng chọn nhân viên!', 'warning');
        return;
    }

    try {
        const response = await fetch(`${PROJECT_API_BASE_URL}/${currentProjectId}/month/${currentDetailMonthStr}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: parseInt(employeeId) })
        });

        if (response.ok) {
            showToast(typeof t !== 'undefined' ? t('message.saveSuccess') : 'Đã thêm nhân viên vào dự án tháng', 'success');
            document.getElementById('pmDetailEmployeeSearch').value = '';
            document.getElementById('pmDetailEmployeeId').value = '';
            loadProjectMonthEmployees(currentProjectId);
        } else {
            const data = await response.json();
            showToast(data.message || (typeof t !== 'undefined' ? t('message.error') : 'Thêm thất bại'), 'error');
        }
    } catch (error) {
        showToast('Lỗi server', 'error');
    }
}

// Remove employee from project month
async function removeEmployeeFromProjectMonth(employeeId) {
    if (!confirm(typeof t !== 'undefined' ? t('project.confirmDelete') : 'Bạn có chắc muốn xóa nhân viên này khỏi dự án trong tháng này?')) return;

    try {
        const response = await fetch(`${PROJECT_API_BASE_URL}/${currentProjectId}/month/${currentDetailMonthStr}/employees/${employeeId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Đã xóa nhân viên', 'success');
            loadProjectMonthEmployees(currentProjectId);
        } else {
            const data = await response.json();
            showToast(data.message || 'Xóa thất bại', 'error');
        }
    } catch (error) {
        showToast('Lỗi server', 'error');
    }
}

// Employee Search Logic for Modal
document.getElementById('pmDetailEmployeeSearch')?.addEventListener('input', async (e) => {
    const search = e.target.value.trim().toLowerCase();
    const resultsDiv = document.getElementById('pmDetailEmployeeResults');
    
    if (search.length < 1) {
        resultsDiv.classList.add('hidden');
        return;
    }

    try {
        // Fetch all employees to search (ideally use a search API, but using existing ones)
        const response = await fetch(`${EMPLOYEE_API_BASE_URL_FOR_PROJECT}`);
        const employees = await response.json();
        
        const filtered = employees.filter(emp => 
            emp.fullname.toLowerCase().includes(search) || 
            emp.employeeId.toString().includes(search) ||
            (emp.fullnameOther && emp.fullnameOther.toLowerCase().includes(search))
        ).slice(0, 10);

        if (filtered.length === 0) {
            resultsDiv.innerHTML = '<div class="p-3 text-sm text-slate-500">Không tìm thấy nhân viên</div>';
        } else {
            resultsDiv.innerHTML = filtered.map(emp => `
                <div class="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0" 
                     onclick="selectEmployeeForPM('${emp.employeeId}', '${emp.fullname}')">
                    <div class="font-semibold text-slate-800 text-sm">${emp.fullname}</div>
                    <div class="text-[10px] text-slate-500">ID: #${emp.employeeId} | ${emp.areaName || 'Khu vực khác'}</div>
                </div>
            `).join('');
        }
        resultsDiv.classList.remove('hidden');
    } catch (error) {
        console.error('Search error:', error);
    }
});

function selectEmployeeForPM(id, name) {
    document.getElementById('pmDetailEmployeeId').value = id;
    document.getElementById('pmDetailEmployeeSearch').value = name;
    document.getElementById('pmDetailEmployeeResults').classList.add('hidden');
}

// Show create project modal
function showCreateProjectModal() {
    document.getElementById('projectModalTitle').textContent = typeof t !== 'undefined' ? t('project.add') : 'Thêm Dự án';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('projectModalError').classList.add('hidden');
    document.getElementById('projectModal').classList.remove('hidden');
}

// Edit project
async function editProject(id) {
    try {
        const response = await fetch(`${PROJECT_API_BASE_URL}/${id}`);
        const project = await response.json();
        
        document.getElementById('projectModalTitle').textContent = typeof t !== 'undefined' ? (t('common.edit') + ' ' + t('project.title')) : 'Sửa Dự án';
        document.getElementById('projectId').value = project.projectId;
        document.getElementById('modalProjectName').value = project.projectName;
        document.getElementById('modalProjectCode').value = project.projectCode;
        document.getElementById('modalProjectDescription').value = project.projectDescription || '';
        document.getElementById('projectModalError').classList.add('hidden');
        document.getElementById('projectModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Lỗi khi tải thông tin dự án', 'error');
    }
}

// Close project modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.add('hidden');
    document.getElementById('projectForm').reset();
    document.getElementById('projectModalError').classList.add('hidden');
}

// Submit project form
document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('projectModalError');
    const projectId = document.getElementById('projectId').value;
    const projectName = document.getElementById('modalProjectName').value;
    const projectCode = document.getElementById('modalProjectCode').value;
    const projectDescription = document.getElementById('modalProjectDescription').value;

    if (!projectName || projectName.trim() === '') {
        const errorText = document.getElementById('projectModalErrorText') || errorDiv;
        errorText.textContent = typeof t !== 'undefined' ? t('project.emptyName') : 'Tên dự án không được để trống';
        errorDiv.classList.remove('hidden');
        return;
    }

    if (!projectCode || projectCode.trim() === '') {
        const errorText = document.getElementById('projectModalErrorText') || errorDiv;
        errorText.textContent = typeof t !== 'undefined' ? t('project.emptyCode') : 'Mã dự án không được để trống';
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        if (projectId) {
            // Update project
            const response = await fetch(`${PROJECT_API_BASE_URL}/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    projectName: projectName.trim(), 
                    projectCode: projectCode.trim(),
                    projectDescription: projectDescription.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeProjectModal();
                loadProjects();
                showToast('Cập nhật dự án thành công!', 'success');
            } else {
                const errorText = document.getElementById('projectModalErrorText') || errorDiv;
                errorText.textContent = data.message || 'Cập nhật thất bại';
                errorDiv.classList.remove('hidden');
                showToast(data.message || 'Cập nhật thất bại', 'error');
            }
        } else {
            // Create project
            const response = await fetch(PROJECT_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    projectName: projectName.trim(), 
                    projectCode: projectCode.trim(),
                    projectDescription: projectDescription.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeProjectModal();
                loadProjects();
                showToast('Tạo dự án thành công!', 'success');
            } else {
                const errorText = document.getElementById('projectModalErrorText') || errorDiv;
                errorText.textContent = data.message || (typeof t !== 'undefined' ? t('project.createFailed') : 'Tạo dự án thất bại');
                errorDiv.classList.remove('hidden');
                showToast(data.message || 'Tạo dự án thất bại', 'error');
            }
        }
    } catch (error) {
        const errorText = document.getElementById('projectModalErrorText') || errorDiv;
        errorText.textContent = typeof t !== 'undefined' ? t('message.connectionError') : 'Lỗi kết nối đến server';
        errorDiv.classList.remove('hidden');
        showToast('Lỗi kết nối đến server', 'error');
        console.error('Save project error:', error);
    }
});

// Delete project
async function deleteProject(id) {
    const confirmed = await showConfirmDialog(typeof t !== 'undefined' ? t('project.confirmDelete') : 'Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác!', 'danger');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${PROJECT_API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadProjects();
            showToast(typeof t !== 'undefined' ? t('message.deleteSuccess') : 'Xóa dự án thành công', 'success');
        } else {
            showToast(data.message || (typeof t !== 'undefined' ? t('message.deleteFailed') : 'Xóa thất bại'), 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Lỗi khi xóa dự án', 'error');
    }
}

// Show employees in project (Legacy or if needed for general view)
async function showProjectEmployees(projectId) {
    try {
        const projectResponse = await fetch(`${PROJECT_API_BASE_URL}/${projectId}`);
        const project = await projectResponse.json();
        
        const employeesResponse = await fetch(`${PROJECT_API_BASE_URL}/${projectId}/employees`);
        const employees = await employeesResponse.json();
        
        document.getElementById('projectEmployeesModalTitle').textContent = 
            `${project.projectName} (${project.projectCode}) - ${employees.length} nhân viên`;
        
        const tbody = document.getElementById('projectEmployeesTableBody');
        tbody.innerHTML = '';
        
        if (employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                        <i class="fas fa-inbox text-4xl mb-4 block"></i>
                        <p>${typeof t !== 'undefined' ? t('project.noEmployeesPresent') : 'Chưa có nhân viên nào trong dự án này'}</p>
                    </td>
                </tr>
            `;
        } else {
            employees.forEach((employee, index) => {
                const row = document.createElement('tr');
                row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
                
                const displayName = employee.fullname || employee.fullnameOther || 'N/A';
                const typeBadge = employee.type === 1 
                    ? '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm">VN</span>'
                    : '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm">TQ</span>';
                
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
                            <i class="fas fa-eye text-[10px]"></i>Chi tiết
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        document.getElementById('projectEmployeesModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading project employees:', error);
        showToast('Lỗi khi tải danh sách nhân viên', 'error');
    }
}

function closeProjectEmployeesModal() {
    document.getElementById('projectEmployeesModal').classList.add('hidden');
}
