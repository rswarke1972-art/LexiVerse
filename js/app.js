document.addEventListener("click", function (e) {
    if (e.target.classList.contains("word-btn")) {
        openModal(e.target.dataset.word);
    }
});

function goHome() {
    window.location.href = "index.html";
}

function resumeReading() {
    localStorage.setItem("lexiverse_start_mode", "resume");
    window.location.href = "story.html";
}

function startNew() {
    localStorage.setItem("lexiverse_start_mode", "new");
    window.location.href = "story.html";
}

function openInfo(id) {
    document.getElementById(id).style.display = "flex";
}

function closeInfo(id) {
    document.getElementById(id).style.display = "none";
}

window.addEventListener("click", function (e) {
    if (e.target.classList.contains("info-modal")) {
        e.target.style.display = "none";
    }
});