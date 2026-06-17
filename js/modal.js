// modal.js
let availableVoices = [];

function loadVoices() {
    availableVoices = speechSynthesis.getVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;

async function openModal(word) {

    const modal = document.getElementById("wordModal");
    const modalBody = document.getElementById("modalBody");
    const cleanWord = word.toLowerCase().trim();

    if (!cleanWord) return;

    // Ensure the modal is active and showing a loading indicator
    modalBody.innerHTML = `<p style="padding: 20px; text-align: center; color: #aaa;">Loading details for "${word}"...</p>`;
    modal.classList.add("active");

    // Resolve wordData reference (checking local variables and window object)
    let currentData = null;
    if (typeof wordData !== "undefined" && wordData) {
        currentData = wordData;
    } else if (window.wordData) {
        currentData = window.wordData;
    } else {
        window.wordData = {};
        currentData = window.wordData;
    }

    // Dynamic fetch if word is not yet cached
    if (!currentData[cleanWord]) {
        const firstLetter = cleanWord[0];
        const jsonPath = `js/${firstLetter.toUpperCase()}.json`;

        try {
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`Word file not found (${response.status})`);
            }
            const fileData = await response.json();
            Object.assign(currentData, fileData);
        } catch (error) {
            console.error(`Error loading word data for ${word}:`, error);
            modalBody.innerHTML = `
                <span class="close-btn" onclick="closeModal()">&times;</span>
                <div class="modal-section" style="padding: 20px;">
                    <h2 class="modal-word-title">${word.toUpperCase()}</h2>
                    <p style="color: #ff3b3b; font-weight: bold; margin-bottom: 10px;">Error: Details could not be loaded.</p>
                    <p style="color: #aaa; font-size: 14px;">Reason: ${error.message}</p>
                    <p style="color: #888; font-size: 13px; margin-top: 15px;">The database file for letter "${firstLetter.toUpperCase()}" may not exist yet.</p>
                </div>
            `;
            return;
        }
    }

    const data = currentData[cleanWord];
    if (!data) {
        modalBody.innerHTML = `
            <span class="close-btn" onclick="closeModal()">&times;</span>
            <p style="padding: 20px; text-align: center;">Word data not found for "${word}".</p>
        `;
        return;
    }

    // ===== BUILD EVOLUTION HTML FIRST =====
    let evolutionHTML = `
        <div class="modal-section evolution-section">
            <p><strong>Evolution:</strong></p>
    `;

    data.evolution.forEach((step, index) => {

        evolutionHTML += `
            <div class="evolution-step">
                <div class="evolution-period">${step.period}</div>
                <div class="evolution-form"><em>${step.form}</em></div>
                <div class="evolution-meaning">"${step.meaning}"</div>
                <div class="evolution-usage">${step.usage}</div>
            </div>
        `;

        if (index < data.evolution.length - 1) {
            evolutionHTML += `<div class="evolution-arrow">↓</div>`;
        }
    });

    evolutionHTML += `
        <div class="evolution-line">
            ${data.evolution.map(step => step.form).join(" → ")}
        </div>
    </div>
    `;

    // ===== BUILD FULL MODAL CONTENT =====
    modalBody.innerHTML = `
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <h2 class="modal-word-title">${word.toUpperCase()}</h2>
        <p class="modal-ipa">${data.ipa || ""}</p>
        <button onclick="pronounceWord('${word}', 'us')">🔊 🇺🇸 US</button>
        <button onclick="pronounceWord('${word}', 'uk')">🔊 🇬🇧 UK</button>
        <button onclick="pronounceWord('${word}', 'in')">🔊 🇮🇳 IN</button>

        <div class="modal-section" style="margin-top: 20px;">
            <p><strong>Meaning:</strong> ${data.meaning}</p>
        </div>

        <div class="modal-section">
            <p><strong>Synonyms:</strong> ${data.synonyms.join(", ")}</p>
        </div>

        <div class="modal-section">
            <p><strong>Antonyms:</strong> ${data.antonyms.join(", ")}</p>
        </div>

        <div class="modal-section examples-section">
            <p><strong>Examples:</strong></p>
            <ul>
                <li>${data.examples[0]}</li>
                <li>${data.examples[1]}</li>
            </ul>
        </div>

        ${evolutionHTML}
    `;
}

function pronounceWord(word, accent = "us") {

    const utterance = new SpeechSynthesisUtterance(word);
    const voices = speechSynthesis.getVoices();

    let selectedVoice;

    if (accent === "uk") {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes("gb"));
    }
    else if (accent === "in") {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes("in"));
    }
    else {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes("us"));
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

// Close Modal
function closeModal() {
    document.getElementById("wordModal").classList.remove("active");
}


// Close Button Click
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("close-btn")) {
        closeModal();
    }
});


// Click Outside to Close
window.addEventListener("click", function (e) {
    const modal = document.getElementById("wordModal");
    if (e.target === modal) {
        closeModal();
    }
});


// ESC Key to Close
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal();
    }
});