// Make sure your wordData object is already loaded before this runs

function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2); // Pretty format
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

// Run this in console after page loads
downloadJSON(wordData, "words.json");