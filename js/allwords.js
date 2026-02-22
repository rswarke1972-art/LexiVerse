let wordData;

function goHome() {
    window.location.href = "index.html";
}

fetch("js/words.json")
    .then(response => response.json())
    .then(data => {
        wordData = data;
        renderWords();
    })
    .catch(error => {
        console.error("Error loading words:", error);
    });

function renderWords() {

    const grid = document.getElementById("wordsGrid");

    Object.keys(wordData).forEach(word => {

        const btn = document.createElement("button");
        btn.className = "word-btn";
        btn.innerText = word;

        btn.onclick = () => openModal(word);

        grid.appendChild(btn);
    });
}