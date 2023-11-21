// DOM Elements references
const video = document.getElementById("video");
const startButton = document.querySelector("#start-button");
const multi = document.querySelector("#multi"); // Face tracking elements and stats

// Smile detection variables
const MIN_CONSECUTIVE_FRAMES = 3;  // lenght of smiling (threshold) in frames
let consecutiveSmiles1 = 0; // goes up each frame, when smile is detected
let isSmiling1 = false; // is set to true wehen smiling to prevent loosing all lives at once
let intervalStarted = false; // indicates whether a smile detection itteration is running atm
let gameStarted = false; // indicates whether the game is started atm

// Start/stop button function
function onStartStop () {
	if (startButton.innerHTML == "Stop") {
		endGame()
		startButton.innerHTML = "Start"
	} else {
		startGame()
		startButton.innerHTML = "Stop"
	}
}

// Function to start the smile detection
function startGame() {
	// Give a visual feedback, the game has started
	video.style.border="2px solid red";
	// show the face tracking elements and stats
	multi.style.display = 'flex';
	// Indicate that the game has started
	gameStarted = true;

}

// Function to stop the smile detection
function endGame() {
	// Give a visual feedback, the game has started
	video.style.border="2px solid white";
	// hide the face tracking elements and stats
	multi.style.display = 'none';
	// Reset game state variable
	gameStarted = false;
}

// Function to remove a life
function updateLife () {
	let activeLifeEls = document.querySelectorAll(".icofont-heart.active") // get all elements with class 'active' (red hearts)
	activeLifeEls[0].classList.remove('active')// remove the class 'active' from the first element (so its not red anymore) -> see css
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
			// Create canvas element from face tracking stats
			const canvas = faceapi.createCanvasFromMedia(video);
			// Append canvas
			document.getElementById('multi').append(canvas);

			// Set canvas position to absolute
			canvas.style.position = 'absolute';

			// Set dimenaions form canvas
			const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
			faceapi.matchDimensions(canvas, displaySize);

			// Setting zIndex to ensure canvas is above the video
			canvas.style.zIndex = 1;

			// check if interval is runnning
			if (!intervalStarted) {
				intervalStarted = true;
				setInterval(async () => {
					// check if video and game are runnning
					if (!video.paused && !video.ended && gameStarted) {
						// set face API options for detection
						const detections = await faceapi
							.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
							.withFaceLandmarks()
							.withFaceExpressions();
						const resizedDetections = faceapi.resizeResults(
							detections,
							displaySize
						);
						// creat rect to drwan stats inside
						canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
						// drwan stats
						faceapi.draw.drawDetections(canvas, resizedDetections);
						faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

						// check if detection indicates smile
						if (resizedDetections.length >= 1) {
							// check if happy expression is higher the allowed
							if (resizedDetections[0].expressions.happy > 0.4) {
								// set a smile for this itteration / frame
								consecutiveSmiles1++;

								// check for smiling lenght and not allready is caught smiling atm
								if (
									consecutiveSmiles1 >= MIN_CONSECUTIVE_FRAMES &&
									!isSmiling1
								) {

									// indicate that is cuaght smiling atm
									isSmiling1 = true;
									// reset smilling itteration / frame count to 0
									consecutiveSmiles1 = 0;

									// Update lives
									updateLife()

								}
							} else {
								// indicate that isn't cuaght smiling atm
								isSmiling1 = false;
								// set smilling itteration / frame count to 0
								consecutiveSmiles1 = 0;
							}
						}
					}


				}, 100); // start interval
				intervalStarted = true; // set it initial to true
			}
		});
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

// Start the smile detection
startSmileDetection();