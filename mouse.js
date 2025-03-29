document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.createElement("video");
    videoElement.style.position = "absolute";
    videoElement.style.top = "-1000px"; // Nasconde il video
    document.body.appendChild(videoElement);

    let cursor = document.createElement("div");
    cursor.style.width = "10px";
    cursor.style.height = "10px";
    cursor.style.backgroundColor = "red";
    cursor.style.position = "absolute";
    cursor.style.borderRadius = "50%";
    cursor.style.pointerEvents = "none";
    document.body.appendChild(cursor);

    async function startCamera() {
        const constraints = { video: { facingMode: "user" } };
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            videoElement.play();
        } catch (err) {
            console.error("Errore fotocamera:", err);
        }
    }

    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`
    });
    
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        }
    });
    camera.start();

    let pinchActive = false;

    hands.onResults((results) => {
        if (results.multiHandLandmarks) {
            const landmarks = results.multiHandLandmarks[0];
            if (!landmarks) return;

            let indexTip = landmarks[8];
            let thumbTip = landmarks[4];

            let x = indexTip.x * window.innerWidth;
            let y = indexTip.y * window.innerHeight;

            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;

            if (isPinching(landmarks) && !pinchActive) {
                pinchActive = true;
                console.log(`Click simulato a (${x}, ${y})`);
                simulateClick(x, y);
                setTimeout(() => { pinchActive = false; }, 300);
            }
        }
    });

    function isPinching(landmarks) {
        let thumbTip = landmarks[4];
        let indexTip = landmarks[8];
        let distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        return distance < 0.05;
    }

    function simulateClick(x, y) {
        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });
        document.elementFromPoint(x, y)?.dispatchEvent(event);
    }

    startCamera();
});
