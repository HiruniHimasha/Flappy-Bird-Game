//board
let board;
let boardWidth = 360;
let boardHeight = 680;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -1.5; // Slower pipe moving left speed (reduced from -2 to -1.5)
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0; // Track score

let flapSound = new Audio("./flap.mp3");
let gameOverSound = new Audio("./game-over.mp3");

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load Image
    birdImg = new Image();
    birdImg.src = "./flappybird.gif";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Use setInterval for control over the game speed (instead of requestAnimationFrame)
    setInterval(update, 1000 / 60);  // 60 FPS (adjust this value to make the game slower or faster)
    
    setInterval(placePipes, 2000); //every 2 seconds (slower pipe spawn rate)
    document.addEventListener("keydown", moveBird);
}

function update() {
    if (gameOver) {
        showGameOver();
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //apply gravity to the bird
    velocityY += gravity;
    bird.y += velocityY;

    // Prevent bird from going below the ground
    if (bird.y + bird.height > boardHeight) {
        bird.y = boardHeight - bird.height;
        velocityY = 0;
    }

    // Prevent bird from going above the sky
    if (bird.y < 0) {
        bird.y = 0;
        velocityY = 0;
    }

    //draw bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            gameOverSound.play();
        }

        // Remove pipes that move off screen
        if (pipe.x + pipe.width < 0) {
            pipeArray.splice(i, 1);
            i--;  // Adjust the index to account for the removed element
            continue;
        }

        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Check if the bird has passed the pipe (score point)
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++; // Increase the score
        }
    }

    // Draw score
    context.fillStyle = "black";
    context.font = "24px Arial";
    context.fillText("Score: " + score, 10, 30);
}

function placePipes() {
    if (gameOver) {
        return;
    }
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,  // Adjusted to randomize pipe Y position
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,  // Adjusted the bottom pipe's position
        width: pipeWidth,
        height: boardHeight - (randomPipeY + pipeHeight + openingSpace), // Fill remaining space
        passed: false
    }

    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump (give an upward velocity)
        velocityY = -6;
        flapSound.play();
    }

    if (e.code == "Enter" && gameOver) {
        // Restart the game when Enter key is pressed
        restartGame();
    }
}

function detectCollision(bird, pipe) {
    return bird.x < pipe.x + pipe.width && 
           bird.x + bird.width > pipe.x && 
           bird.y < pipe.y + pipe.height && 
           bird.y + bird.height > pipe.y;
}

function showGameOver() {
    context.fillStyle = "black";
    context.font = "48px Arial";
    context.fillText("Game Over!", boardWidth / 6, boardHeight / 2);

    context.font = "24px Arial";
    context.fillText("Press Enter to Restart", boardWidth / 4, boardHeight / 2 + 40);

    context.font = "24px Arial";
    context.fillText("Final Score: " + score, boardWidth / 4, boardHeight / 2 + 80);
}

function restartGame() {
    // Reset game variables
    bird.y = boardHeight / 2;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
}
