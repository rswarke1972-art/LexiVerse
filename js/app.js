function goHome() {
    window.location.href = "index.html";
}


fetch("js/words.json")
  .then(response => response.json())
  .then(data => {
      wordData = data;

  });
  
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

function goToSelectPassage() {
    window.location.href = "select.html";
}

window.addEventListener("click", function (e) {
    if (e.target.classList.contains("info-modal")) {
        e.target.style.display = "none";
    }
});

document.getElementById("showAllWordsBtn").addEventListener("click", function() {
    const container = document.getElementById("allWordsContainer");
    container.innerHTML = "";  // Clear previous list

    Object.keys(wordData).forEach(word => {
        const wordBtn = document.createElement("button");
        wordBtn.innerText = word;
        wordBtn.className = "word-list-btn";
        wordBtn.onclick = () => openModal(word);  // Same modal as passages
        container.appendChild(wordBtn);
    });
});