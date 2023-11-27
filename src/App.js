import React, { useState, useEffect } from "react";

const CandyBurstGame = () => {
  const gridSize = 10;
  const colors = ["red", "blue", "green", "yellow"];
  const maxMoves = 20;
  const maxCandiesToBurst = 50;

  const generateGrid = () => {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        row.push({
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  };

  const [grid, setGrid] = useState(generateGrid());
  const [movesLeft, setMovesLeft] = useState(maxMoves);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesLost, setGamesLost] = useState(0);
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    const storedScoreHistory =
      JSON.parse(localStorage.getItem("scoreHistory")) || [];
    setScoreHistory(storedScoreHistory);
  }, []);

  useEffect(() => {
    if (movesLeft === 0 || score >= maxCandiesToBurst) {
      setGameOver(true);
    }
  }, [movesLeft, score]);

  const handleReset = () => {
    setGrid(generateGrid());
    setMovesLeft(maxMoves);
    setScore(0);
    setGameOver(false);
    setGamesPlayed((prevGamesPlayed) => prevGamesPlayed + 1);

    if (score >= maxCandiesToBurst) {
      setGamesWon((prevGamesWon) => prevGamesWon + 1);
    } else {
      setGamesLost((prevGamesLost) => prevGamesLost + 1);
    }
    const gameResult = score >= maxCandiesToBurst ? "won" : "lost";
    const newScoreEntry = { score, result: gameResult, date: new Date() };

    setScoreHistory((prevScoreHistory) => [...prevScoreHistory, newScoreEntry]);
    const storedScoreHistory =
      JSON.parse(localStorage.getItem("scoreHistory")) || [];
    const updatedScoreHistory = [...storedScoreHistory, newScoreEntry];
    localStorage.setItem("scoreHistory", JSON.stringify(updatedScoreHistory));

    setScoreHistory(updatedScoreHistory);
  };

  const handleCellClick = (row, col) => {
    if (gameOver) return;

    const clickedColor = grid[row][col].color;
    const newGrid = [...grid];

    // DFS to find connected candies with the same color and return the count
    const dfs = (r, c, targetColor, visited) => {
      if (
        r < 0 ||
        r >= gridSize ||
        c < 0 ||
        c >= gridSize ||
        visited[r][c] ||
        newGrid[r][c].color !== targetColor
      ) {
        return 0;
      }

      visited[r][c] = true;
      newGrid[r][c].burst = true;

      const count =
        1 +
        dfs(r + 1, c, targetColor, visited) +
        dfs(r - 1, c, targetColor, visited) +
        dfs(r, c + 1, targetColor, visited) +
        dfs(r, c - 1, targetColor, visited);

      return count;
    };

    const visited = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    const connectedCount = dfs(row, col, clickedColor, visited);

    // Burst only if there are 3 or more connected candies in a row or column
    if (connectedCount >= 3) {
      // Fill empty cells with random colors
      for (let i = gridSize - 1; i >= 0; i--) {
        for (let j = 0; j < gridSize; j++) {
          if (newGrid[i][j].burst) {
            let k = i - 1;
            while (k >= 0 && newGrid[k][j].burst) {
              k--;
            }
            if (k >= 0) {
              // Move the non-burst candy to the empty cell
              newGrid[i][j].color = newGrid[k][j].color;
              newGrid[k][j].burst = true;
              newGrid[i][j].burst = false;
            } else {
              // Fill the empty cell with a random color
              newGrid[i][j].color =
                colors[Math.floor(Math.random() * colors.length)];
            }
          }
        }
      }

      // Score based on the number of candies burst in a single click
      const clickScore = connectedCount;

      setGrid(newGrid);
      setScore((prevScore) => prevScore + clickScore);
      setMovesLeft((prevMoves) => prevMoves - 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        //justifyContent: "center",
        minHeight: "100vh",
        backgroundImage:
          'url("https://www.genai.tv/content/images/2023/09/Candy-Crush-game.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: 0,
        padding: 0,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "10px", fontSize: "30px" }}>
        <strong>Moves Left:</strong> {movesLeft}
      </div>
      <div style={{ fontSize: "30px" }}>
        <strong> MaxCandiesToBurst:</strong> {maxCandiesToBurst}
      </div>
      <div style={{ padding: "10px" }}>
        <strong>Score:</strong> {score}
      </div>
      <div style={{ padding: "10px" }}>
        <strong>Games Played:</strong> {gamesPlayed}
      </div>
      <div style={{ padding: "10px" }}>
        <strong>Games Won:</strong> {gamesWon}
      </div>
      <div style={{ padding: "10px" }}>
        <strong>Games Lost:</strong> {gamesLost}
      </div>
      {gameOver && (
        <div>
          <span
            style={{
              color: score >= maxCandiesToBurst ? "green" : "red",
              fontSize: "40px",
            }}
          >
            {score >= maxCandiesToBurst ? "You won!" : "You lost!"}
          </span>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 30px)`,
          maxWidth: "80%",
          margin: "0 auto",
          alignIte: "center",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: cell.color,
                border: "1px solid #ccc",
                cursor: gameOver ? "default" : "pointer",
              }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>

      <div style={{ padding: "10px" }}>
        <button
          onClick={handleReset}
          style={{
            padding: "10px",
            color: "white",
            backgroundColor: "red",
            borderRadius: "5px",
          }}
        >
          Reset Game
        </button>
      </div>
      {scoreHistory.length > 0 ? (
        <div style={{ padding: "10px", backgroundColor: "white" }}>
          <strong>Score History:</strong>

          <ul>
            {scoreHistory.map((entry, index) => (
              <li key={index}>
                {entry.result === "won" ? "Won" : "Lost"} - Score: {entry.score}{" "}
                - Date: {entry.date.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ backgroundColor: "white", padding: "20px" }}>
          No score history
        </div>
      )}
    </div>
  );
};

export default CandyBurstGame;
