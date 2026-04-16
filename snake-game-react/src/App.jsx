import { useState, useEffect, useRef } from 'react';
import './App.css';

const CANVAS_SIZE = 400;
const SNAKE_SIZE = 20;
const INITIAL_SNAKE = [{ x: 200, y: 200 }];
const INITIAL_FOOD = { x: 100, y: 100 };
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -SNAKE_SIZE },
  ArrowDown: { x: 0, y: SNAKE_SIZE },
  ArrowLeft: { x: -SNAKE_SIZE, y: 0 },
  ArrowRight: { x: SNAKE_SIZE, y: 0 },
};

function App() {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateFood = () => {
    const x = Math.floor(Math.random() * (CANVAS_SIZE / SNAKE_SIZE)) * SNAKE_SIZE;
    const y = Math.floor(Math.random() * (CANVAS_SIZE / SNAKE_SIZE)) * SNAKE_SIZE;
    return { x, y };
  };

  const checkCollision = (head, snakeBody) => {
    // Wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) {
      return true;
    }
    // Self collision
    for (let segment of snakeBody) {
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    return false;
  };

  const moveSnake = () => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check if food eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const handleKeyPress = (e) => {
    if (DIRECTIONS[e.key]) {
      setDirection(DIRECTIONS[e.key]);
    }
  };

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(DIRECTIONS.ArrowRight);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
      ctx.fillRect(segment.x, segment.y, SNAKE_SIZE, SNAKE_SIZE);
    });

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, SNAKE_SIZE, SNAKE_SIZE);
  }, [snake, food]);

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(moveSnake, 200);
      return () => clearInterval(interval);
    }
  }, [direction, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="app">
      <h1>贪吃蛇游戏</h1>
      <div className="score">分数: {score}</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ border: '1px solid black' }}
      />
      {gameOver && (
        <div className="game-over">
          <h2>游戏结束</h2>
          <button onClick={restartGame}>重新开始</button>
        </div>
      )}
    </div>
  );
}

export default App;
