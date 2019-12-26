const { Observable, BehaviorSubject, animationFrame } = rxjs;
const {interval, fromEvent, combineLatest, of } = rxjs;
const { map, skip, scan, distinctUntilChanged, withLatestFrom, startWith, share, switchMap, takeWhile, publish, first, do: filter} = rxjs/operators;

// From constans.ts
const SNAKE_LENGTH = 5;
const APPLE_COUNT = 2;
const POINTS_PER_APPLE = 1;
const SPEED = 200;
const FPS = 60;

let DIRECTIONS: Directions = {
    37: { x: -1, y: 0 },
    39: { x: 1, y: 0 },
    38: { x: 0, y: -1 },
    40: { x: 0, y: 1 }
};

/**
 * Create canvas element and append it to the page
 */
let canvas = createCanvasElement();
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

/**
 * Starting values
 */
const INITIAL_DIRECTION = DIRECTIONS[Key.RIGHT];

/**
 * Determines the speed of the snake
 */
let ticks$ = Observable.interval(SPEED);

/**
 * Track some general user interactions with the document
 */
let click$ = Observable.fromEvent(document, 'click');
let keydown$ = Observable.fromEvent(document, 'keydown');

/**
 * Change direction of the snake based on the latest arrow keypress by the user
 */
let direction$ = keydown$
.map((event: KeyboardEvent) => DIRECTIONS[event.keyCode])
.filter(direction => !!direction)
.scan(nextDirection)
.startWith(INITIAL_DIRECTION)
.distinctUntilChanged();

/**
 * Broadcasting mechanism used to notify subscribers of collisions
 * between the snake and the apples
 */
let length$ = new BehaviorSubject<number>(SNAKE_LENGTH);

/**
 * Accumulates the length of the snake (number of body segments)
 */
let snakeLength$ = length$
.scan((step, snakeLength) => snakeLength + step)
.share();

/**
 * Player's score
 */
let score$ = snakeLength$
.startWith(0)
.scan((score, _) => score + POINTS_PER_APPLE);

/**
 * Accumulates an array of body segments. Each segment is represented
 * as a cell on the grid
 */
let snake$: Observable<Array<Point2D> = ticks$
.withLatestFrom(direction$, snakeLength$, (_, direction, snakeLength) => [direction, snakeLength])
.scan(move, generateSnake())
.share();

/**
 * List of apples
 */
let apples$ = snake$
.scan(eat, generateApples())
.distinctUntilChanged()
.share();

/**
 * Used to broadcast collisions to update the score and add a new
 * body segment to the snake
 */
let appleEaten$ = apples$
.skip(1)
.do(() => length$.next(POINTS_PER_APPLE))
.subscribe();

/**
 * Core game logic which returns an Observable of the scene. This will be
 * used to render the game to the canvas as it unfolds
 */
let scene$ = Observable.combineLatest(snake$, apples$, score$, (snake, apples, score) => ({ snake, apples, score }));

/**
 * This stream takes care of rendering the game while maintaining 60 FPS
 */
let game$ = Observable.interval(1000 / FPS, animationFrame)
.withLatestFrom(scene$, (_, scene) => scene)
.takeWhile(scene => !isGameOver(scene))
.subscribe({
    next: (scene) => renderScene(ctx, scene),
    complete: () => renderGameOver(ctx)
});

//From canvas.ts

const COLS = 30;
const ROWS = 30;
const GAP_SIZE = 1;
const CELL_SIZE = 10;
const CANVAS_WIDTH = COLS * (CELL_SIZE + GAP_SIZE);
const CANVAS_HEIGHT = ROWS * (CELL_SIZE + GAP_SIZE);

function createCanvasElement() {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    return canvas;
}

function renderScene(ctx: CanvasRenderingContext2D, scene: Scene) {
    renderBackground(ctx);
    renderScore(ctx, scene.score);
    renderApples(ctx, scene.apples);
    renderSnake(ctx, scene.snake);
}

function renderScore(ctx: CanvasRenderingContext2D, score: number) {
    let textX = CANVAS_WIDTH / 2;
    let textY = CANVAS_HEIGHT / 2;

    drawText(ctx, score.toString(), textX, textY, 'rgba(0, 0, 0, 0.1)', 150);
}

function renderApples(ctx: CanvasRenderingContext2D, apples: any[]) {
    apples.forEach(apple => paintCell(ctx, apple, 'red'));
}

function renderSnake(ctx: CanvasRenderingContext2D, snake: Array<Point2D>) {
    snake.forEach((segment, index) => paintCell(ctx, wrapBounds(segment), getSegmentColor(index)));
}

function renderGameOver(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let textX = CANVAS_WIDTH / 2;
    let textY = CANVAS_HEIGHT / 2;

    drawText(ctx, 'GAME OVER!', textX, textY, 'black', 25);
}

function getRandomPosition(snake: Array<Point2D> = []): Point2D {
    let position = {
        x: getRandomNumber(0, COLS - 1),
        y: getRandomNumber(0, ROWS - 1)
    };

    if (isEmptyCell(position, snake)) {
        return position;
    }

    return getRandomPosition(snake);
}

function checkCollision(a, b) {
    return a.x === b.x && a.y === b.y;
}

function isEmptyCell(position: Point2D, snake: Array<Point2D>): boolean {
    return !snake.some(segment => checkCollision(segment, position));
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function renderBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#EEE';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fillStyle: string,
                  fontSize: number, horizontalAlign: string = 'center', verticalAlign: string = 'middle') {

    ctx.fillStyle = fillStyle;
    ctx.font = `bold ${fontSize}px sans-serif`;

    let textX = x;
    let textY = y;

    ctx.textAlign = horizontalAlign;
    ctx.textBaseline = verticalAlign;

    ctx.fillText(text, textX, textY);
}

function getSegmentColor(index: number) {
    return index === 0 ? 'black' : '#2196f3';
}

function wrapBounds(point: Point2D) {
    point.x = point.x >= COLS ? 0 : point.x < 0 ? COLS - 1 : point.x;
    point.y = point.y >= ROWS ? 0 : point.y < 0 ? ROWS - 1 : point.y;

    return point;
}

function paintCell(ctx: CanvasRenderingContext2D, point: Point2D, color: string) {
    const x = point.x * CELL_SIZE + (point.x * GAP_SIZE);
    const y = point.y * CELL_SIZE + (point.y * GAP_SIZE);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
}

interface Point2D {
    x: number;
    y: number;
}

interface Scene {
    snake: Array<Point2D>;
    apples: Array<Point2D>;
    score: number;
}

interface Directions {
    [key: number]: Point2D;
}

enum Key {
    LEFT = 37,
        RIGHT = 39,
        UP = 38,
        DOWN = 40
}

function isGameOver(scene: Scene) {
    let snake = scene.snake;
    let head = snake[0];
    let body = snake.slice(1, snake.length);

    return body.some(segment => checkCollision(segment, head));
}

function nextDirection(previous, next) {
    let isOpposite = (previous: Point2D, next: Point2D) => {
        return next.x === previous.x * -1 || next.y === previous.y * -1;
    };

    if (isOpposite(previous, next)) {
        return previous;
    }

    return next;
}

function move(snake, [direction, snakeLength]) {
    let nx = snake[0].x;
    let ny = snake[0].y;

    nx += 1 * direction.x;
    ny += 1 * direction.y;

    let tail;

    if (snakeLength > snake.length) {
        tail = { x: nx, y: ny };
    } else {
        tail = snake.pop();
        tail.x = nx;
        tail.y = ny;
    }

    snake.unshift(tail);

    return snake;
}

function eat(apples: Array<Point2D>, snake) {
    let head = snake[0];

    for (let i = 0; i < apples.length; i++) {
        if (checkCollision(apples[i], head)) {
            apples.splice(i, 1);
            return [...apples, getRandomPosition(snake)];
        }
    }

    return apples;
}

function generateSnake() {
    let snake: Array<Point2D> = [];

    for (let i = SNAKE_LENGTH - 1; i >= 0; i--) {
        snake.push({ x: i, y: 0 });
    }

    return snake;
}

function generateApples(): Array<Point2D> {
    let apples = [];

    for (let i = 0; i < APPLE_COUNT; i++) {
        apples.push(getRandomPosition());
    }

    return apples;
}
