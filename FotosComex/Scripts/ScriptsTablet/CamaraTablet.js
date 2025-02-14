feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const screenshotImage = document.querySelector('img');
const buttons = [...controls.querySelectorAll('button')];
let streamStarted = false;
let currentStream = null;


const [play, pause, screenshot] = buttons;

const isMobileOrTablet = window.matchMedia('(max-width: 768px)').matches;
const constraints = isMobileOrTablet ? { video: { facingMode: { ideal: 'environment' }, width: { min: 1280, ideal: 1920, max: 2560 }, height: { min: 720, ideal: 1080, max: 1440 } } } : { video: { width: { min: 1280, ideal: 1920, max: 2560 }, height: { min: 720, ideal: 1080, max: 1440 } } } ;


cameraOptions.onchange = () => {
    event.preventDefault();
    const updatedConstraints = {
        ...constraints,
        deviceId: {
            exact: cameraOptions.value
        }
    };

    startStream(updatedConstraints);
};

play.onclick = async () => {
    event.preventDefault();
    if (streamStarted) {
        video.play();
        play.classList.add('d-none');
        pause.classList.remove('d-none');
        return;
    }
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        const updatedConstraints = {
            ...constraints,
            deviceId: {
                exact: cameraOptions.value
            }
        };
        await startStream(updatedConstraints);
    }
};

const stopStream = () => {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        streamStarted = false;
    }
};

const toggleStream = () => {
    event.preventDefault();
    if (video.srcObject) {
        stopStream();
        play.classList.remove('d-none');
        screenshot.classList.add('d-none');
        screenshotImage.classList.add('d-none');
        pause.classList.add('d-none');
    }
};

const doScreenshot = async (event) => {
    event.preventDefault();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    screenshotImage.src = imageData;
    screenshotImage.classList.remove('d-none');

    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'screenshot.png');

        try {
            const response = await fetch("Handler1.ashx", {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            const result = await response.text();
            console.log(result);
        } catch (error) {
            console.error('Error al guardar la imagen:', error);
        }
    }, 'image/png'); // Mantener formato PNG
};

pause.onclick = toggleStream;
screenshot.onclick = doScreenshot;

const startStream = async (constraints) => {
    stopStream();
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream = stream;
    video.srcObject = stream;
    streamStarted = true;
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    screenshot.classList.remove('d-none');
};

//************************************************************************
window.addEventListener("message", async (event) => {
    if (event.data.type === "saveScreenshot") {
        try {
            const response = await fetch("Handler1.ashx", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: event.data.image }),
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error("Error al guardar la imagen");
            }

            console.log("Imagen guardada correctamente.");
        } catch (error) {
            console.error("Error al guardar la imagen:", error);
        }
    }
});
//************************************************************************

const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const options = videoDevices.map(videoDevice => {
        return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
    });
    cameraOptions.innerHTML = options.join('');
};

getCameraSelection();