// DOM Elements references
const video = document.getElementById("video");
const popup = document.querySelector("#popup");
const winnerElement = document.querySelector("#winner");
const playAgainButton = document.querySelector("#play-again");
const smileCounterElement1 = document.querySelector("#smile-counter-1");
const smileCounterElement2 = document.querySelector("#smile-counter-2");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
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
let gameOver = false;
let timeoutID;
let gameStarted = false;


playAgainButton.style.display = "none";

// Function to start the smile detection game
function startGame() {
  // Enable the restart button
  restartButton.disabled = false;
  video.style.border="5px solid red";
  // Reset game state variables
  smileCounter1 = 0;
  smileCounter2 = 0;
  gameOver = false;

  // Update the smile counters display
  smileCounterElement1.textContent = `Person 1 Smiles: ${smileCounter1}`;
  smileCounterElement2.textContent = `Person 2 Smiles: ${smileCounter2}`;
  
  // Hide popup and play again button
  popup.style.display = "none";
  playAgainButton.style.display = "none";
  
  // Indicate that the game has started
  gameStarted = true;

  // Disable the start button to prevent re-starting while the game is running
  startButton.disabled = true;

  // Set a timer to end the game after 10 seconds
  timeoutID = setTimeout(() => {
    video.style.border="5px solid rgb(254, 155, 98)";
    popup.style.display = "block";

    // Determine the winner
    let winner;
    if (smileCounter1 > smileCounter2) {
      winner = "Person 1";
    } else if (smileCounter2 > smileCounter1) {
      winner = "Person 2";
    } else {
      winner = "Tie";
    }

    // Display the winner
    winnerElement.textContent = `Winner: ${winner}`;

    // Mark the game as over
    gameOver = true;

    // Show the play again button
    playAgainButton.style.display = "block";

    // Disable the restart button
    restartButton.disabled = true;
  }, 10000);
}

// Function to initialize smile detection
async function startSmileDetection() {
  try {
    // Load the face-api models
    await faceapi.nets.ssdMobilenetv1.loadFromUri("./weights");
    await faceapi.nets.faceLandmark68Net.loadFromUri("./weights");
    await faceapi.nets.faceExpressionNet.loadFromUri("./weights");

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
    startButton.addEventListener("click", startGame);

    // Add event listener to play again button to restart the game
    playAgainButton.addEventListener("click", () => {
      clearTimeout(timeoutID);
      startGame();
    });

    // Add event listener to restart button to restart the game without timeout
    restartButton.addEventListener("click", () => {
      clearTimeout(timeoutID);
      startGame();
    });

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
              if (resizedDetections[0].expressions.happy > 0.7) {
                consecutiveSmiles1++;
                if (
                  consecutiveSmiles1 >= MIN_CONSECUTIVE_FRAMES &&
                  !isSmiling1
                ) {
                  smileCounter1++;
                  isSmiling1 = true;
                  consecutiveSmiles1 = 0;
                }
              } else {
                isSmiling1 = false;
                consecutiveSmiles1 = 0;
              }
              smileCounterElement1.textContent = `Person 1 Smiles: ${smileCounter1}`;
            }
            if (resizedDetections.length >= 2) {
              if (resizedDetections[1].expressions.happy > 0.7) {
                consecutiveSmiles2++;
                if (
                  consecutiveSmiles2 >= MIN_CONSECUTIVE_FRAMES &&
                  !isSmiling2
                ) {
                  smileCounter2++;
                  isSmiling2 = true;
                  consecutiveSmiles2 = 0;
                }
              } else {
                isSmiling2 = false;
                consecutiveSmiles2 = 0;
              }
              smileCounterElement2.textContent = `Person 2 Smiles: ${smileCounter2}`;
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
