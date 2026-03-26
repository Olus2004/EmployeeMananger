// Auto-detect API base URL
const API_BASE_URL = `${window.location.origin}/api/user`;

let currentUser = null;

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeStatus = document.getElementById('themeStatusDisplay');
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun w-5 text-center text-yellow-400';
        if (themeStatus) {
            themeStatus.innerText = t('sidebar.themeOn');
            themeStatus.classList.remove('bg-white', 'text-slate-600');
            themeStatus.classList.add('bg-slate-700', 'text-yellow-400');
        }
    } else {
        document.documentElement.classList.remove('dark');
        if (themeIcon) themeIcon.className = 'fas fa-moon w-5 text-center text-slate-400';
        if (themeStatus) {
            themeStatus.innerText = t('sidebar.themeOff');
            themeStatus.classList.add('bg-white', 'text-slate-600');
            themeStatus.classList.remove('bg-slate-700', 'text-yellow-400');
        }
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
}

// Initialize theme as soon as possible
initTheme();
// Re-apply once DOM is loaded to ensure UI elements are updated
document.addEventListener('DOMContentLoaded', initTheme);

// Toast notification system
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: {
            bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
            icon: 'fa-check-circle',
            border: 'border-emerald-400'
        },
        error: {
            bg: 'bg-gradient-to-r from-red-500 to-red-600',
            icon: 'fa-exclamation-circle',
            border: 'border-red-400'
        },
        info: {
            bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
            icon: 'fa-info-circle',
            border: 'border-blue-400'
        },
        warning: {
            bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
            icon: 'fa-exclamation-triangle',
            border: 'border-orange-400'
        }
    };

    const config = colors[type] || colors.info;

    toast.className = `toast ${config.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md border-l-4 ${config.border}`;
    toast.innerHTML = `
        <i class="fas ${config.icon} text-xl"></i>
        <span class="flex-1 font-semibold">${message}</span>
        <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Confirm dialog function to replace window.confirm
// Supports: showConfirmDialog(message, title) or showConfirmDialog(message, type)
function showConfirmDialog(message, titleOrType = null) {
    if (!titleOrType) titleOrType = t('common.confirm');
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmModalTitle');
        const messageEl = document.getElementById('confirmModalMessage');
        const iconEl = document.getElementById('confirmModalIcon');
        const okBtn = document.getElementById('confirmModalOk');
        const cancelBtn = document.getElementById('confirmModalCancel');
        
        if (!modal || !titleEl || !messageEl || !okBtn || !cancelBtn) {
            // Fallback: create a simple overlay modal if elements not found
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
            const dialog = document.createElement('div');
            dialog.className = 'bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl';
            dialog.innerHTML = `
                <h3 class="text-lg font-bold text-slate-800 mb-3">${t('common.confirm')}</h3>
                <p class="text-slate-600 mb-5">${message}</p>
                <div class="flex space-x-3">
                    <button id="fallbackConfirmYes" class="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">${t('common.confirm')}</button>
                    <button id="fallbackConfirmNo" class="flex-1 bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-300">${t('common.cancel')}</button>
                </div>
            `;
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            document.getElementById('fallbackConfirmYes').onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };
            document.getElementById('fallbackConfirmNo').onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            };
            return;
        }
        
        // Determine if second parameter is type or title
        const isType = ['info', 'warning', 'danger'].includes(titleOrType);
        const title = isType ? t('common.confirm') : titleOrType;
        const type = isType ? titleOrType : 'info';
        
        // Set title and message
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        // Update icon and colors based on type
        if (iconEl) {
            let iconClass, bgClass, textClass;
            if (type === 'danger') {
                iconClass = 'fa-exclamation-circle';
                bgClass = 'bg-red-100';
                textClass = 'text-red-600';
            } else if (type === 'warning') {
                iconClass = 'fa-exclamation-triangle';
                bgClass = 'bg-orange-100';
                textClass = 'text-orange-600';
            } else {
                iconClass = 'fa-info-circle';
                bgClass = 'bg-blue-100';
                textClass = 'text-blue-600';
            }
            iconEl.className = `mx-auto flex items-center justify-center h-16 w-16 rounded-full ${bgClass} mb-4`;
            iconEl.innerHTML = `<i class="fas ${iconClass} ${textClass} text-3xl"></i>`;
        }
        
        // Update button color based on type
        if (type === 'danger') {
            okBtn.className = 'flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold';
        } else if (type === 'warning') {
            okBtn.className = 'flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold';
        } else {
            okBtn.className = 'flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold';
        }
        
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
        
        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) {
                cleanup();
                resolve(false);
            }
        };
    });
}

// Override window.confirm globally
window.confirm = function(message) {
    return showConfirmDialog(message);
};

// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        // Redirect based on role
        if (currentUser.role === 1) {
            // Admin: Show dashboard
            showMainPage();
            showDashboard();
            // Load dashboard data on initial load
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        } else {
            // User / Other: Redirect to employee timesheet page
            window.location.href = 'employee-timesheet.html';
            return;
        }
    } else {
        showLoginPage();
    }
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Redirect based on role
            if (currentUser.role === 1) {
                // Admin: Show dashboard
                showMainPage();
                loadUsers();
                // Load dashboard ngay sau login để tránh phải refresh
                if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
            } else {
                // User / Other: Redirect to employee timesheet page
                window.location.href = 'employee-timesheet.html';
                return;
            }
            
            showToast(t('message.saveSuccess'), 'success');
        } else {
            const errorText = document.getElementById('loginErrorText') || errorDiv;
            if (errorText.id === 'loginErrorText') {
                errorText.textContent = data.message || t('message.error');
            } else {
                errorText.textContent = data.message || t('message.error');
            }
            errorDiv.classList.remove('hidden');
            showToast(data.message || t('message.error'), 'error');
        }
    } catch (error) {
        const errorText = document.getElementById('loginErrorText') || errorDiv;
        if (errorText.id === 'loginErrorText') {
            errorText.textContent = typeof t !== 'undefined' ? t('message.connectionError') : 'Lỗi kết nối đến server';
        } else {
            errorText.textContent = typeof t !== 'undefined' ? t('message.connectionError') : 'Lỗi kết nối đến server';
        }
        errorDiv.classList.remove('hidden');
        showToast(typeof t !== 'undefined' ? t('message.connectionError') : 'Lỗi kết nối đến server', 'error');
        console.error('Login error:', error);
    }
});

// Language toggle
function toggleLanguage() {
    const newLang = currentLanguage === 'vi' ? 'zh' : 'vi';
    setLanguage(newLang);
    updateLanguageDisplay();
}

// Update language display
function updateLanguageDisplay() {
    const display = document.getElementById('currentLanguageDisplay');
    if (display) {
        display.textContent = currentLanguage === 'vi' ? 'VI' : 'ZH';
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showLoginPage();
    // Điều hướng về trang chính để tránh kẹt UI / đảm bảo render login
    window.location.href = 'index.html';
}
// Expose for inline onclick
window.logout = logout;

// Ensure logout buttons (if any) also work via event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
});

// Show pages
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainPage').classList.add('hidden');
}

function showMainPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
    if (currentUser) {
        document.getElementById('currentUsername').textContent = currentUser.username || 'Admin';
    }
    
    const dailyDateInput = document.getElementById('dailyAttendanceDate');
    if (dailyDateInput && !dailyDateInput.value) {
        dailyDateInput.value = new Date().toLocaleDateString('en-CA');
    }

    updateLanguageDisplay();
    applyTranslations();
}



function showDashboard(event) {
    // Hide all sections first
    const dashboardSection = document.getElementById('dashboardSection');
    const userSection = document.getElementById('userManagementSection');
    const employeeSection = document.getElementById('employeeManagementSection');
    const timesheetSection = document.getElementById('timesheetManagementSection');
    const areaSection = document.getElementById('areaManagementSection');
    const projectSection = document.getElementById('projectManagementSection');
    const feedbackSection = document.getElementById('feedbackManagementSection');
    const excelSection = document.getElementById('excelManagementSection');
    
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    if (userSection) userSection.classList.add('hidden');
    if (employeeSection) employeeSection.classList.add('hidden');
    if (timesheetSection) timesheetSection.classList.add('hidden');
    if (feedbackSection) feedbackSection.classList.add('hidden');
    if (areaSection) areaSection.classList.add('hidden');
    if (projectSection) projectSection.classList.add('hidden');
    if (excelSection) excelSection.classList.add('hidden');
    
    // Update sidebar active state
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-link');
    });
    if (event && event.target) {
        const button = event.target.closest('button');
        if (button) button.classList.add('active-link');
    } else {
        // If called programmatically, find the dashboard button
        const dashboardBtn = Array.from(document.querySelectorAll('nav button')).find(btn => 
            btn.textContent.includes('Dashboard')
        );
        if (dashboardBtn) {
            dashboardBtn.classList.add('active-link');
        }
    }
    
    loadDashboard();
    if (typeof loadDailyAttendance === 'function') {
        loadDailyAttendance();
    }
}

function showUserManagement(event) {
    // Hide all sections first
    const dashboardSection = document.getElementById('dashboardSection');
    const userSection = document.getElementById('userManagementSection');
    const employeeSection = document.getElementById('employeeManagementSection');
    const timesheetSection = document.getElementById('timesheetManagementSection');
    const areaSection = document.getElementById('areaManagementSection');
    const projectSection = document.getElementById('projectManagementSection');
    const feedbackSection = document.getElementById('feedbackManagementSection');
    const excelSection = document.getElementById('excelManagementSection');
    
    if (dashboardSection) dashboardSection.classList.add('hidden');
    if (userSection) userSection.classList.remove('hidden');
    if (employeeSection) employeeSection.classList.add('hidden');
    if (timesheetSection) timesheetSection.classList.add('hidden');
    if (feedbackSection) feedbackSection.classList.add('hidden');
    if (areaSection) areaSection.classList.add('hidden');
    if (projectSection) projectSection.classList.add('hidden');
    if (excelSection) excelSection.classList.add('hidden');
    
    // Update sidebar active state
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-link');
    });
    if (event && event.target) {
        const button = event.target.closest('button');
        if (button) button.classList.add('active-link');
    }
    
    loadUsers();
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch(API_BASE_URL);
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showToast(t('message.error'), 'error');
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    // Update stats
    const total = users.length;
    const active = users.filter(u => u.active === 1).length;
    const inactive = total - active;
    
    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('inactiveUsers').textContent = inactive;

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p>${typeof t !== 'undefined' ? t('user.noUsers') : 'Chưa có tài khoản nào'}</p>
                </td>
            </tr>
        `;
        return;
    }

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
        
        const statusBadge = user.active === 1 
            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"><i class="fas fa-check-circle mr-1.5"></i>${typeof t !== 'undefined' ? t('user.activeStatus') : 'Hoạt động'}</span>`
            : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-sm"><i class="fas fa-ban mr-1.5"></i>${typeof t !== 'undefined' ? t('user.inactiveStatus') : 'Không hoạt động'}</span>`;

        const createdDate = new Date(user.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        row.innerHTML = `
            <td class="px-6 py-4 font-semibold text-gray-700">#${user.id}</td>
            <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-semibold text-slate-800">${user.username}</span>
                </div>
            </td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4 text-gray-600">${createdDate}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <button onclick="editUser(${user.id})" 
                        class="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20" title="${typeof t !== 'undefined' ? t('common.edit') : 'Sửa'}">
                        <i class="fas fa-pen-to-square text-xs"></i>
                    </button>
                    ${user.active === 1 
                        ? `<button onclick="deactivateUser(${user.id})" 
                            class="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 transition-all border border-amber-100 dark:border-amber-500/20" title="${typeof t !== 'undefined' ? t('common.deactivate') : 'Khóa'}">
                            <i class="fas fa-ban text-xs"></i>
                        </button>`
                        : `<button onclick="activateUser(${user.id})" 
                            class="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all border border-emerald-100 dark:border-emerald-500/20" title="${typeof t !== 'undefined' ? t('common.activate') : 'Mở khóa'}">
                            <i class="fas fa-check text-xs"></i>
                        </button>`
                    }
                    <button onclick="deleteUser(${user.id})" 
                        class="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all border border-rose-100 dark:border-rose-500/20" title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}">
                        <i class="fas fa-trash-can text-xs"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show create user modal
function showCreateUserModal() {
    document.getElementById('modalTitle').textContent = t('user.add');
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('modalPassword').required = true;
    document.getElementById('modalActive').value = '1';
    const roleSelect = document.getElementById('modalRole');
    if (roleSelect) {
        roleSelect.value = '2'; // mặc định Nhân viên
    }
    const empIdInput = document.getElementById('userEmployeeId');
    const empSearchInput = document.getElementById('userEmployeeSearch');
    const empResults = document.getElementById('userEmployeeSearchResults');
    if (empIdInput) empIdInput.value = '';
    if (empSearchInput) empSearchInput.value = '';
    if (empResults) {
        empResults.innerHTML = '';
        empResults.classList.add('hidden');
    }
    document.getElementById('modalError').classList.add('hidden');
    document.getElementById('userModal').classList.remove('hidden');
    setupUserEmployeeSearch();
}

// Hàm xóa lựa chọn nhân viên
function clearUserEmployeeSelection() {
    const empIdInput = document.getElementById('userEmployeeId');
    const empSearchInput = document.getElementById('userEmployeeSearch');
    const clearBtn = document.getElementById('clearUserEmployeeBtn');
    
    if (empIdInput) empIdInput.value = '';
    if (empSearchInput) empSearchInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    
    // Focus lại vào input để người dùng có thể tìm kiếm tiếp
    if (empSearchInput) empSearchInput.focus();
}

// Edit user
async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const user = await response.json();
        
        document.getElementById('modalTitle').textContent = t('common.edit') + ' ' + t('user.title');
        document.getElementById('userId').value = user.id;
        document.getElementById('modalUsername').value = user.username;
        document.getElementById('modalPassword').value = '';
        document.getElementById('modalPassword').required = false;
        document.getElementById('modalActive').value = user.active.toString();
        const roleSelect = document.getElementById('modalRole');
        if (roleSelect && typeof user.role !== 'undefined') {
            roleSelect.value = user.role.toString();
        }
        const empIdInput = document.getElementById('userEmployeeId');
        const empSearchInput = document.getElementById('userEmployeeSearch');
        const clearBtn = document.getElementById('clearUserEmployeeBtn');
        if (empIdInput) {
            if (user.employeeId) {
                empIdInput.value = user.employeeId;
                if (empSearchInput) {
                    empSearchInput.value = `ID: ${user.employeeId}`;
                }
                // Hiển thị nút xóa nếu có employee được chọn
                if (clearBtn) clearBtn.classList.remove('hidden');
            } else {
                empIdInput.value = '';
                if (empSearchInput) {
                    empSearchInput.value = '';
                }
                // Ẩn nút xóa nếu không có employee
                if (clearBtn) clearBtn.classList.add('hidden');
            }
        }
        document.getElementById('modalError').classList.add('hidden');
        document.getElementById('userModal').classList.remove('hidden');
        setupUserEmployeeSearch();
    } catch (error) {
        console.error('Error loading user:', error);
        showToast(t('message.error'), 'error');
    }
}

// Close modal
function closeUserModal() {
    const pwdInput = document.getElementById('modalPassword');
    if (pwdInput) {
        pwdInput.type = 'password';
    }
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userForm').reset();
    document.getElementById('modalError').classList.add('hidden');
}

// Toggle password visibility
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Format time input as HH:mm
window.formatTimeInput = function(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length >= 2) {
        let hours = parseInt(val.substring(0, 2));
        if (hours > 23) hours = 23;
        val = (hours < 10 && val.length > 2 ? '0' + hours : hours.toString().padStart(val.substring(0, 2).length, '0')) + val.substring(2);
    }
    if (val.length > 2) {
        let mins = parseInt(val.substring(2, 4));
        if (mins > 59) mins = 59;
        val = val.substring(0, 2) + ':' + (mins < 10 && val.length > 4 ? '0' + mins : mins.toString().padStart(val.substring(2).length, '0'));
    }
    if (val.length > 5) val = val.substring(0, 5);
    input.value = val;
};

// Initialize Flatpickr 24h pickers
window.initTimePickers = function() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr(".time-picker", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTimePickers();
});

// (duplicate clearUserEmployeeSelection removed — defined above at line 564)

// Submit user form
document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('modalError');
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('modalUsername').value;
    const password = document.getElementById('modalPassword').value;
    const active = parseInt(document.getElementById('modalActive').value);
    const role = parseInt(document.getElementById('modalRole').value);
    const employeeIdRaw = document.getElementById('userEmployeeId')?.value ?? '';
    const employeeId = employeeIdRaw && !isNaN(parseInt(employeeIdRaw)) && parseInt(employeeIdRaw) > 0 ? parseInt(employeeIdRaw) : null;

    // Đảm bảo ẩn thông báo lỗi cũ
    errorDiv.classList.add('hidden');

    try {
        if (userId) {
            // Update user - employeeId có thể là null
            const updateData = { active, role };
            if (employeeId !== null) {
                updateData.employeeId = employeeId;
            } else {
                updateData.employeeId = null; // Cho phép xóa liên kết nhân viên
            }
            if (password) {
                updateData.password = password;
            }

            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                closeUserModal();
                loadUsers();
                showToast(t('message.updateSuccess'), 'success');
            } else {
                const errorText = document.getElementById('modalErrorText') || errorDiv;
                if (errorText.id === 'modalErrorText') {
                    errorText.textContent = data.message || t('message.updateFailed');
                } else {
                    errorText.textContent = data.message || t('message.updateFailed');
                }
                errorDiv.classList.remove('hidden');
                showToast(data.message || t('message.updateFailed'), 'error');
            }
        } else {
            // Create user
            if (!password) {
                errorDiv.textContent = t('login.password') + ' ' + t('message.error');
                errorDiv.classList.remove('hidden');
                return;
            }

            const createData = { username, password, active, role };
            // Chỉ thêm employeeId nếu có giá trị hợp lệ (> 0)
            // Nếu không có, không thêm field này - backend sẽ xử lý thành null
            if (employeeId !== null && employeeId > 0) {
                createData.employeeId = employeeId;
            }
            // Nếu employeeId là null hoặc <= 0, không gửi field này - để backend xử lý tự động

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(createData)
            });

            const data = await response.json();

            if (response.ok) {
                closeUserModal();
                loadUsers();
                showToast(t('message.createSuccess'), 'success');
            } else {
                const errorText = document.getElementById('modalErrorText') || errorDiv;
                if (errorText.id === 'modalErrorText') {
                    errorText.textContent = data.message || t('message.createFailed');
                } else {
                    errorText.textContent = data.message || t('message.createFailed');
                }
                errorDiv.classList.remove('hidden');
                showToast(data.message || t('message.createFailed'), 'error');
            }
        }
    } catch (error) {
        const errorText = document.getElementById('modalErrorText') || errorDiv;
        if (errorText.id === 'modalErrorText') {
            errorText.textContent = 'Lỗi kết nối đến server';
        } else {
            errorText.textContent = 'Lỗi kết nối đến server';
        }
        errorDiv.classList.remove('hidden');
        showToast('Lỗi kết nối đến server', 'error');
        console.error('Save user error:', error);
    }
});

// Setup employee search for user account modal
async function setupUserEmployeeSearch() {
    const searchInput = document.getElementById('userEmployeeSearch');
    const resultsContainer = document.getElementById('userEmployeeSearchResults');
    const hiddenInput = document.getElementById('userEmployeeId');

    if (!searchInput || !resultsContainer || !hiddenInput) return;

    // Load employees (cache in window scope to tránh gọi API nhiều lần)
    async function loadEmployeesForUser() {
        if (window._userEmployeesCache && Array.isArray(window._userEmployeesCache) && window._userEmployeesCache.length > 0) {
            return window._userEmployeesCache;
        }
        try {
            const response = await fetch(`${window.location.origin}/api/employee`);
            const employees = await response.json();
            window._userEmployeesCache = employees;
            return employees;
        } catch (error) {
            console.error('Error loading employees for user account:', error);
            return [];
        }
    }

    // Hiển thị gợi ý nhân viên
    function displayUserEmployeeSuggestions(list, searchTerm) {
        if (!list || list.length === 0) {
            resultsContainer.innerHTML = `<div class="px-4 py-3 text-slate-500 text-sm text-center">${typeof t !== 'undefined' ? t('employee.notFound') : 'Không tìm thấy nhân viên'}</div>`;
            resultsContainer.classList.remove('hidden');
            return;
        }

        resultsContainer.innerHTML = list.map(emp => {
            const displayName = emp.fullname || emp.fullnameOther || `Nhân viên #${emp.employeeId}`;
            const areaInfo = emp.areaName ? ` - ${emp.areaName}` : '';
            return `
                <div class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 user-employee-search-item transition-colors" 
                     data-employee-id="${emp.employeeId}" 
                     data-employee-name="${displayName}">
                    <div class="font-semibold text-slate-800">ID: ${emp.employeeId} - ${displayName}</div>
                    <div class="text-xs text-slate-500">${areaInfo ? areaInfo.slice(3) : ''}</div>
                </div>
            `;
        }).join('');

        resultsContainer.querySelectorAll('.user-employee-search-item').forEach(item => {
            item.addEventListener('click', function () {
                const employeeId = this.getAttribute('data-employee-id');
                const employeeName = this.getAttribute('data-employee-name');

                hiddenInput.value = employeeId;
                searchInput.value = `ID: ${employeeId} - ${employeeName}`;
                resultsContainer.classList.add('hidden');
                
                // Hiển thị nút xóa khi đã chọn nhân viên
                const clearBtn = document.getElementById('clearUserEmployeeBtn');
                if (clearBtn) clearBtn.classList.remove('hidden');

                hiddenInput.dispatchEvent(new Event('change'));
            });
        });

        resultsContainer.classList.remove('hidden');
    }

    // Lọc nhân viên theo tên / ID
    function filterUserEmployees(employees, term) {
        const search = term.toLowerCase().trim();
        if (!search) return employees;

        return employees.filter(emp => {
            const fullname = (emp.fullname || '').toLowerCase();
            const fullnameOther = (emp.fullnameOther || '').toLowerCase();
            const employeeId = emp.employeeId?.toString() || '';
            const areaName = (emp.areaName || '').toLowerCase();

            return fullname.includes(search)
                || fullnameOther.includes(search)
                || employeeId.includes(search)
                || areaName.includes(search);
        });
    }

    // Gõ để tìm kiếm
    searchInput.addEventListener('input', async function () {
        const term = this.value;
        const employees = await loadEmployeesForUser();
        if (!term.trim()) {
            hiddenInput.value = '';
            // Hiển thị danh sách rút gọn (20 dòng) khi chưa nhập gì
            displayUserEmployeeSuggestions(employees.slice(0, 20), term);
            return;
        }

        const filtered = filterUserEmployees(employees, term);
        displayUserEmployeeSuggestions(filtered, term);
    });

    // Khi focus, nạp dữ liệu và hiển thị danh sách rút gọn nếu chưa nhập
    searchInput.addEventListener('focus', async function () {
        const term = this.value;
        const employees = await loadEmployeesForUser();
        const list = term.trim()
            ? filterUserEmployees(employees, term)
            : employees.slice(0, 20);
        displayUserEmployeeSuggestions(list, term);
    });

    // Ẩn gợi ý khi blur (trễ nhẹ để click được)
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            resultsContainer.classList.add('hidden');
        }, 200);
    });
}

// Deactivate user
async function deactivateUser(id) {
    // Show confirmation dialog
    const confirmed = await showConfirmDialog(typeof t !== 'undefined' ? t('user.confirmDeactivate') : 'Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}/deactivate`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (response.ok) {
            loadUsers();
            showToast(t('message.updateSuccess'), 'success');
        } else {
            showToast(data.message || t('message.updateFailed'), 'error');
        }
    } catch (error) {
        console.error('Deactivate error:', error);
        showToast(t('message.error'), 'error');
    }
}

// Activate user
async function activateUser(id) {
    const confirmed = await showConfirmDialog(typeof t !== 'undefined' ? t('user.confirmActivate') : 'Bạn có chắc chắn muốn kích hoạt tài khoản này?');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}/activate`, {
            method: 'PUT'
        });

        const data = await response.json();

        if (response.ok) {
            loadUsers();
            showToast(t('message.updateSuccess'), 'success');
        } else {
            showToast(data.message || t('message.updateFailed'), 'error');
        }
    } catch (error) {
        console.error('Activate error:', error);
        showToast(t('message.error'), 'error');
    }
}

// Delete user
async function deleteUser(id) {
    const confirmed = await showConfirmDialog('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác!', 'warning');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadUsers();
            showToast(t('message.deleteSuccess'), 'success');
        } else {
            showToast(data.message || t('message.error'), 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast(t('message.error'), 'error');
    }
}


// Toggle sidebar for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');
    
    if (!sidebar) return;
    
    if (sidebar.classList.contains('-translate-x-full')) {
        // Show sidebar
        sidebar.classList.remove('-translate-x-full');
        if (overlay) overlay.classList.remove('hidden');
        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
        }
    } else {
        // Hide sidebar
        sidebar.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        }
    }
}

// Initialize sidebar behavior
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarIcon = sidebar?.querySelector('.fa-briefcase')?.closest('div');
    
    // Toggle sidebar collapse on desktop (double click on sidebar icon)
    if (sidebarIcon && window.innerWidth >= 1024) {
        sidebarIcon.addEventListener('dblclick', () => {
            sidebar.classList.toggle('sidebar-collapsed');
        });
    }
    
    // Close sidebar when clicking a menu item on mobile
    const menuItems = sidebar?.querySelectorAll('nav button');
    if (menuItems) {
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    toggleSidebar();
                }
            });
        });
    }
    
    // Close sidebar when clicking logout on mobile
    const logoutBtn = sidebar?.querySelector('button[onclick="logout()"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                toggleSidebar();
            }
        });
    }

    // Ensure logout works even if inline handler is blocked
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', logout);
    });
});

