let wordList = [];
let currentWord = "";
let currentAccent = "us";

// Stats
let streak = parseInt(localStorage.getItem("lexiverse_practice_streak") || "0");
let completed = parseInt(localStorage.getItem("lexiverse_practice_completed") || "0");
let correctCount = parseInt(localStorage.getItem("lexiverse_practice_correct") || "0");

function goHome() {
    window.location.href = "index.html";
}

// Fetch the word list
fetch("js/word_list.json")
    .then(response => response.json())
    .then(data => {
        wordList = data;
        updateUIStats();
        loadNextWord(true); // first load, do not autoplay voice immediately
    })
    .catch(error => {
        console.error("Error loading word list:", error);
        document.getElementById("feedback-msg").innerText = "Error loading words. Please try again.";
    });

// Accent controller
function setAccent(accent) {
    currentAccent = accent;
    // Update active class on buttons
    document.querySelectorAll(".accent-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`btn-${accent}`).classList.add("active");
    // Speak the word again in the new accent if we have a word
    if (currentWord) {
        speakCurrentWord();
    }
}

// Web Speech API Pronunciation
function speakCurrentWord() {
    if (!currentWord) return;

    const utterance = new SpeechSynthesisUtterance(currentWord);
    const voices = speechSynthesis.getVoices();
    let selectedVoice;

    if (currentAccent === "uk") {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes("gb") || v.lang.toLowerCase().includes("uk"));
    } else if (currentAccent === "in") {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes("in"));
    } else {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes("us") || v.lang.toLowerCase().includes("en-us"));
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.rate = 0.85; // slightly slower for spelling clarity

    utterance.onstart = () => {
        document.getElementById("speak-btn").classList.add("speaking");
    };
    utterance.onend = () => {
        document.getElementById("speak-btn").classList.remove("speaking");
    };
    utterance.onerror = () => {
        document.getElementById("speak-btn").classList.remove("speaking");
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

// Load Next Word
function loadNextWord(isInitial = false) {
    if (wordList.length === 0) return;

    // Reset input and UI state
    const inputField = document.getElementById("spelling-input");
    inputField.value = "";
    inputField.disabled = false;
    inputField.focus();

    const feedbackMsg = document.getElementById("feedback-msg");
    feedbackMsg.innerHTML = "";
    feedbackMsg.className = "feedback-msg";

    document.getElementById("check-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");

    // Select random word
    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex];

    // Speak the new word automatically if it's not the initial load
    if (!isInitial) {
        setTimeout(speakCurrentWord, 200);
    }
}

// Check spelling
function checkSpelling() {
    const inputVal = document.getElementById("spelling-input").value.trim().toLowerCase();
    if (!inputVal) return;

    completed++;
    const targetWord = currentWord.toLowerCase().trim();
    const feedbackMsg = document.getElementById("feedback-msg");
    const inputField = document.getElementById("spelling-input");

    inputField.disabled = true;
    document.getElementById("check-btn").classList.add("hidden");
    document.getElementById("next-btn").classList.remove("hidden");
    document.getElementById("next-btn").focus();

    if (inputVal === targetWord) {
        correctCount++;
        streak++;
        feedbackMsg.innerHTML = `Correct! Fantastic job! 🎉`;
        feedbackMsg.className = "feedback-msg correct";
        
        // Fetch vocabulary definition as a bonus learning step
        const firstLetter = targetWord[0];
        fetch(`js/${firstLetter.toUpperCase()}.json`)
            .then(res => res.json())
            .then(data => {
                const details = data[targetWord];
                if (details && details.meaning) {
                    feedbackMsg.innerHTML += `<div style="font-size: 14px; color: #ccc; font-weight: normal; margin-top: 10px; border-top: 1px solid #333; padding-top: 8px;"><strong>Meaning:</strong> ${details.meaning}</div>`;
                }
            }).catch(() => {});
    } else {
        streak = 0;
        feedbackMsg.innerHTML = `Incorrect. The correct spelling is: <span style="font-size: 20px; font-weight: bold; color: white; display: block; margin-top: 5px;">${currentWord}</span>`;
        feedbackMsg.className = "feedback-msg incorrect";
        
        // Fetch vocabulary definition even on incorrect guess to help learn
        const firstLetter = targetWord[0];
        fetch(`js/${firstLetter.toUpperCase()}.json`)
            .then(res => res.json())
            .then(data => {
                const details = data[targetWord];
                if (details && details.meaning) {
                    feedbackMsg.innerHTML += `<div style="font-size: 14px; color: #ccc; font-weight: normal; margin-top: 10px; border-top: 1px solid #333; padding-top: 8px;"><strong>Meaning:</strong> ${details.meaning}</div>`;
                }
            }).catch(() => {});
    }

    // Save state
    localStorage.setItem("lexiverse_practice_streak", streak);
    localStorage.setItem("lexiverse_practice_completed", completed);
    localStorage.setItem("lexiverse_practice_correct", correctCount);

    updateUIStats();
}

function updateUIStats() {
    document.getElementById("streak-val").innerText = streak;
    document.getElementById("completed-val").innerText = completed;

    const accuracy = completed > 0 ? Math.round((correctCount / completed) * 100) : 0;
    document.getElementById("accuracy-val").innerText = `${accuracy}%`;
}

// Event listener for enter key
document.getElementById("spelling-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        if (!document.getElementById("check-btn").classList.contains("hidden")) {
            checkSpelling();
        } else {
            loadNextWord();
        }
    }
});

// Ensure voices are loaded
if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        // pre-load voices
        speechSynthesis.getVoices();
    };
}
