 const videoElement = document.getElementById('video');
        const canvasElement = document.getElementById('output');
        const canvasCtx = canvasElement.getContext('2d');

        let videoWidth = window.innerWidth;
        let videoHeight = window.innerHeight;
        let pinchActive = false; // ✅ Spostato all'esterno per evitare reset continui

        // 📌 Avvia la fotocamera
        async function startCamera() {
            const constraints = {
                video: {
                    width: { ideal: videoWidth },
                    height: { ideal: videoHeight },
                    facingMode: { ideal: 'environment' }
                }
            };

            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                videoElement.srcObject = stream;
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    adjustCanvasSize();
                };
            } catch (err) {
                console.error("Errore fotocamera:", err);
            }
        }

        function adjustCanvasSize() {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
        }

        // 📌 Impostazione di MediaPipe Hands
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: window.innerWidth,
            height: window.innerHeight
        });
        camera.start();

        // ✅ Click sul bottone manuale
        document.getElementById("openPopup").addEventListener("click", () => {
            window.open("https://designopenspaces.it/", "popup", "width=800,height=600");
        });
        

    hands.onResults((results) => {
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks) {
            results.multiHandLandmarks.forEach((landmarks) => {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
                drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', radius: 5 });

                if (isPinching(landmarks) && !pinchActive) {
                    const pinchX = landmarks[8].x * window.innerWidth;
                    const pinchY = landmarks[8].y * window.innerHeight;

                    const buttonRect = document.getElementById("openPopup").getBoundingClientRect();
                    
                    if (
                        pinchX >= buttonRect.left &&
                        pinchX <= buttonRect.right &&
                        pinchY >= buttonRect.top &&
                        pinchY <= buttonRect.bottom
                    ) {
                        pinchActive = true;
                        console.log("✅ Pinch sul bottone! Aprendo il popup...");
                        window.open("https://designopenspaces.it/", "popup", "width=800,height=600");

                        setTimeout(() => { pinchActive = false; }, 300); // Reset dopo 300ms
                    }
                }
            });
        }
    });

    function isPinching(handLandmarks) {
        let thumbTip = handLandmarks[4]; // Punta del pollice
        let indexTip = handLandmarks[8]; // Punta dell'indice

        let distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );

        console.log("🔍 Distanza tra pollice e indice:", distance);
        return distance < 0.05; // Considera un pinch se la distanza è inferiore a una certa soglia
    }

        // 📌 Risoluzione dinamica
        window.addEventListener('resize', updateResolution);
        window.addEventListener('orientationchange', updateResolution);

        function updateResolution() {
            videoWidth = window.innerWidth;
            videoHeight = window.innerHeight;
            adjustCanvasSize();
            startCamera();
        }

        startCamera();
