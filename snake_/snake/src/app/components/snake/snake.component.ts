import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, animationFrame } from './rxjs';
import { DIRECTIONS, SPEED, SNAKE_LENGTH, FPS, POINTS_PER_APPLE } from './constans';
import { Key, Point2D } from './types';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})
export class SnakeComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}

import {
  createCanvasElement,
  renderScene,
  renderApples,
  renderSnake,
  renderScore,
  renderGameOver,
  getRandomPosition,
  checkCollision
} from './canvas';

import {
  isGameOver,
  nextDirection,
  move,
  eat,
  generateSnake,
  generateApples
} from './utils';

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
let snake$: Observable<Array<Point2D>> = ticks$
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
let scene$ = Observable.combineLatest(snake$, apples$, score$, (snake, apples, score) => ({ snake, apples, score}));

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
