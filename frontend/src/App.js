import { useRef, useState, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("");
  const [score, setScore] = useState(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    isDrawing.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPos.current = { x, y };
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    isDrawing.current = false;
    lastPos.current = { x: 0, y: 0 };
    setStatus("");
    setScore(null);
  };

  const sendToBackend = async () => {
    const digitEmojis = [
      "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣",
    ];
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    setStatus("Thinking...");
    setScore(null);

    const res = await fetch(`/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    });

    const result = await res.json();
    if (result.predicted_number === undefined) {
      setStatus("😟 " + result.error + " 😟");
    } else {
      setStatus(digitEmojis[result.predicted_number]);
      setScore(result.score);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">🖌️ Digit Classifier</h1>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border border-gray-400 bg-white rounded-lg shadow-lg cursor-crosshair"
      />

      <div className="flex space-x-4">
        <button
          onClick={clearCanvas}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold shadow-md hover:scale-105 hover:shadow-lg transition transform duration-150 ease-in-out"
        >
          🧹 Clear
        </button>
        <button
          onClick={sendToBackend}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 hover:shadow-lg transition transform duration-150 ease-in-out"
        >
          ⚡ What is this?
        </button>
      </div>

      <div
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg shadow-md transition duration-300 ${
          status ? "opacity-100" : "opacity-0"
        }`}
        style={{ minHeight: "5rem" }}
      >
        {status && (
          <p className="text-2xl font-semibold text-center leading-tight">{status}</p>
        )}
        {score !== null && (
          <p
            className={`text-sm leading-none mt-1 text-center ${
              score > 0.5 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            <span>probability: {score.toFixed(2)}</span>
            <span
              aria-label={score > 0.5 ? "Happy" : "Worried"}
              role="img"
              className="text-lg"
            >
              {score > 0.5 ? " 😊" : " 😟"}
            </span>
          </p>
        )}
      </div>

      <footer className="pt-8 text-sm text-gray-500">Author: Soumik Samanta</footer>
    </div>
  );
}