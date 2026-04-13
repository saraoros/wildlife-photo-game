import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const animals = [
  { name: "Bunny", emoji: "🐇" },
  { name: "Butterfly", emoji: "🦋" },
  { name: "Deer", emoji: "🦌" },
];

function getRandomAnimal() {
  return animals[Math.floor(Math.random() * animals.length)];
}

export default function App() {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [animal, setAnimal] = useState(getRandomAnimal());
  const [position, setPosition] = useState(-12);
  const [isCaught, setIsCaught] = useState(false);
  const [message, setMessage] = useState("Click on the animal to take a photo while you can!");
  const audioRef = useRef(null);

  const animalTopPositions = [58, 68, 78];
  const animalTop = animalTopPositions[(round - 1) % animalTopPositions.length];

  function playCameraSound() {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(900, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
    } catch (error) {
      console.error(error);
    }
  }

  function nextRound(newRound) {
    setRound(newRound);
    setAnimal(getRandomAnimal());
    setPosition(-12);
    setIsCaught(false);
    setMessage("Click on the animal to take a photo while you can!");
  }

  function handleCapture() {
    if (isCaught) return;

    setIsCaught(true);
    setScore(score + 1);
    setMessage(`You did it! You captured the ${animal.name}!`);
    playCameraSound();

    setTimeout(() => {
      nextRound(round + 1);
    }, 800);
  }

  function resetGame() {
    setScore(0);
    nextRound(1);
  }

  useEffect(() => {
    if (isCaught) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const next = prev + 1.2;

        if (next >= 100) {
          clearInterval(interval);
          setMessage(`OOOOF, ${animal.name} got away!`);

          setTimeout(() => {
            nextRound(round + 1);
          }, 900);

          return 100;
        }

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [animal, isCaught, round]);

  return (
    <div className="app-shell container-fluid py-4">
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="game-title">Wildlife Photo Game</h1>
          <p className="game-subtitle">A fun little wildlife photo game</p>
          <p className="instruction-text">
            Click on the animal before it reaches the other side of the screen.
          </p>
        </div>

        <div className="game-panel rounded-4 p-3">
          <div className="row g-3 align-items-center mb-3">
            <div className="col-12 col-lg">
              <div className="d-flex flex-wrap gap-3">
                <div className="stat-card rounded-4 px-4 py-3">
                  <div className="small fw-semibold">Score</div>
                  <div className="fs-2 fw-bold">{score}</div>
                </div>

                <div className="stat-card rounded-4 px-4 py-3">
                  <div className="small fw-semibold">Round</div>
                  <div className="fs-2 fw-bold">{round}</div>
                </div>

                <div className="stat-card rounded-4 px-4 py-3">
                  <div className="small fw-semibold">Animal</div>
                  <div className="fs-2 fw-bold">{animal.name}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-auto">
              <button className="btn restart-btn px-4 py-2" onClick={resetGame}>
                Restart
              </button>
            </div>
          </div>

          <div className="game-area rounded-4 position-relative overflow-hidden">
            <br />
            <br />
            <br />
            <div className="flower-row">🌷 🌸 🌼 🌷 🌸 🌼 🌷</div>
            <div className="grass-row">🌿 🌿 🌿 🌿 🌿 🌿</div>

            <div className="message-pill position-absolute start-50 translate-middle-x text-center rounded-pill px-4 py-2">
              {message}
            </div>

            {!isCaught ? (
              <button
                onClick={handleCapture}
                className="animal-btn position-absolute"
                style={{
                  left: `${position}%`,
                  top: `${animalTop}%`,
                  fontSize: animal.name === "Butterfly" ? "4rem" : "5rem",
                }}
              >
                {animal.emoji}
              </button>
            ) : (
              <div
                className="capture-effect position-absolute"
                style={{
                  left: `${position}%`,
                  top: `${animalTop}%`,
                }}
              >
                📸
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}