let notes = [];
let currentNoteId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Event listeners
    document.getElementById('newNoteBtn').addEventListener('click', createNewNote);
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    document.getElementById('deleteNoteBtn').addEventListener('click', deleteCurrentNote);
    
    // Toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            formatText(format);
        });
    });
    
    // Auto-save on content change
    let saveTimer;
    document.getElementById('noteContent').addEventListener('input', function() {
        clearTimeout(saveTimer);
        if (currentNoteId) {
            saveTimer = setTimeout(() => saveNote(true), 2000);
        }
    });
    
    document.getElementById('noteTitle').addEventListener('input', function() {
        clearTimeout(saveTimer);
        if (currentNoteId) {
            saveTimer = setTimeout(() => saveNote(true), 2000);
        }
    });
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthRequired();
        return;
    }
    loadNotes();
}

function showAuthRequired() {
    document.getElementById('notesList').innerHTML = `
        <div class="empty-state">
            <p>Please sign in to manage your notes.</p>
            <a href="/auth" class="btn btn-primary btn-sm mt-3">Sign In</a>
        </div>
    `;
    document.getElementById('newNoteBtn').style.display = 'none';
}

function formatText(command) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText) {
            document.execCommand(command, false, null);
        }
    }
}

function createNewNote() {
    currentNoteId = null;
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('categorySelect').value = '';
    document.getElementById('lastSaved').textContent = '';
    
    // Show editor, hide welcome message
    document.getElementById('editorContainer').style.display = 'block';
    document.getElementById('welcomeMessage').style.display = 'none';
    
    // Remove active state from all notes
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById('noteTitle').focus();
}

async function saveNote(autoSave = false) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Please sign in to save notes', 'error');
        return;
    }
    
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const category = document.getElementById('categorySelect').value;
    
    if (!title && !content) {
        if (!autoSave) {
            showToast('Please enter a title or content', 'error');
        }
        return;
    }
    
    const noteData = {
        title: title || 'Untitled Note',
        content,
        category
    };
    
    try {
        const method = currentNoteId ? 'PUT' : 'POST';
        const url = currentNoteId ? 
            `/api/v1/data/notes/${currentNoteId}` : 
            '/api/v1/data/notes';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(noteData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (!currentNoteId) {
                currentNoteId = result.note._id || result.note.id;
            }
            
            document.getElementById('lastSaved').textContent = 
                `Last saved: ${new Date().toLocaleTimeString()}`;
            
            if (!autoSave) {
                showToast(method === 'POST' ? 'Note created!' : 'Note saved!');
            }
            
            loadNotes();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to save note', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function loadNotes() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthRequired();
        return;
    }
    
    try {
        const response = await fetch('/api/v1/data/notes/list', {
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
            throw new Error('Failed to load notes');
        }
        
        const data = await response.json();
        // Handle different API response structures
        if (data.data && data.data.notes) {
            notes = data.data.notes;
        } else {
            notes = data.notes || data || [];
        }
        renderNotes();
    } catch (error) {
        document.getElementById('notesList').innerHTML = 
            '<div class="empty-state">Error loading notes. Please try again.</div>';
    }
}

function renderNotes() {
    const container = document.getElementById('notesList');
    
    if (notes.length === 0) {
        container.innerHTML = '<div class="empty-state">No notes yet. Click "New Note" to create your first note!</div>';
        return;
    }
    
    container.innerHTML = notes.map(note => {
        const preview = note.content ? 
            note.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
            'No content';
        
        return `
            <div class="note-item ${note._id === currentNoteId ? 'active' : ''}" 
                 data-id="${note._id || note.id}"
                 onclick="loadNote('${note._id || note.id}')">
                <div class="note-item-title">${note.title || 'Untitled'}</div>
                <div class="note-item-preview">${preview}</div>
                <div class="note-item-meta">
                    ${note.category ? `<span class="note-category">${note.category}</span>` : ''}
                    <span>${formatDate(note.updatedAt || note.createdAt)}</span>
                </div>
            </div>
        `;
    }).join('');
}

window.loadNote = async function(noteId) {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    const note = notes.find(n => n._id === noteId || n.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    
    // Update UI
    document.getElementById('noteTitle').value = note.title || '';
    document.getElementById('noteContent').value = note.content || '';
    document.getElementById('categorySelect').value = note.category || '';
    document.getElementById('lastSaved').textContent = 
        `Last saved: ${formatDate(note.updatedAt || note.createdAt)}`;
    
    // Show editor, hide welcome message
    document.getElementById('editorContainer').style.display = 'block';
    document.getElementById('welcomeMessage').style.display = 'none';
    
    // Update active state
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-id="${noteId}"]`).classList.add('active');
}

async function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Please sign in to delete notes', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const response = await fetch(`/api/v1/data/notes/${currentNoteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showToast('Note deleted successfully!');
            currentNoteId = null;
            
            // Hide editor, show welcome message
            document.getElementById('editorContainer').style.display = 'none';
            document.getElementById('welcomeMessage').style.display = 'block';
            
            loadNotes();
        } else {
            showToast('Error deleting note', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
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
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add animation
if (!document.querySelector('style[data-notes-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-notes-animations', 'true');
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