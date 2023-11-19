// DOM Elements references
const video = document.getElementById("video");
const startButton = document.querySelector("#start-button");
const multi=document.querySelector("#multi");

// Smile detection variables
const MIN_CONSECUTIVE_FRAMES = 3;
let smileCounter1 = 0;
let smileCounter2 = 0;
let consecutiveSmiles1 = 0;
let consecutiveSmiles2 = 0;
let isSmiling1 = false;
let isSmiling2 = false;
let intervalStarted = false;
let gameStarted = false;

function onStartStop () {
	if (startButton.innerHTML == "Stop") {
		endGame()
		startButton.innerHTML = "Start"
	} else {
		startGame()
		startButton.innerHTML = "Stop"
	}
}

// Function to start the smile detection game
function startGame() {
	// Reset game state variables
	smileCounter1 = 0;
	smileCounter2 = 0;
	video.style.border="2px solid red";
	multi.style.display = 'flex';

	// Indicate that the game has started
	gameStarted = true;

}

function endGame() {
	// Reset game state variables
	gameStarted = false;
	multi.style.display = 'none';
	video.style.border="2px solid white";
}


function updateLife () {
	let activeLifeEls = document.querySelectorAll(".icofont-heart.active")
	activeLifeEls[0].classList.remove('active')
}


// Function to initialize smile detection
async function startSmileDetection() {
	try {
		// Load the face-api models
		await faceapi.nets.ssdMobilenetv1.loadFromUri("../smileDetection/weights");
		await faceapi.nets.faceLandmark68Net.loadFromUri("../smileDetection/weights");
		await faceapi.nets.faceExpressionNet.loadFromUri("../smileDetection/weights");

		// Request access to the webcam
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				video.srcObject = stream;

				// Enable the start button after webcam access is granted
				startButton.disabled = false;
			})
			.catch((error) => {
				console.error("Could not access the webcam:", error);
			});

		// Add event listener to start button to start the game
		startButton.addEventListener("click", onStartStop);

		// Process the video feed for smile detection
		video.addEventListener("play", () => {
			const canvas = faceapi.createCanvasFromMedia(video);
			document.getElementById('multi').append(canvas);

			// Set canvas position to absolute
			canvas.style.position = 'absolute';

			const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
			faceapi.matchDimensions(canvas, displaySize);

			// Setting zIndex to ensure canvas is above the video
			canvas.style.zIndex = 1;

			if (!intervalStarted) {
				intervalStarted = true;
				setInterval(async () => {
					if (!video.paused && !video.ended && gameStarted) {
						const detections = await faceapi
							.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
							.withFaceLandmarks()
							.withFaceExpressions();
						const resizedDetections = faceapi.resizeResults(
							detections,
							displaySize
						);
						canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
						faceapi.draw.drawDetections(canvas, resizedDetections);
						faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

						if (resizedDetections.length >= 1) {
							if (resizedDetections[0].expressions.happy > 0.4) {
								consecutiveSmiles1++;
								if (
									consecutiveSmiles1 >= MIN_CONSECUTIVE_FRAMES &&
									!isSmiling1
								) {
									smileCounter1++;
									isSmiling1 = true;
									consecutiveSmiles1 = 0;

									// Update life

									updateLife()

								}
							} else {
								isSmiling1 = false;
								consecutiveSmiles1 = 0;
							}
						}
					}


				}, 100);
				intervalStarted = true;
			}
		});
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

// Start the smile detection
startSmileDetection();