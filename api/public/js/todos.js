let todos = [];
let currentFilter = 'all';

// Check authentication and load todos on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthRequired();
        return;
    }
    loadTodos();
}

// Show authentication required message
function showAuthRequired() {
    document.getElementById('todosList').innerHTML = `
        <div class="empty-state">
            <p>Please sign in to manage your todos.</p>
            <a href="/auth" class="btn btn-primary mt-3">Sign In</a>
        </div>
    `;
    document.getElementById('todoForm').style.display = 'none';
}

// Add todo form submission
document.getElementById('todoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Please sign in to add todos', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const todoData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        completed: false
    };
    
    try {
        const response = await fetch('/api/v1/data/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(todoData)
        });
        
        if (response.ok) {
            e.target.reset();
            loadTodos();
            showToast('Todo added successfully!');
        } else {
            const error = await response.json();
            showToast(`Error: ${error.message}`, 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
});

// Load todos from API
async function loadTodos() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthRequired();
        return;
    }
    
    try {
        const response = await fetch('/api/v1/data/todos/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                showAuthRequired();
                return;
            }
            throw new Error('Failed to load todos');
        }
        
        const data = await response.json();
        // Handle different API response structures
        if (data.data && data.data.todos) {
            todos = data.data.todos;
        } else {
            todos = data.todos || data || [];
        }
        renderTodos();
    } catch (error) {
        document.getElementById('todosList').innerHTML = 
            '<div class="empty-state">Error loading todos. Please try again.</div>';
    }
}

// Render todos based on filter
function renderTodos() {
    const container = document.getElementById('todosList');
    
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
    });
    
    if (filteredTodos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No ${currentFilter} todos yet.</p>
                ${currentFilter === 'all' ? '<p>Create your first todo above!</p>' : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo._id || todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                data-todo-id="${todo._id || todo.id}"
            >
            <div class="todo-content">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-meta">
                    <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
                    ${todo.createdAt ? `<span>Created: ${new Date(todo.createdAt).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn-icon delete" data-todo-id="${todo._id || todo.id}" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for checkboxes and delete buttons
    container.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const todoId = this.getAttribute('data-todo-id');
            if (todoId) toggleTodo(todoId);
        });
    });
    
    container.querySelectorAll('.btn-icon.delete').forEach(button => {
        button.addEventListener('click', function() {
            const todoId = this.getAttribute('data-todo-id');
            if (todoId) deleteTodo(todoId);
        });
    });
}

// Toggle todo completion
async function toggleTodo(id) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Please sign in to update todos', 'error');
        return;
    }
    
    const todo = todos.find(t => t._id === id || t.id === id);
    if (!todo) return;
    
    try {
        const response = await fetch(`/api/v1/data/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: !todo.completed })
        });
        
        if (response.ok) {
            loadTodos();
        } else {
            showToast('Error updating todo', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Delete todo
async function deleteTodo(id) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Please sign in to delete todos', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    try {
        const response = await fetch(`/api/v1/data/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadTodos();
            showToast('Todo deleted successfully!');
        } else {
            showToast('Error deleting todo', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderTodos();
    });
});

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    // Simple toast notification (you can enhance this)
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
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add slide up animation
const style = document.createElement('style');
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