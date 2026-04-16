import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const GRID_SIZE = 20
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const TICK_MS = 150

function getRandomFood(snake) {
  let food = null
  while (!food) {
    const candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
    const onSnake = snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y)
    if (!onSnake) {
      food = candidate
    }
  }
  return food
}

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(() => getRandomFood(INITIAL_SNAKE))
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const directionRef = useRef(INITIAL_DIRECTION)

  const resetGame = useCallback(() => {
    directionRef.current = INITIAL_DIRECTION
    setSnake(INITIAL_SNAKE)
    setFood(getRandomFood(INITIAL_SNAKE))
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
  }, [])

  const continueGame = useCallback(() => {
    setGameOver(false)
    setIsPaused(false)
  }, [])

  const changeDirection = useCallback((nextDirection) => {
    const current = directionRef.current
    const isReverse = current.x + nextDirection.x === 0 && current.y + nextDirection.y === 0
    if (isReverse) {
      return
    }
    directionRef.current = nextDirection
  }, [])

  useEffect(() => {
    const keyMap = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    }

    const onKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (!gameOver) {
          setIsPaused((prev) => !prev)
        }
        return
      }

      const nextDirection = keyMap[event.key]
      if (!nextDirection || gameOver || isPaused) {
        return
      }
      changeDirection(nextDirection)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [changeDirection, gameOver, isPaused])

  useEffect(() => {
    if (gameOver || isPaused) {
      return undefined
    }

    const timer = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0]
        const nextHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        }
        const hitsWall =
          nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE
        const hitsSelf = prevSnake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y)

        if (hitsWall || hitsSelf) {
          setGameOver(true)
          return prevSnake
        }

        const nextSnake = [nextHead, ...prevSnake]
        const ateFood = nextHead.x === food.x && nextHead.y === food.y

        if (ateFood) {
          setScore((prev) => prev + 1)
          setFood(getRandomFood(nextSnake))
          return nextSnake
        }

        nextSnake.pop()
        return nextSnake
      })
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [food, gameOver, isPaused])

  const boardCells = useMemo(() => {
    const snakeSet = new Set(snake.map((segment) => `${segment.x},${segment.y}`))
    const head = snake[0]
    return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
      const x = index % GRID_SIZE
      const y = Math.floor(index / GRID_SIZE)
      const isFood = food.x === x && food.y === y
      const isHead = head.x === x && head.y === y
      const isSnake = snakeSet.has(`${x},${y}`)

      let className = 'cell'
      if (isFood) className += ' food'
      if (isSnake) className += ' snake'
      if (isHead) className += ' head'

      return <div key={`${x}-${y}`} className={className} />
    })
  }, [food.x, food.y, snake])

  return (
    <main className="game-wrapper">
      <h1>React 贪吃蛇</h1>
      <div className="panel">
        <div className="stats">
          <p>分数: {score}</p>
          <p>长度: {snake.length}</p>
          <p>状态: {gameOver ? '游戏结束' : isPaused ? '已暂停' : '进行中'}</p>
        </div>
        <div className="actions">
          {!gameOver && (
            <button type="button" onClick={() => setIsPaused((prev) => !prev)}>
              {isPaused ? '继续游戏' : '暂停游戏'}
            </button>
          )}
          {gameOver && (
            <button type="button" onClick={continueGame}>
              继续游戏
            </button>
          )}
          <button type="button" onClick={resetGame}>
            重新开始
          </button>
        </div>
        {gameOver && (
          <p className="game-over" role="status">
            游戏结束，可选择“继续游戏”或“重新开始”！
          </p>
        )}
      </div>
      <section className="board" aria-label="snake game board">
        {boardCells}
      </section>
      <p className="tips">方向键 / WASD 控制移动，空格键可暂停和继续。</p>
    </main>
  )
}

export default App
