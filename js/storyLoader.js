let currentStoryIndex = 0;

document.addEventListener("DOMContentLoaded", function () {

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    // 🔥 Determine whether OPEN or NEW was clicked
    const startMode = localStorage.getItem("lexiverse_start_mode");

    if (startMode === "new") {
        currentStoryIndex = 0;
        localStorage.setItem("lexiverse_current_story", 0);
        localStorage.removeItem("lexiverse_start_mode");
    } else {
        const savedIndex = localStorage.getItem("lexiverse_current_story");
        currentStoryIndex = savedIndex ? parseInt(savedIndex) : 0;
    }

    function updateButtons() {
        prevBtn.disabled = currentStoryIndex === 0;
        nextBtn.disabled = currentStoryIndex === passages.length - 1;
    }

    function loadStory(index) {

        currentStoryIndex = index;

        // Save progress
        localStorage.setItem("lexiverse_current_story", index);

        const story = passages[index];

        document.getElementById("story-title").innerText = story.title;
        document.getElementById("story-subtitle").innerText = story.subtitle;
        document.getElementById("story-content").innerHTML = story.content;

        // 🔥 IMPORTANT: Update button state AFTER loading
        prevBtn.disabled = currentStoryIndex === 0;
        nextBtn.disabled = currentStoryIndex === passages.length - 1;
    }

    nextBtn.addEventListener("click", function () {
        if (currentStoryIndex < passages.length - 1) {
            currentStoryIndex++;
            loadStory(currentStoryIndex);
        }
    });

    prevBtn.addEventListener("click", function () {
        if (currentStoryIndex > 0) {
            currentStoryIndex--;
            loadStory(currentStoryIndex);
        }
    });

    // 🔥 Now load correct story
    loadStory(currentStoryIndex);
});