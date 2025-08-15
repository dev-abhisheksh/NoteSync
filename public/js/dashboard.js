let currentEditId = null;
let mobileSearchActive = false;
let notesData = [];
let searchTimeout = null;
let currentSearchQuery = '';
let isSearching = false;

// File type icons mapping
const fileTypeIcons = {
    'image': '🖼️',
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'txt': '📄',
    'zip': '📦',
    'video': '🎥',
    'audio': '🎵',
    'default': '📎'
};

// Get file icon based on mime type or file extension
function getFileIcon(mimeType, fileName) {
    if (mimeType) {
        if (mimeType.startsWith('image/')) return fileTypeIcons.image;
        if (mimeType.includes('pdf')) return fileTypeIcons.pdf;
        if (mimeType.includes('word') || mimeType.includes('document')) return fileTypeIcons.doc;
        if (mimeType.includes('text')) return fileTypeIcons.txt;
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return fileTypeIcons.zip;
        if (mimeType.startsWith('video/')) return fileTypeIcons.video;
        if (mimeType.startsWith('audio/')) return fileTypeIcons.audio;
    }
    
    // Fallback to file extension
    if (fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        return fileTypeIcons[ext] || fileTypeIcons.default;
    }
    
    return fileTypeIcons.default;
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Open file in external app
function openFile(fileUrl, fileName) {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName; // Suggests download with original filename
    
    // Add the link to DOM, click it, then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Create file attachments HTML
function createFileAttachmentsHTML(files) {
    if (!files || !files.length) return '';
    
    const fileItems = files.map(file => `
        <div class="file-item" onclick="openFile('${file.fileUrl}', '${escapeHtml(file.fileName)}')">
            <span class="file-icon">${getFileIcon(file.fileType, file.fileName)}</span>
            <div class="file-info">
                <div class="file-name">${escapeHtml(file.fileName)}</div>
                <div class="file-size">${formatFileSize(file.fileSize || 0)}</div>
            </div>
        </div>
    `).join('');
    
    return `
        <div class="file-attachments">
            <div class="file-attachments-header">
                <span class="attachment-icon">📎</span>
                <span>Attachments (${files.length})</span>
            </div>
            <div class="file-list">
                ${fileItems}
            </div>
        </div>
    `;
}

// Helper function to safely convert tags to display format
function formatTagsForDisplay(tags) {
    if (!tags) return '';
    
    // If tags is a string that looks like an array, try to parse it
    if (typeof tags === 'string') {
        try {
            // Check if it's a JSON array string like '["ran"]'
            if (tags.startsWith('[') && tags.endsWith(']')) {
                const parsed = JSON.parse(tags);
                return Array.isArray(parsed) ? parsed.join(', ') : tags;
            }
            // If it's a regular string, return as is
            return tags;
        } catch (e) {
            // If parsing fails, return the original string
            return tags;
        }
    }
    
    // If tags is already an array, join with commas
    if (Array.isArray(tags)) {
        return tags.join(', ');
    }
    
    // Fallback
    return String(tags);
}

// Helper function to safely get tags as array for processing
function getTagsAsArray(tags) {
    if (!tags) return [];
    
    // If tags is a string that looks like an array, try to parse it
    if (typeof tags === 'string') {
        try {
            if (tags.startsWith('[') && tags.endsWith(']')) {
                const parsed = JSON.parse(tags);
                return Array.isArray(parsed) ? parsed : [tags];
            }
            // If it's a comma-separated string, split it
            return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } catch (e) {
            return [tags];
        }
    }
    
    // If tags is already an array, return it
    if (Array.isArray(tags)) {
        return tags;
    }
    
    // Fallback
    return [String(tags)];
}

// Debounce search to prevent rapid API calls
function debounceSearch(query, isMobile = false) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(query.trim());
    }, 300);
}

function toggleMobileSearch() {
    const mobileSearchBar = document.getElementById('mobileSearchBar');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    mobileSearchActive = !mobileSearchActive;

    if (mobileSearchActive) {
        mobileSearchBar.classList.add('active');
        mobileSearchInput.focus();
    } else {
        mobileSearchBar.classList.remove('active');
        mobileSearchInput.value = '';
        clearSearchResults();
    }
}

function clearSearchResults() {
    const searchSection = document.getElementById('searchResultsSection');
    const resultsDiv = document.getElementById('searchResults');
    searchSection.style.display = 'none';
    resultsDiv.innerHTML = '';
    currentSearchQuery = '';
}

async function performSearch(query) {
    // Prevent duplicate searches
    if (query === currentSearchQuery || isSearching) {
        return;
    }

    const searchSection = document.getElementById('searchResultsSection');
    const resultsDiv = document.getElementById('searchResults');

    // Clear previous results first
    resultsDiv.innerHTML = '';

    if (!query) {
        clearSearchResults();
        return;
    }

    currentSearchQuery = query;
    isSearching = true;

    // Show loading state
    searchSection.style.display = 'block';
    resultsDiv.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const response = await fetch("/search", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({
                tags: query
            })
        });

        const data = await response.json();

        // Clear loading state
        resultsDiv.innerHTML = '';

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        if (!data.searchedNotes || !data.searchedNotes.length) {
            resultsDiv.innerHTML = '<div class="no-results">No public notes found with that tag.</div>';
            return;
        }

        displaySearchResults(data.searchedNotes);

    } catch (err) {
        console.error('Search error:', err);
        resultsDiv.innerHTML = `<div class="no-results">Search error: ${escapeHtml(err.message)}</div>`;
    } finally {
        isSearching = false;
    }
}

function displaySearchResults(notes) {
    const resultsDiv = document.getElementById('searchResults');

    // Create fresh grid for search results
    const grid = document.createElement('div');
    grid.className = 'notes-grid';

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        
        // Use helper function to safely display tags
        const tagsArray = getTagsAsArray(note.tags);
        
        card.innerHTML = `
            <span class="note-status">${note.isPublic ? "Public" : "Private"}</span>
            <div class="note-title">${escapeHtml(note.name || 'Untitled')}</div>
            <div class="note-content">${escapeHtml(note.content || '')}</div>
            <div class="note-author">
                By: ${escapeHtml(note.owner?.username || 'Unknown User')}
            </div>
            ${createFileAttachmentsHTML(note.files)}
            <div class="bottom-bar">
                <div class="note-tags">
                    ${tagsArray.length
                        ? tagsArray.map(tag => `<span class="note-tag" title="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`).join('')
                        : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    resultsDiv.appendChild(grid);
}

// Helper function to escape HTML characters
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function fetchNotes() {
    const outputDiv = document.getElementById('output');

    try {
        outputDiv.innerHTML = '<div class="loading">Loading your notes...</div>';

        const response = await fetch('/get-user-notes', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const notes = data.notes || [];
        notesData = notes;

        // Clear loading state
        outputDiv.innerHTML = '';

        if (!notes.length) {
            outputDiv.innerHTML = '<div class="no-results">No notes found!</div>';
            return;
        }

        document.getElementById("Username").innerText = `${data.username || "User"}'s Notes`;

        displayUserNotes(notes);

    } catch (err) {
        console.error('Fetch notes error:', err);
        outputDiv.innerHTML = `<div class="no-results">Error fetching notes: ${escapeHtml(err.message)}</div>`;
    }
}

function displayUserNotes(notes) {
    const outputDiv = document.getElementById('output');
    const grid = document.createElement('div');
    grid.className = 'notes-grid';

    notes.forEach((note, index) => {
        const card = document.createElement('div');
        card.className = 'note-card';

        // Use helper function to safely display tags
        const tagsArray = getTagsAsArray(note.tags);

        card.innerHTML = `
            <span class="note-status">${note.isPublic ? "Public" : "Private"}</span>
            <div class="note-title">${escapeHtml(note.name || "Untitled")}</div>
            <div class="note-content">${escapeHtml(note.content || "")}</div>
            ${createFileAttachmentsHTML(note.files)}
            <div class="bottom-bar">
                <div class="note-tags">
                    ${tagsArray.length
                        ? tagsArray.map(tag => `<span class="note-tag" title="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`).join('')
                        : ''}
                </div>
                <div class="note-actions">
                    <button class="edit-btn" data-note-index="${index}">Edit</button>
                    <button class="delete-btn" data-note-id="${note._id}">Delete</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    // Add single event listener to the grid (event delegation)
    grid.addEventListener('click', handleNoteAction);

    outputDiv.appendChild(grid);
}

function handleNoteAction(e) {
    if (e.target.classList.contains('edit-btn')) {
        const noteIndex = parseInt(e.target.dataset.noteIndex);
        const note = notesData[noteIndex];
        if (note) {
            openEditModal(note);
        }
    } else if (e.target.classList.contains('delete-btn')) {
        const noteId = e.target.dataset.noteId;
        deleteNote(noteId);
    }
}

function openEditModal(note) {
    currentEditId = note._id;
    document.getElementById('editTitle').value = note.name || '';
    document.getElementById('editContent').value = note.content || '';
    // Use the helper function to safely format tags for the input field
    document.getElementById('editTags').value = formatTagsForDisplay(note.tags);
    document.getElementById('editPublic').checked = note.isPublic || false;
    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditId = null;
}

async function deleteNote(noteId) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
        const res = await fetch(`/delete-note/${noteId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to delete note");
        }

        // Refresh notes after successful deletion
        await fetchNotes();

    } catch (err) {
        console.error('Delete error:', err);
        alert(`Error deleting note: ${err.message}`);
    }
}

// Initialize save edit functionality
document.getElementById('saveEditBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    if (!currentEditId) {
        alert('No note selected for editing');
        return;
    }

    const updatedNote = {
        name: document.getElementById('editTitle').value.trim(),
        content: document.getElementById('editContent').value.trim(),
        tags: document.getElementById('editTags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t),
        isPublic: document.getElementById('editPublic').checked
    };

    try {
        const res = await fetch(`/update-note/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatedNote)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to update note");
        }

        closeModal();
        await fetchNotes();

    } catch (err) {
        console.error('Update error:', err);
        alert(`Error updating note: ${err.message}`);
    }
});

// Clear search results when input is cleared
function setupSearchInputListeners() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    searchInput.addEventListener('input', function () {
        if (!this.value.trim()) {
            clearSearchResults();
        }
    });

    mobileSearchInput.addEventListener('input', function () {
        if (!this.value.trim()) {
            clearSearchResults();
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    fetchNotes();
    setupSearchInputListeners();
});

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});