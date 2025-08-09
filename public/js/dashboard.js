document.addEventListener("DOMContentLoaded", () => {
  const totalNotesEl = document.getElementById("totalNotes");
  const publicNotesEl = document.getElementById("publicNotes");
  const privateNotesEl = document.getElementById("privateNotes");
  const deletedNotesEl = document.getElementById("deletedNotes");
  const tableBody = document.getElementById("notesTableBody");

  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes", {
        method: "GET",
        credentials: "include", // send cookies (important if token stored in cookie)
        headers: {
          "Content-Type": "application/json",
          // Only needed if token stored in localStorage/sessionStorage instead of cookies:
          // "Authorization": "Bearer " + localStorage.getItem("accessToken")
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch notes: ${res.status}`);
      }

      const data = await res.json();
      const notes = data.notes || [];

      // Update stats
      totalNotesEl.textContent = notes.length;
      publicNotesEl.textContent = notes.filter(n => n.isPublic).length;
      privateNotesEl.textContent = notes.filter(n => !n.isPublic).length;

      // If you implement deletion in DB later, update deleted count accordingly
      deletedNotesEl.textContent = 0;

      // Populate table
      tableBody.innerHTML = "";
      if (notes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">No notes found</td></tr>`;
      } else {
        notes.forEach(note => {
          const tr = document.createElement("tr");

          // ID
          const idTd = document.createElement("td");
          idTd.textContent = note._id;

          // Title
          const nameTd = document.createElement("td");
          nameTd.textContent = note.name;

          // Tags
          const tagsTd = document.createElement("td");
          tagsTd.textContent = note.tags.join(", ");

          // Status
          const statusTd = document.createElement("td");
          statusTd.textContent = note.isPublic ? "Public" : "Private";

          // Actions
          const actionsTd = document.createElement("td");
          actionsTd.innerHTML = `
            <button onclick="viewNote('${note._id}')">View</button>
            <button onclick="editNote('${note._id}')">Edit</button>
            <button onclick="deleteNote('${note._id}')">Delete</button>
          `;

          tr.appendChild(idTd);
          tr.appendChild(nameTd);
          tr.appendChild(tagsTd);
          tr.appendChild(statusTd);
          tr.appendChild(actionsTd);

          tableBody.appendChild(tr);
        });
      }

    } catch (err) {
      console.error("Error loading notes:", err);
      tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error loading notes</td></tr>`;
    }
  }

  // Placeholder actions
  window.viewNote = (id) => {
    alert(`Viewing note ${id}`);
    // You can implement a redirect to /view-note.html?id=${id}
  };
  window.editNote = (id) => {
    window.location.href = `/edit-note.html?id=${id}`;
  };
  window.deleteNote = async (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        const res = await fetch(`/api/notes/${id}`, {
          method: "DELETE",
          credentials: "include"
        });
        const result = await res.json();
        alert(result.message);
        fetchNotes(); // reload after delete
      } catch (e) {
        console.error("Delete failed:", e);
      }
    }
  };

  // Load the notes when the dashboard opens
  fetchNotes();
});
