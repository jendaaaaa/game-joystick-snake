////// INITIALIZATION
// CONSTANTS
let VALUE_DEADZONE = 400;
let VALUE_CENTER = 511;
let DELAY_INPUT = 100;
let INTERVAL_BLINK = 5;
let INTERVAL_INIT = 500;
let INTERVAL_COEFF = 0.98;
let BRIGHTNESS_SNAKE = 255;
let BRIGHTNESS_TREASURE = 128;
let LIM_X = [0, 4];
let LIM_Y = [0, 4];
let LIM_SIZE = 5;
let PIN_X = DigitalPin.P2;
let PIN_Y = DigitalPin.P1;

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

// INIT
game.setScore(0);
game.addScore(0);

////// INPUT
// JOYSTICK INPUT
basic.forever(function () {
    y_input = pins.analogReadPin(AnalogPin.P1);
    x_input = pins.analogReadPin(AnalogPin.P2);
    if (x_input > VALUE_CENTER + VALUE_DEADZONE) {
        if (x_move !== 1 && !b_change_dir) {
            x_move = -1;
            y_move = 0;
            b_change_dir = true;
        }
        pause(DELAY_INPUT);
    } else if (x_input < VALUE_CENTER - VALUE_DEADZONE) {
        if (x_move !== -1 && !b_change_dir) {
            x_move = 1;
            y_move = 0;
            b_change_dir = true;
        }
        pause(DELAY_INPUT);
    } else if (y_input > VALUE_CENTER + VALUE_DEADZONE) {
        if (y_move !== 1 && !b_change_dir) {
            x_move = 0;
            y_move = -1;
            b_change_dir = true;
        }
        pause(DELAY_INPUT);
    } else if (y_input < VALUE_CENTER - VALUE_DEADZONE) {
        if (y_move !== -1 && !b_change_dir) {
            x_move = 0;
            y_move = 1;
            b_change_dir = true;
        }
        pause(DELAY_INPUT);
    }
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
        game.showScore();
        game.setScore(0);
        b_game_over = false;
        interval = INTERVAL_INIT;
    }
    generateImage();
    moveForward();
})

// TREASURE
basic.forever(function () {
    if (!b_game_over) {
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
        arr = [0];
        b_game_over = true;
    }
    // check treasure
    if (x_head == x_treasure && y_head == y_treasure) {
        arr.push(arr[0]);
        game.setScore(game.score() + 1);
        interval = interval * INTERVAL_COEFF;
        generateTreasure();
    }
    // move snake
    arr.insertAt(0, x_head + y_head * 5);
    arr.removeAt(arr.length - 1);
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