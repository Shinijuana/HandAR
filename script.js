const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

let isFrontCamera = false; // Indica se la fotocamera attiva è quella frontale

// 📌 Imposta la fotocamera (posteriore o frontale)
async function startCamera(facingMode = 'environment') {
    let constraints = {
        video: {
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight },
            facingMode: { ideal: facingMode } // Cambia la fotocamera in base alla scelta
        }
    };

    try {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            adjustCanvasSize();
        };
    } catch (err) {
        console.error("Errore accesso webcam:", err);
    }
}

// 📌 Adatta il canvas alle dimensioni dello schermo
function adjustCanvasSize() {
    canvasElement.width = videoElement.videoWidth || window.innerWidth;
    canvasElement.height = videoElement.videoHeight || window.innerHeight;

    // Se la fotocamera è frontale, specchiamo l'immagine
    if (isFrontCamera) {
        videoElement.style.transform = 'scaleX(-1)';
    } else {
        videoElement.style.transform = 'scaleX(1)';
    }
}

// 📌 Configura MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 📌 Usa il video come input per MediaPipe
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: window.innerWidth,
    height: window.innerHeight
});
camera.start();

// 📌 Disegna le mani in modo allineato
hands.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', radius: .5 });
        }
    }
});

// 📌 Aggiungi il bottone per passare dalla fotocamera frontale a quella posteriore
document.getElementById('toggleCameraBtn').addEventListener('click', toggleCamera);

// 📌 Funzione per cambiare fotocamera
async function toggleCamera() {
    const newFacingMode = isFrontCamera ? 'environment' : 'user';
    isFrontCamera = !isFrontCamera;
    await startCamera(newFacingMode);
}

// Inizializza la fotocamera con la modalità "environment" di default
startCamera('environment');
