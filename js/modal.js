// modal.js

function openModal(word) {

    const modal = document.getElementById("wordModal");
    const modalBody = document.getElementById("modalBody");

    const data = wordData[word];

    // Safety check
    if (!data) {
        modalBody.innerHTML = "<p>Word data not found.</p>";
        modal.classList.add("active");
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
        <h2 class="modal-word-title">${word.toUpperCase()}</h2>

        <div class="modal-section">
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

    modal.classList.add("active");
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