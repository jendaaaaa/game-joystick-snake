////// INITIALIZATION
// CONSTANTS
let VALUE_DEADZONE = 400;
let VALUE_CENTER = 511;
let DELAY_INPUT = 50;
let INTERVAL_BLINK = 5;
let INTERVAL_INIT = 500;
let INTERVAL_COEFF = 0.98;
let BRIGHTNESS_SNAKE = 255;
let BRIGHTNESS_TREASURE = 128;
let LIM_X = [0, 4];
let LIM_Y = [0, 4];
let LIM_SIZE = 5;
let PIN_X = AnalogPin.P2;
let PIN_Y = AnalogPin.P1;
let TIME_DEBOUNCE = 30;
let INP_PRESSED = true;
let INP_RELEASED = false;

// VARIABLES
let x_input = 0;
let y_input = 0;
let x = 0;
let y = 0;
let x_head = 0;
let y_head = 0;
let x_treasure = randint(0, 4);
let y_treasure = randint(0, 4);
let x_move = 0;
let y_move = 1;
let b_game_over = false;
let b_change_dir = false;
let b_treasure = true;
let counter_treasure = 0;
let arr: number[] = [0];
let interval = INTERVAL_INIT;
let xButtonState = false;
let xLastButtonState = false;
let xLastDebounceTime = 0;
let yButtonState = false;
let yLastButtonState = false;
let yLastDebounceTime = 0;

// INIT
game.setScore(0);
game.addScore(0);

////// INPUT
// JOYSTICK INPUT
basic.forever(function () {
    debounceX();
    debounceY();
})

// ALTERNATIVE INPUT
input.onButtonPressed(Button.B, function () {
    turnRight();
    pause(DELAY_INPUT);
})

input.onButtonPressed(Button.A, function () {
    turnLeft();
    pause(DELAY_INPUT);
})

////// MAIN ALGORITHM
// SNAKE
basic.forever(function () {
    if (b_game_over) {
        if (game.score() > 23){
            game.addScore(0);
            pause(500);
            basic.showString("WIN!");
        }
        game.showScore();
        game.setScore(0);
        b_game_over = false;
        arr = [0];
        interval = INTERVAL_INIT;
    }
    moveForward();
    generateImage();
})

// TREASURE
basic.forever(function () {
    if (!b_game_over) {
        checkTreasure();
        showTreasure();
    }
})

////// FUNCTIONS
// SNAKE
function moveForward () {
    basic.pause(interval);
    b_change_dir = false;
    x_head = arr[0] % LIM_SIZE;
    y_head = Math.trunc(arr[0] / LIM_SIZE);
    // check boundaries
    if (x_head + x_move < LIM_X[0]) {
        x_head = LIM_X[1];
    } else {
        x_head = (x_head + x_move) % LIM_SIZE;
    }
    if (y_head + y_move < LIM_Y[0]) {
        y_head = LIM_Y[1];
    } else {
        y_head = (y_head + y_move) % LIM_SIZE;
    }
    // check collision
    if(led.point(x_head, y_head) && x_head !== x_treasure && y_head !== y_treasure){
        b_game_over = true;
    }
    // move snake
    arr.insertAt(0, x_head + y_head * 5);
    arr.removeAt(arr.length - 1);
}

// CHECK TREASURE
function checkTreasure(){
    if (x_head == x_treasure && y_head == y_treasure) {
        arr.push(arr[0]);
        game.setScore(game.score() + 1);
        interval = interval * INTERVAL_COEFF;
        generateTreasure();
    }
}

// DISPLAY SNAKE
function generateImage () {
    basic.clearScreen()
    for (let i = 0; i <= arr.length - 1; i++) {
        x = arr[i] % LIM_SIZE;
        y = Math.trunc(arr[i] / LIM_SIZE);
        led.plotBrightness(x, y, BRIGHTNESS_SNAKE);
    }
}

// DISPLAY TREASURE
function showTreasure(){
    // blink mechanism
    if (b_treasure) {
        led.plotBrightness(x_treasure, y_treasure, BRIGHTNESS_TREASURE);
    } else {
        led.unplot(x_treasure, y_treasure);
    }
    if (counter_treasure > INTERVAL_BLINK) {
        b_treasure = !b_treasure;
        counter_treasure = 0;
    }
    counter_treasure = counter_treasure + 1;
}

// GENERATE TREASURE
function generateTreasure(){
    do {
        x_treasure = randint(0,4);
        y_treasure = randint(0,4);
    } while (led.point(x_treasure, y_treasure))
}

// MOVEMENT
function turnLeft(){
    if (x_move == 1 && y_move == 0) {
        x_move = 0;
        y_move = -1;
    } else if (x_move == 0 && y_move == 1) {
        x_move = 1;
        y_move = 0;
    } else if (x_move == -1 && y_move == 0) {
        x_move = 0;
        y_move = 1;
    } else if (x_move == 0 && y_move == -1) {
        x_move = -1;
        y_move = 0;
    }
}

function turnRight(){
    if (x_move == 1 && y_move == 0) {
        x_move = 0;
        y_move = 1;
    } else if (x_move == 0 && y_move == 1){
        x_move = -1;
        y_move = 0;
    } else if (x_move == -1 && y_move == 0){
        x_move = 0;
        y_move = -1;
    } else if (x_move == 0 && y_move == -1){
        x_move = 1;
        y_move = 0;
    }
}

function turnX(){
    x_input = pins.analogReadPin(PIN_X);
    if (x_input > VALUE_CENTER + VALUE_DEADZONE) {
        if (x_move !== 1 && !b_change_dir) {
            x_move = -1;
            y_move = 0;
            b_change_dir = true;
        }
        // pause(DELAY_INPUT);
    } else if (x_input < VALUE_CENTER - VALUE_DEADZONE) {
        if (x_move !== -1 && !b_change_dir) {
            x_move = 1;
            y_move = 0;
            b_change_dir = true;
        }
        // pause(DELAY_INPUT);
    }
}

function turnY(){
    y_input = pins.analogReadPin(PIN_Y);
    if (y_input > VALUE_CENTER + VALUE_DEADZONE) {
        if (y_move !== 1 && !b_change_dir) {
            x_move = 0;
            y_move = -1;
            b_change_dir = true;
        }
        // pause(DELAY_INPUT);
    } else if (y_input < VALUE_CENTER - VALUE_DEADZONE) {
        if (y_move !== -1 && !b_change_dir) {
            x_move = 0;
            y_move = 1;
            b_change_dir = true;
        }
        // pause(DELAY_INPUT);
    }
}

// DEBOUNCIONG
function debounceX() {
    let currentTime = input.runningTime();
    let buttonRead = (Math.abs(pins.analogReadPin(PIN_X) - VALUE_CENTER) - VALUE_DEADZONE) > 0;
    if (buttonRead !== xLastButtonState) {
        xLastDebounceTime = currentTime;
    }
    if (input.runningTime() - xLastDebounceTime > TIME_DEBOUNCE) {
        if (buttonRead !== xButtonState) {
            xButtonState = buttonRead;
            if (xButtonState === INP_PRESSED) {
                turnX();
            }
        }
    }
    xLastButtonState = buttonRead
}

function debounceY() {
    let currentTime = input.runningTime();
    let buttonRead = (Math.abs(pins.analogReadPin(PIN_Y) - VALUE_CENTER) - VALUE_DEADZONE) > 0;
    if (buttonRead !== yLastButtonState) {
        yLastDebounceTime = currentTime;
    }
    if (input.runningTime() - yLastDebounceTime > TIME_DEBOUNCE) {
        if (buttonRead !== yButtonState) {
            yButtonState = buttonRead;
            if (yButtonState === INP_PRESSED) {
                turnY();
            }
        }
    }
    yLastButtonState = buttonRead
}