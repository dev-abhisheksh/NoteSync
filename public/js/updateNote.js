document.getElementById('editNoteForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const output = document.getElementById('editNoteOutput');

    const noteId = e.target.noteId.value; // Hidden input
    const title = e.target.title.value.trim();
    const content = e.target.content.value.trim();

    if (!noteId || !title || !content) {
        output.textContent = "Please fill all fields.";
        return;
    }

    try {
        const response = await fetch(`https://notesync-0m77.onrender.com/api/update-note/${noteId}`, {
            method: 'PATCH', // PATCH for updating
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();
        output.textContent = data.message || JSON.stringify(data, null, 2);

    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
});
