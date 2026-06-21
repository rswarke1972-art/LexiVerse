let questionsList = [];
let currentIndex = parseInt(localStorage.getItem("lexiverse_grammar_question_index") || "0");
let streak = parseInt(localStorage.getItem("lexiverse_grammar_streak") || "0");
let completed = parseInt(localStorage.getItem("lexiverse_grammar_completed") || "0");
let correctCount = parseInt(localStorage.getItem("lexiverse_grammar_correct") || "0");

let currentQuestion = null;
let isAnswered = false;

// Type 1 (Rearrange) State
let wordState = [];   // [{ text: "word", id: 0 }]
let assembledIds = []; // [id1, id2, ...]

// Type 2 & 3 State
let selectedOptionIndex = -1;

function goHome() {
    window.location.href = "index.html";
}

// Fetch questions
fetch("js/grammar_questions.json")
    .then(response => response.json())
    .then(data => {
        questionsList = data;
        updateUIStats();
        loadQuestion();
    })
    .catch(error => {
        console.error("Error loading grammar questions:", error);
        document.getElementById("grammar-feedback").innerText = "Error loading questions. Please reload.";
    });

// Load the current question
function loadQuestion() {
    if (questionsList.length === 0) return;

    if (currentIndex >= questionsList.length) {
        showVictoryScreen();
        return;
    }

    currentQuestion = questionsList[currentIndex];
    isAnswered = false;
    selectedOptionIndex = -1;
    assembledIds = [];
    wordState = [];

    // Clear feedback
    const feedbackEl = document.getElementById("grammar-feedback");
    feedbackEl.innerHTML = "";
    feedbackEl.className = "feedback-msg";

    // Setup action buttons
    document.getElementById("grammar-check-btn").classList.remove("hidden");
    document.getElementById("grammar-next-btn").classList.add("hidden");

    // Update Counter & Difficulty Badge
    document.getElementById("question-counter").innerText = `Question ${currentIndex + 1} of ${questionsList.length}`;
    
    const badge = document.getElementById("difficulty-badge");
    badge.innerText = currentQuestion.difficulty;
    badge.className = "diff-badge"; // reset classes
    if (currentQuestion.difficulty === "easy") {
        badge.classList.add("diff-easy");
    } else if (currentQuestion.difficulty === "medium") {
        badge.classList.add("diff-medium");
    } else {
        badge.classList.add("diff-hard");
    }

    // Update Progress Bar
    const progressFill = document.getElementById("progress-fill");
    const progressPercent = (currentIndex / questionsList.length) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // Render by type
    const instructionEl = document.getElementById("instruction-text");
    instructionEl.innerText = currentQuestion.instruction;

    if (currentQuestion.type === 1) {
        document.getElementById("rearrange-area").classList.remove("hidden");
        document.getElementById("choice-area").classList.add("hidden");
        
        // Prepare words
        currentQuestion.scrambledWords.forEach((word, index) => {
            wordState.push({ text: word, id: index });
        });
        renderRearrange();
    } else {
        document.getElementById("rearrange-area").classList.add("hidden");
        document.getElementById("choice-area").classList.remove("hidden");

        // Set prompt
        const promptEl = document.getElementById("grammar-prompt");
        if (currentQuestion.type === 2) {
            promptEl.innerHTML = currentQuestion.sentence.replace("___", `<span style="color: #ff3b3b; font-weight: bold; border-bottom: 2px dashed #ff3b3b; padding: 0 10px;">___</span>`);
        } else {
            promptEl.innerText = "Select the grammatically correct sentence:";
        }

        // Render Options Grid
        const grid = document.getElementById("options-grid");
        grid.innerHTML = "";

        const letters = ["A", "B", "C", "D"];
        currentQuestion.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "grammar-option-btn";
            btn.id = `option-${idx}`;
            btn.innerHTML = `<span class="option-letter">${letters[idx]}</span> ${opt}`;
            btn.onclick = () => selectOption(idx);
            grid.appendChild(btn);
        });
    }
}

// ==========================================
// TYPE 1: REARRANGE sentence rendering
// ==========================================
function renderRearrange() {
    const scrambledContainer = document.getElementById("scrambled-words");
    const assembledContainer = document.getElementById("assembled-words");

    scrambledContainer.innerHTML = "";
    assembledContainer.innerHTML = "";

    // Highlight assembled container if populated
    if (assembledIds.length > 0) {
        assembledContainer.classList.add("active");
    } else {
        assembledContainer.classList.remove("active");
    }

    // Render scrambled words
    wordState.forEach(word => {
        if (!assembledIds.includes(word.id)) {
            const tile = document.createElement("div");
            tile.className = "word-tile";
            tile.innerText = word.text;
            tile.onclick = () => {
                if (isAnswered) return;
                assembledIds.push(word.id);
                renderRearrange();
            };
            scrambledContainer.appendChild(tile);
        }
    });

    // Render assembled words in order
    assembledIds.forEach(id => {
        const word = wordState.find(w => w.id === id);
        if (word) {
            const tile = document.createElement("div");
            tile.className = "word-tile";
            tile.innerText = word.text;
            tile.onclick = () => {
                if (isAnswered) return;
                assembledIds = assembledIds.filter(item => item !== id);
                renderRearrange();
            };
            assembledContainer.appendChild(tile);
        }
    });
}

function clearAssembly() {
    if (isAnswered) return;
    assembledIds = [];
    renderRearrange();
}

// ==========================================
// TYPE 2 & 3: CHOICE selection
// ==========================================
function selectOption(index) {
    if (isAnswered) return;

    selectedOptionIndex = index;
    
    // Toggle active styles
    document.querySelectorAll(".grammar-option-btn").forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

// ==========================================
// CHECK ANSWER Evaluation
// ==========================================
function checkAnswer() {
    if (isAnswered) return;

    const feedbackEl = document.getElementById("grammar-feedback");
    let isCorrect = false;

    if (currentQuestion.type === 1) {
        // Rearrange check
        if (assembledIds.length === 0) return; // do nothing if empty

        const userWords = assembledIds.map(id => wordState.find(w => w.id === id).text);
        const userSentence = userWords.join(" ");

        // Normalize both strings for comparison (remove punctuation, lower case)
        const normalize = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim();
        
        isCorrect = normalize(userSentence) === normalize(currentQuestion.correctSentence);
        isAnswered = true;

        if (isCorrect) {
            feedbackEl.innerHTML = "Correct! Spot on! 🎉";
            feedbackEl.className = "feedback-msg correct";
            streak++;
            correctCount++;
        } else {
            feedbackEl.innerHTML = `Incorrect. The correct sentence is:<br><span style="font-size: 17px; font-weight: bold; color: white; display: block; margin-top: 8px;">${currentQuestion.correctSentence}</span>`;
            feedbackEl.className = "feedback-msg incorrect";
            streak = 0;
        }

    } else {
        // Choice check (Type 2 & 3)
        if (selectedOptionIndex === -1) return; // select an option first

        isAnswered = true;
        const selectedText = currentQuestion.options[selectedOptionIndex];
        const correctText = currentQuestion.correctOption;

        isCorrect = selectedText === correctText;

        // Highlight options in UI
        currentQuestion.options.forEach((opt, idx) => {
            const btn = document.getElementById(`option-${idx}`);
            btn.classList.remove("selected");
            if (opt === correctText) {
                btn.classList.add("correct");
            } else if (idx === selectedOptionIndex) {
                btn.classList.add("incorrect");
            }
        });

        if (isCorrect) {
            feedbackEl.innerHTML = "Correct! Well done! 🎉";
            feedbackEl.className = "feedback-msg correct";
            streak++;
            correctCount++;
        } else {
            feedbackEl.innerHTML = `Incorrect. The correct answer was: <strong>${correctText}</strong>`;
            feedbackEl.className = "feedback-msg incorrect";
            streak = 0;
        }
    }

    completed++;

    // Save progress to local storage
    localStorage.setItem("lexiverse_grammar_question_index", currentIndex);
    localStorage.setItem("lexiverse_grammar_streak", streak);
    localStorage.setItem("lexiverse_grammar_completed", completed);
    localStorage.setItem("lexiverse_grammar_correct", correctCount);

    updateUIStats();

    // Toggle actions
    document.getElementById("grammar-check-btn").classList.add("hidden");
    document.getElementById("grammar-next-btn").classList.remove("hidden");
    document.getElementById("grammar-next-btn").focus();
}

function loadNextQuestion() {
    currentIndex++;
    localStorage.setItem("lexiverse_grammar_question_index", currentIndex);
    loadQuestion();
}

function updateUIStats() {
    document.getElementById("grammar-streak-val").innerText = streak;
    document.getElementById("grammar-completed-val").innerText = completed;

    const accuracy = completed > 0 ? Math.round((correctCount / completed) * 100) : 0;
    document.getElementById("grammar-accuracy-val").innerText = `${accuracy}%`;
}

function showVictoryScreen() {
    const card = document.querySelector(".grammar-card");
    card.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
            <h1 style="color: #ff3b3b; font-size: 50px; margin-bottom: 20px;">🏆 VICTORY!</h1>
            <p style="font-size: 20px; line-height: 1.6; margin-bottom: 30px;">
                Congratulations! You have completed all 2,100 grammar questions in LexiVerse!
            </p>
            <div class="practice-stats" style="margin-bottom: 40px; border-bottom: 1px solid #222; padding-bottom: 20px;">
                <div class="stat-item">Final Streak: <span>${streak}</span> 🔥</div>
                <div class="stat-item">Accuracy: <span>${completed > 0 ? Math.round((correctCount / completed) * 100) : 0}%</span></div>
                <div class="stat-item">Total Completed: <span>${completed}</span></div>
            </div>
            <button class="action-btn check-btn" onclick="resetGrammarGame()">PLAY AGAIN</button>
        </div>
    `;
}

function resetGrammarGame() {
    if (confirm("Are you sure you want to reset all your progress and start over?")) {
        currentIndex = 0;
        streak = 0;
        completed = 0;
        correctCount = 0;

        localStorage.setItem("lexiverse_grammar_question_index", 0);
        localStorage.setItem("lexiverse_grammar_streak", 0);
        localStorage.setItem("lexiverse_grammar_completed", 0);
        localStorage.setItem("lexiverse_grammar_correct", 0);

        window.location.reload();
    }
}

// ==========================================
// Keyboard Event Listeners & Initializers
// ==========================================
document.addEventListener("keydown", function(e) {
    // Enter key submits/advances
    if (e.key === "Enter") {
        const checkBtn = document.getElementById("grammar-check-btn");
        const nextBtn = document.getElementById("grammar-next-btn");
        
        if (!checkBtn.classList.contains("hidden")) {
            checkAnswer();
        } else if (!nextBtn.classList.contains("hidden")) {
            loadNextQuestion();
        }
    }

    // Number keys select choices in Type 2 & 3
    if (!isAnswered && currentQuestion && currentQuestion.type !== 1) {
        if (e.key === "1" || e.key.toLowerCase() === "a") selectOption(0);
        if (e.key === "2" || e.key.toLowerCase() === "b") selectOption(1);
        if (e.key === "3" || e.key.toLowerCase() === "c") selectOption(2);
        if (e.key === "4" || e.key.toLowerCase() === "d") selectOption(3);
    }
});
