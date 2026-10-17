// Select HTML elements
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");
const clearAllButton = document.querySelector("#clear-all-btn");

// Load saved notes or start with an empty array
let notes = [];

try {
    const savedNotes = localStorage.getItem("quicknotes-notes");

    if (savedNotes !== null) {
        const parsedNotes = JSON.parse(savedNotes);

        if (Array.isArray(parsedNotes)) {
            notes = parsedNotes.filter(note =>
                note &&
                typeof note.id === "string" &&
                typeof note.text === "string" &&
                ["personal", "work", "study"].includes(note.category) &&
                typeof note.createdAt === "string"
            );
        }
    }
} catch (error) {
    console.error("Could not load saved notes:", error);
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem("quicknotes-notes", JSON.stringify(notes));
}

// Update the notes count
function updateCount() {
    if (notes.length === 0) {
        noteCount.textContent = "You have no notes yet.";
    } else if (notes.length === 1) {
        noteCount.textContent = "You have 1 note.";
    } else {
        noteCount.textContent = `You have ${notes.length} notes.`;
    }
}

// Render the notes list
function render() {
    // Clear the existing list
    notesList.replaceChildren();

    // Search is case-insensitive
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm)
    );

    // Show a message if no notes match the search
    if (filteredNotes.length === 0 && searchTerm !== "") {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No notes match your search.";
        notesList.appendChild(emptyItem);
    } else if (filteredNotes.length === 0 && notes.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No notes yet. Add your first note!";
        notesList.appendChild(emptyItem);
    }

    // Create each note card
    filteredNotes.forEach(note => {
        const listItem = document.createElement("li");
        listItem.classList.add(
            "note-card",
            `category-${note.category}`
        );

        const textElement = document.createElement("p");
        textElement.classList.add("note-text");
        textElement.textContent = note.text;

        const categoryElement = document.createElement("span");
        categoryElement.classList.add("note-category");
        categoryElement.textContent = note.category;

        const dateElement = document.createElement("time");
        dateElement.classList.add("note-date");
        dateElement.textContent = note.createdAt;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        // Delete this specific note
        deleteButton.addEventListener("click", function () {
            notes = notes.filter(item => item.id !== note.id);
            saveNotes();
            updateCount();
            render();
        });

        listItem.appendChild(textElement);
        listItem.appendChild(categoryElement);
        listItem.appendChild(dateElement);
        listItem.appendChild(deleteButton);

        notesList.appendChild(listItem);
    });

    updateCount();
}

// Validate and add a note
noteForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = noteInput.value.trim();
    const category = noteCategory.value;

    // Validate empty notes
    if (text.length === 0) {
        errorMessage.textContent = "Please type a note first.";
        noteInput.focus();
        return;
    }

    // Validate maximum length
    if (text.length > 200) {
        errorMessage.textContent =
            "Notes must be 200 characters or fewer.";
        noteInput.focus();
        return;
    }

    // Clear the error message
    errorMessage.textContent = "";

    // Create the note object
    const newNote = {
        id: crypto.randomUUID(),
        text: text,
        category: category,
        createdAt: new Date().toLocaleString()
    };

    // Add the note to the array
    notes.unshift(newNote);

    // Save and refresh the display
    saveNotes();
    noteForm.reset();
    render();
    noteInput.focus();
});

// Search notes as the user types
searchInput.addEventListener("input", function () {
    render();
});

// Optional bonus: clear all notes after confirmation
clearAllButton.addEventListener("click", function () {
    if (notes.length === 0) {
        return;
    }

    if (confirm("Delete all notes?")) {
        notes = [];
        saveNotes();
        errorMessage.textContent = "";
        render();
    }
});

// Display saved notes on page load
render();
