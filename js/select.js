function goHome() {
    window.location.href = "index.html";
}

const passageList = document.getElementById("passageList");

passages.forEach((p, index) => {
    const btn = document.createElement("button");
    btn.className = "passage-btn";
    btn.innerText = `Passage ${index + 1} - ${p.title}`;
    
    btn.onclick = function () {
        localStorage.setItem("lexiverse_current_story", index);
        window.location.href = "story.html";
    };

    passageList.appendChild(btn);
});