// Area Management JavaScript
const AREA_API_BASE_URL = `${window.location.origin}/api/area`;

let allAreas = [];

// Show area management
function showAreaManagement(event) {
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
    if (projectSection) projectSection.classList.add('hidden');
    if (excelSection) excelSection.classList.add('hidden');
    if (areaSection) {
        areaSection.classList.remove('hidden');
    } else {
        console.error('areaManagementSection not found');
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
    
    loadAreas();
}

// Load areas
async function loadAreas() {
    try {
        const response = await fetch(AREA_API_BASE_URL);
        allAreas = await response.json();
        displayAreas(allAreas);
    } catch (error) {
        console.error('Error loading areas:', error);
        showToast(typeof t !== 'undefined' ? t('area.loadError') : 'Lỗi khi tải danh sách khu vực', 'error');
    }
}

// Display areas in table
function displayAreas(areas) {
    const tbody = document.getElementById('areaTableBody');
    tbody.innerHTML = '';

    // Update stats
    const total = areas.length;
    const active = areas.filter(a => a.active === 1).length;
    const inactive = total - active;
    
    document.getElementById('totalAreas').textContent = total;
    document.getElementById('activeAreas').textContent = active;
    document.getElementById('inactiveAreas').textContent = inactive;

    if (areas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                    <i class="fas fa-inbox text-4xl mb-4 block"></i>
                    <p>${typeof t !== 'undefined' ? t('area.noAreas') : 'Chưa có khu vực nào'}</p>
                </td>
            </tr>
        `;
        return;
    }

    areas.forEach((area, index) => {
        const row = document.createElement('tr');
        row.className = `border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
        
        const activeLabel = typeof t !== 'undefined' ? t('user.activeStatus') : 'Hoạt động';
        const inactiveLabel = typeof t !== 'undefined' ? t('user.inactiveStatus') : 'Không hoạt động';
        const statusBadge = area.active === 1 
            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"><i class="fas fa-check-circle mr-1.5 text-[10px]"></i>${activeLabel}</span>`
            : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm"><i class="fas fa-ban mr-1.5 text-[10px]"></i>${inactiveLabel}</span>`;

        row.innerHTML = `
            <td class="px-6 py-4 font-semibold text-slate-700">#${area.areaId}</td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        ${area.name.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-semibold text-slate-800">${area.name}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600 max-w-xs truncate" title="${area.description || ''}">
                ${area.description || '-'}
            </td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <button onclick="editArea(${area.areaId})" 
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all border border-blue-100 dark:border-blue-500/20 font-bold text-xs shadow-sm" title="${typeof t !== 'undefined' ? t('common.edit') : 'Sửa'}">
                        <i class="fas fa-pen-to-square text-[10px]"></i>${typeof t !== 'undefined' ? t('common.edit') : 'Sửa'}
                    </button>
                    <button onclick="deleteArea(${area.areaId})" 
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 transition-all border border-rose-100 dark:border-rose-500/20 font-bold text-xs shadow-sm" title="${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}">
                        <i class="fas fa-trash-can text-[10px]"></i>${typeof t !== 'undefined' ? t('common.delete') : 'Xóa'}
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show create area modal
function showCreateAreaModal() {
    document.getElementById('areaModalTitle').textContent = typeof t !== 'undefined' ? t('area.add') : 'Thêm Khu vực';
    document.getElementById('areaForm').reset();
    document.getElementById('areaId').value = '';
    document.getElementById('modalAreaActive').value = '1';
    document.getElementById('areaModalError').classList.add('hidden');
    document.getElementById('areaModal').classList.remove('hidden');
}

// Edit area
async function editArea(id) {
    try {
        const response = await fetch(`${AREA_API_BASE_URL}/${id}`);
        const area = await response.json();
        
        document.getElementById('areaModalTitle').textContent = typeof t !== 'undefined' ? (t('common.edit') + ' ' + t('area.title')) : 'Sửa Khu vực';
        document.getElementById('areaId').value = area.areaId;
        document.getElementById('modalAreaName').value = area.name;
        document.getElementById('modalAreaDescription').value = area.description || '';
        document.getElementById('modalAreaActive').value = area.active.toString();
        document.getElementById('areaModalError').classList.add('hidden');
        document.getElementById('areaModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading area:', error);
        showToast('Lỗi khi tải thông tin khu vực', 'error');
    }
}

// Close area modal
function closeAreaModal() {
    document.getElementById('areaModal').classList.add('hidden');
    document.getElementById('areaForm').reset();
    document.getElementById('areaModalError').classList.add('hidden');
}

// Submit area form
document.getElementById('areaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('areaModalError');
    const areaId = document.getElementById('areaId').value;
    const name = document.getElementById('modalAreaName').value;
    const description = document.getElementById('modalAreaDescription').value;
    const active = parseInt(document.getElementById('modalAreaActive').value);

    if (!name || name.trim() === '') {
        const errorText = document.getElementById('areaModalErrorText') || errorDiv;
        if (errorText.id === 'areaModalErrorText') {
            errorText.textContent = typeof t !== 'undefined' ? t('area.emptyName') : 'Tên khu vực không được để trống';
        } else {
            errorText.textContent = typeof t !== 'undefined' ? t('area.emptyName') : 'Tên khu vực không được để trống';
        }
        errorDiv.classList.remove('hidden');
        return;
    }

    try {
        if (areaId) {
            // Update area
            const response = await fetch(`${AREA_API_BASE_URL}/${areaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: name.trim(), 
                    description: description.trim(), 
                    active 
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeAreaModal();
                loadAreas();
                showToast('Cập nhật khu vực thành công!', 'success');
            } else {
                const errorText = document.getElementById('areaModalErrorText') || errorDiv;
                if (errorText.id === 'areaModalErrorText') {
                    errorText.textContent = data.message || 'Cập nhật thất bại';
                } else {
                    errorText.textContent = data.message || 'Cập nhật thất bại';
                }
                errorDiv.classList.remove('hidden');
                showToast(data.message || 'Cập nhật thất bại', 'error');
            }
        } else {
            // Create area
            const response = await fetch(AREA_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: name.trim(), 
                    description: description.trim(), 
                    active 
                })
            });

            const data = await response.json();

            if (response.ok) {
                closeAreaModal();
                loadAreas();
                showToast('Tạo khu vực thành công!', 'success');
            } else {
                const errorText = document.getElementById('areaModalErrorText') || errorDiv;
                if (errorText.id === 'areaModalErrorText') {
                    errorText.textContent = data.message || 'Tạo khu vực thất bại';
                } else {
                    errorText.textContent = data.message || 'Tạo khu vực thất bại';
                }
                errorDiv.classList.remove('hidden');
                showToast(typeof t !== 'undefined' ? t('area.createFailed') : 'Tạo khu vực thất bại', 'error');
            }
        }
    } catch (error) {
        const errorText = document.getElementById('areaModalErrorText') || errorDiv;
        if (errorText.id === 'areaModalErrorText') {
            errorText.textContent = typeof t !== 'undefined' ? t('message.connectionError') : 'Lỗi kết nối đến server';
        } else {
            errorText.textContent = typeof t !== 'undefined' ? t('message.connectionError') : 'Lỗi kết nối đến server';
        }
        errorDiv.classList.remove('hidden');
        showToast('Lỗi kết nối đến server', 'error');
        console.error('Save area error:', error);
    }
});

// Delete area
async function deleteArea(id) {
    const confirmed = await showConfirmDialog(typeof t !== 'undefined' ? t('area.confirmDelete') : 'Bạn có chắc chắn muốn xóa khu vực này? Hành động này không thể hoàn tác!', 'danger');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${AREA_API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            loadAreas();
            showToast(typeof t !== 'undefined' ? t('message.deleteSuccess') : 'Xóa khu vực thành công', 'success');
        } else {
            showToast(data.message || (typeof t !== 'undefined' ? t('message.deleteFailed') : 'Xóa thất bại'), 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Lỗi khi xóa khu vực', 'error');
    }
}

