let boardWidht = 360;
let boardHeight = 640
let backroundImg = new Image();
backroundImg.src = "./images/flappybirdbg.png";
let inputLocked = false;

document.addEventListener("keydown", handleKeyDown)

let GAME_STATE = {
    MENU: "menu",
    PLAYING: "playing",
    GAME_OVER: "gameOver"

};

let currentState = GAME_STATE.MENU;

let playButton = {
    x: boardWidht / 2 - 170 / 2,
    y: boardHeight / 2 - 64 / 2,
    widht: 115,
    height: 64
};

let logo = {
    x: boardWidht / 2 - 355 / 2,
    y: boardHeight / 4,
    widht: 300,
    height: 100
}

let flappybirdTextImg = new Image();
flappybirdTextImg.src = "./images/flappyBirdLogo.png";

let gameOverImg = new Image();
gameOverImg.src = "./images/flappy-gameover.png";

let bird = {
    x: 50,
    y: boardHeight / 2,
    widht: 40,
    height: 30
}

let velocityY = 0;
let velocityX = -2;
let gravity = 0.5;
let birdY = boardHeight / 2;

let pipeWidht = 50;
let pipeGap = 200;
let pipeArray = [];
let pipeIntervalid;
let spawn_pipe = 1500

function placePipes(){
    createPipes();
}

function createPipes(){
    let maxTopPipeHeight = boardHeight - pipeGap - 50;
    let topPipeHeight = Math.floor(Math.random() * maxTopPipeHeight);
    let BottomPipeHeight = boardHeight - topPipeHeight - pipeGap;

    let topPipe = {
        x: boardWidht,
        y: 0,
        widht: pipeWidht,
        height: topPipeHeight,
        img: topPipeImg,
        passed: false

    }

    let bottomPipe = {
        x: boardWidht,
        y: topPipeHeight + pipeGap,
        widht: pipeWidht,
        height: BottomPipeHeight,
        img: bottomPipeImg,
        passed: false

    }
    pipeArray.push(topPipe, bottomPipe);

}

window.onload = function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.widht = boardWidht;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./images/flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./images/bottompipe.png";

    playButtonImg = new Image();
    playButtonImg.src = "./images/flappyBirdPlayButton.png";

    requestAnimationFrame(update); 
}

function update(){
    requestAnimationFrame(update);
    context.clearRect(0,0, board.widht, board.height);

    if (currentState === GAME_STATE.MENU) {
        renderMenu();
    } else if(currentState === GAME_STATE.PLAYING) {
        renderGame();
    } else if(currentState === GAME_STATE.GAME_OVER) {
        renderGameOver()
    }
}

function renderMenu(){
    if (backroundImg.complete) {
        context.drawImage(backroundImg, 0, 0, boardWidht, boardHeight);
    }

    if (playButtonImg.complete) {
        context.drawImage(playButtonImg, playButton.x, playButton.y, playButton.widht, playButton.height)
    }

    if (flappybirdTextImg.complete) {
        let scaleWidht = logo.widht;
        let scaleHeight = (flappybirdTextImg.height / flappybirdTextImg.width) * scaleWidht;
        context.drawImage(flappybirdTextImg, logo.x, logo.y, scaleWidht, scaleHeight)
    }

    let tutorialtext = `Press space to start and jump`
    context.font = "20px sans-serif";
    context.textAlign = "left";
    context.fillText(tutorialtext, 10, 45)
}

function renderGame(){
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.widht, bird.height);

    if (bird.y > board.height){
        currentState = GAME_STATE.GAME_OVER
    }

    for(let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.widht, pipe.height)

        if (!pipe.passed && bird.x > pipe.x + pipe.widht) {
            score += 0.5;
            if (velocityX > -10) {
                velocityX += -0.05;
            }
            if (spawn_pipe > 500){
                spawn_pipe -= 5
            }
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)){
            currentState = GAME_STATE.GAME_OVER;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidht){
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.textAlign = "left";
    context.fillText(score, boardWidht / 2 - 45, 45);

}
function renderGameOver(){
    if (gameOverImg.complete){
        let imgWidht = 400;
        let imgHeight = 80;
        let x = (boardWidht - imgWidht - 50) / 2;
        let y = boardHeight / 3;

        context.drawImage(gameOverImg, x, y, imgWidht, imgHeight);

        let scoretext = `Your score: ${Math.floor(score)}`;
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.textAlign = "center";
        context.fillText(scoretext, boardWidht / 2 - 30, y + imgHeight + 50);

        inputLocked = true;
        setTimeout(() => {
            inputLocked = false;
        }, 1000);
    }
}

function handleKeyDown(e){
    if (inputLocked) return;

    if (e.code === "Space") {
        if (currentState === GAME_STATE.MENU) {
            startGame();
        } else if(currentState === GAME_STATE.GAME_OVER) {
            resetGame();
            currentState = GAME_STATE.MENU;
        } else if (currentState === GAME_STATE.PLAYING) {
            velocityY = -6
        }
    }
}

function startGame(){
    currentState = GAME_STATE.PLAYING;
    bird.y = birdY;
    velocityY = 0;
    velocityX = -2;
    pipeArray = [];
    score = 0;

    if(pipeIntervalid) {
        clearInterval(pipeIntervalid)
    }

    pipeIntervalid = setInterval(placePipes, spawn_pipe)
}

function resetGame(){
    pipeArray = [];
    score = 0;
    bird.y = birdY;   
}

function detectCollision(a,b){
    return a.x < b.x + b.widht &&
        a.x + a.widht > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}