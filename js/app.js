function goHome() {
    window.location.href = "index.html";
}

// Global word data holder (cached and loaded dynamically)
if (typeof wordData === "undefined") {
    var wordData = window.wordData || {};
}
  
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("word-btn")) {
        openModal(e.target.dataset.word);
    }
});

function resumeReading() {
    localStorage.setItem("lexiverse_start_mode", "resume");
    window.location.href = "story.html";
}

function startNew() {
    localStorage.setItem("lexiverse_start_mode", "new");
    window.location.href = "story.html";
}

function openInfo(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
}

function closeInfo(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function goToSelectPassage() {
    window.location.href = "select.html";
}

window.addEventListener("click", function (e) {
    if (e.target.classList.contains("info-modal")) {
        e.target.style.display = "none";
    }
});

const showAllWordsBtn = document.getElementById("showAllWordsBtn");
if (showAllWordsBtn) {
    showAllWordsBtn.addEventListener("click", function() {
        const container = document.getElementById("allWordsContainer");
        if (!container) return;
        container.innerHTML = "";  // Clear previous list

        Object.keys(wordData).forEach(word => {
            const wordBtn = document.createElement("button");
            wordBtn.innerText = word;
            wordBtn.className = "word-list-btn";
            wordBtn.onclick = () => openModal(word);  // Same modal as passages
            container.appendChild(wordBtn);
        });
    });
}

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then((reg) => console.log("LexiVerse PWA Service Worker registered!", reg.scope))
            .catch((err) => console.error("Service Worker registration failed:", err));
    });
}