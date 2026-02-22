let wordData; // only here
let currentStoryIndex = 0;

fetch("js/words.json")
  .then(response => response.json())
  .then(data => {
      wordData = data;

      // After JSON loads, start the app
      startApp();
  })
  .catch(error => {
      console.error("Error loading words.json:", error);
  });

function startApp() {

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    const startMode = localStorage.getItem("lexiverse_start_mode");

    if (startMode === "new") {
        currentStoryIndex = 0;
        localStorage.setItem("lexiverse_current_story", 0);
        localStorage.removeItem("lexiverse_start_mode");
    } else {
        const savedIndex = localStorage.getItem("lexiverse_current_story");
        currentStoryIndex = savedIndex ? parseInt(savedIndex) : 0;
    }

    function loadStory(index) {

        currentStoryIndex = index;
        localStorage.setItem("lexiverse_current_story", index);

        const story = passages[index];

        document.getElementById("story-title").innerText = story.title;
        document.getElementById("story-subtitle").innerText = story.subtitle;
        document.getElementById("story-content").innerHTML = story.content;

        prevBtn.disabled = currentStoryIndex === 0;
        nextBtn.disabled = currentStoryIndex === passages.length - 1;
    }

    nextBtn.addEventListener("click", function () {
        if (currentStoryIndex < passages.length - 1) {
            loadStory(currentStoryIndex + 1);
        }
    });

    prevBtn.addEventListener("click", function () {
        if (currentStoryIndex > 0) {
            loadStory(currentStoryIndex - 1);
        }
    });

    loadStory(currentStoryIndex);
}