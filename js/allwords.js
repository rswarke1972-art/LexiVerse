let wordList = [];

function goHome() {
    window.location.href = "index.html";
}

fetch("js/word_list.json")
    .then(response => response.json())
    .then(data => {
        wordList = data;
        renderWords();
    })
    .catch(error => {
        console.error("Error loading word list:", error);
    });

function renderWords() {

    const grid = document.getElementById("wordsGrid");
    grid.innerHTML = ""; // Clear existing contents

    wordList.forEach(word => {

        const btn = document.createElement("button");
        btn.className = "word-grid-btn";
        btn.innerText = word;

        btn.onclick = () => openModal(word);

        grid.appendChild(btn);
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