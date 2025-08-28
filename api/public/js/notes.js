let notes = [];

document.addEventListener('DOMContentLoaded', function() {
    // Handle toolbar button clicks
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-format]')) {
            const format = e.target.getAttribute('data-format');
            formatText(format);
        }
        
        if (e.target.matches('[data-action="save-note"]')) {
            saveNote();
        }
        
        if (e.target.matches('[data-action="new-note"]')) {
            newNote();
        }
        
        if (e.target.matches('[data-note-id]')) {
            const noteId = e.target.getAttribute('data-note-id');
            const action = e.target.getAttribute('data-action');
            
            if (action === 'edit') {
                editNote(noteId);
            } else if (action === 'delete') {
                deleteNote(noteId);
            }
        }
    });
    
    // Load notes on page load
    loadNotes();
});

function formatText(command) {
    const editor = document.getElementById('noteContent');
    editor.focus();
    document.execCommand(command, false, null);
}

async function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').innerHTML;
    const noteId = document.getElementById('noteForm').dataset.noteId;
    
    if (!title.trim()) {
        showToast('Please enter a title', 'error');
        return;
    }
    
    try {
        const method = noteId ? 'PUT' : 'POST';
        const url = noteId ? `/api/v1/personal/notes/${noteId}` : '/api/v1/personal/notes';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            showToast(noteId ? 'Note updated!' : 'Note saved!');
            newNote();
            loadNotes();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.message}`, 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

function newNote() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').innerHTML = '';
    document.getElementById('noteForm').removeAttribute('data-note-id');
    document.getElementById('saveButton').textContent = 'Save Note';
}

async function loadNotes() {
    try {
        const response = await fetch('/api/v1/personal/notes');
        const data = await response.json();
        
        notes = data.notes || data || [];
        renderNotes();
    } catch (error) {
        document.getElementById('notesList').innerHTML = 
            '<div class="empty-state">Error loading notes. Please try again.</div>';
    }
}

function renderNotes() {
    const container = document.getElementById('notesList');
    
    if (notes.length === 0) {
        container.innerHTML = '<div class="empty-state">No notes yet. Create your first note above!</div>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="note-item" data-id="${note._id || note.id}">
            <div class="note-header">
                <h3 class="note-title">${escapeHtml(note.title)}</h3>
                <div class="note-actions">
                    <button class="btn-icon" data-action="edit" data-note-id="${note._id || note.id}" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" data-action="delete" data-note-id="${note._id || note.id}" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-meta">
                ${note.createdAt ? `Created: ${new Date(note.createdAt).toLocaleDateString()}` : ''}
                ${note.updatedAt && note.updatedAt !== note.createdAt ? 
                    ` • Updated: ${new Date(note.updatedAt).toLocaleDateString()}` : ''}
            </div>
        </div>
    `).join('');
}

async function editNote(id) {
    const note = notes.find(n => n._id === id || n.id === id);
    if (!note) return;
    
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').innerHTML = note.content;
    document.getElementById('noteForm').dataset.noteId = id;
    document.getElementById('saveButton').textContent = 'Update Note';
    
    // Scroll to editor
    document.getElementById('noteForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const response = await fetch(`/api/v1/personal/notes/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Note deleted successfully!');
            loadNotes();
        } else {
            showToast('Error deleting note', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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