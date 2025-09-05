document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Event listeners
    document.getElementById('updateProfileBtn').addEventListener('click', showUpdateModal);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('updateForm').addEventListener('submit', updateProfile);
});

async function checkAuth() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        document.getElementById('authRequired').style.display = 'block';
        document.getElementById('profileContent').style.display = 'none';
        return;
    }
    
    try {
        // Get user info
        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                document.getElementById('authRequired').style.display = 'block';
                document.getElementById('profileContent').style.display = 'none';
                return;
            }
            throw new Error('Failed to load profile');
        }
        
        const data = await response.json();
        displayUserInfo(data.user);
        
        document.getElementById('authRequired').style.display = 'none';
        document.getElementById('profileContent').style.display = 'block';
        
        // Load activity data
        loadActivityData(token);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
}

function displayUserInfo(user) {
    document.getElementById('userName').textContent = user.name || '-';
    document.getElementById('userEmail').textContent = user.email || '-';
    document.getElementById('userId').textContent = user._id || user.id || '-';
    
    if (user.createdAt) {
        const createdDate = new Date(user.createdAt).toLocaleDateString();
        document.getElementById('userCreated').textContent = createdDate;
    }
    
    // Store user info for update form
    window.currentUser = user;
}

async function loadActivityData(token) {
    // Load URL count
    loadUrlCount(token);
    
    // Load Todo count
    loadTodoCount(token);
    
    // Load Note count
    loadNoteCount(token);
    
    // Load Token count
    loadTokenCount(token);
    
    // Load recent URLs
    loadRecentUrls(token);
}

async function loadUrlCount(token) {
    try {
        const response = await fetch('/api/v1/url/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const count = data.data ? data.data.length : 0;
            document.getElementById('urlCount').textContent = count;
        }
    } catch (error) {
        console.error('Error loading URL count:', error);
    }
}

async function loadTodoCount(token) {
    try {
        const response = await fetch('/api/v1/data/todos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const todos = data.todos || data || [];
            const activeTodos = todos.filter(todo => !todo.completed).length;
            const totalTodos = todos.length;
            document.getElementById('todoCount').textContent = `${activeTodos}/${totalTodos}`;
        }
    } catch (error) {
        console.error('Error loading todo count:', error);
    }
}

async function loadNoteCount(token) {
    try {
        const response = await fetch('/api/v1/data/notes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const notes = data.notes || data || [];
            document.getElementById('noteCount').textContent = notes.length;
        }
    } catch (error) {
        console.error('Error loading note count:', error);
    }
}

async function loadTokenCount(token) {
    try {
        const response = await fetch('/api/v1/auth/tokens', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const activeTokens = data.tokens.filter(t => t.isActive).length;
            document.getElementById('tokenCount').textContent = activeTokens;
        }
    } catch (error) {
        console.error('Error loading token count:', error);
    }
}

async function loadRecentUrls(token) {
    try {
        const response = await fetch('/api/v1/url/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const urls = data.data || [];
            
            if (urls.length === 0) {
                document.getElementById('recentUrls').innerHTML = 
                    '<div class="empty-state">No URLs created yet</div>';
                return;
            }
            
            // Show only the 5 most recent URLs
            const recentUrls = urls.slice(0, 5);
            
            const html = recentUrls.map(url => {
                const shortUrl = `${window.location.origin}/s/${url.shortCode}`;
                const createdDate = new Date(url.createdAt).toLocaleDateString();
                
                return `
                    <div class="recent-item">
                        <div>
                            <a href="${shortUrl}" target="_blank">/s/${url.shortCode}</a>
                            <div class="recent-meta">
                                ${url.clicks || 0} clicks • Created ${createdDate}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            document.getElementById('recentUrls').innerHTML = html;
            
            if (urls.length > 5) {
                document.getElementById('recentUrls').innerHTML += 
                    '<div class="text-center mt-3"><a href="/services/url" class="btn btn-sm btn-secondary">View All URLs</a></div>';
            }
        }
    } catch (error) {
        document.getElementById('recentUrls').innerHTML = 
            '<div class="empty-state">Error loading URLs</div>';
    }
}

function showUpdateModal() {
    if (window.currentUser) {
        document.getElementById('updateName').value = window.currentUser.name || '';
        document.getElementById('updateEmail').value = window.currentUser.email || '';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
    }
    document.getElementById('updateModal').style.display = 'flex';
}

window.closeModal = function() {
    document.getElementById('updateModal').style.display = 'none';
}

async function updateProfile(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Please sign in to update your profile', 'error');
        return;
    }
    
    const updateData = {
        name: document.getElementById('updateName').value,
        email: document.getElementById('updateEmail').value,
        currentPassword: document.getElementById('currentPassword').value
    };
    
    const newPassword = document.getElementById('newPassword').value;
    if (newPassword) {
        updateData.newPassword = newPassword;
    }
    
    try {
        const response = await fetch('/api/v1/auth/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Profile updated successfully!');
            closeModal();
            checkAuth(); // Reload user info
        } else {
            showToast(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('authToken');
        window.location.href = '/auth';
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: var(--space-3) var(--space-6);
        background-color: ${type === 'error' ? 'var(--red)' : 'var(--green)'};
        color: var(--background);
        border-radius: var(--radius-md);
        z-index: 2000;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add animation
if (!document.querySelector('style[data-profile-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-profile-animations', 'true');
    style.textContent = `
        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Close modal on outside click
document.getElementById('updateModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});