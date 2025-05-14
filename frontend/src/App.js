import { useRef, useState, useEffect } from "react";
export default function App() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);


  const draw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    draw(e);
    canvas.addEventListener("mousemove", draw);
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    canvas.removeEventListener("mousemove", draw);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStatus("");
  };

  const sendToBackend = async () => {
    const digitEmojis = [
  '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', 
  '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'
];
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    setStatus("Thinking...");
    const res = await fetch(`/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    });
    const result = await res.json();
    if (result.predicted_number === undefined) {
      setStatus("😄 "+result.error+" 😄");
    } else {
      setStatus("😎 "+digitEmojis[result.predicted_number] + " 😎");
    }
  };

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 space-y-4">
    <h1 className="text-3xl font-bold text-gray-800">🖌️ Digit Classifier</h1>
    
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
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
  className={`flex items-center justify-center space-x-2 p-6 h-[50px] rounded-lg shadow-md transition duration-300 ${
    status ? '' : 'invisible'
  }`}
>
  <p className="text-3xl font-semibold text-center">{status}</p>
</div>

    <footer className="pt-8 text-sm text-gray-500">
    Author: Soumik Samanta
    </footer>
  </div>
);

}
