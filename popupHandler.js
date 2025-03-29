// Funzione per aprire il popup
function openPopup() {
    window.open("https://designopenspaces.it/", "popup", "width=800,height=600");
}

// Funzione che viene chiamata da `handTracking.js` quando il pinch è rilevato
function triggerPopup() {
    openPopup();
}
