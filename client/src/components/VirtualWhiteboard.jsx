import { useState, useRef, useEffect } from 'react';
import { Pencil, Eraser, Square, Circle, Type, Undo, Redo, Download, Trash2, Palette } from 'lucide-react';

/**
 * VirtualWhiteboard Component
 * Collaborative drawing and annotation tool
 */
function VirtualWhiteboard({ sessionId, socket }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const colors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Listen for remote drawing events
    if (socket) {
      socket.on('whiteboard:draw', handleRemoteDraw);
      socket.on('whiteboard:clear', handleRemoteClear);
    }

    return () => {
      if (socket) {
        socket.off('whiteboard:draw', handleRemoteDraw);
        socket.off('whiteboard:clear', handleRemoteClear);
      }
    };
  }, [socket]);

  const handleRemoteDraw = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawLine(ctx, data.x0, data.y0, data.x1, data.y1, data.color, data.lineWidth);
  };

  const handleRemoteClear = () => {
    clearCanvas();
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    const x0 = ctx.currentX || x;
    const y0 = ctx.currentY || y;

    if (tool === 'pen') {
      drawLine(ctx, x0, y0, x, y, color, lineWidth);
    } else if (tool === 'eraser') {
      drawLine(ctx, x0, y0, x, y, '#1e293b', lineWidth * 3);
    }

    ctx.currentX = x;
    ctx.currentY = y;

    // Emit to other users
    if (socket && sessionId) {
      socket.emit('whiteboard:draw', {
        sessionId,
        x0, y0, x1: x, y1: y,
        color: tool === 'eraser' ? '#1e293b' : color,
        lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth
      });
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.currentX = null;
      ctx.currentY = null;
      
      // Save to history
      saveToHistory();
    }
    setIsDrawing(false);
  };

  const drawLine = (ctx, x0, y0, x1, y1, strokeColor, strokeWidth) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      loadFromHistory(newStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      loadFromHistory(newStep);
    }
  };

  const loadFromHistory = (step) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[step];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();

    if (socket && sessionId) {
      socket.emit('whiteboard:clear', { sessionId });
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-white/10 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-3 rounded-lg transition-all ${
              tool === 'pen'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            title="Stift"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-3 rounded-lg transition-all ${
              tool === 'eraser'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            title="Radierer"
          >
            <Eraser size={20} />
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-2" />
          
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className="p-3 bg-white/5 text-gray-400 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
            title="Rückgängig"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="p-3 bg-white/5 text-gray-400 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
            title="Wiederholen"
          >
            <Redo size={20} />
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-2" />
          
          <button
            onClick={clearCanvas}
            className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all"
            title="Löschen"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={downloadCanvas}
            className="p-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all"
            title="Herunterladen"
          >
            <Download size={20} />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <Palette size={20} className="text-gray-400" />
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c ? 'border-white scale-110' : 'border-white/20'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Stärke:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-white font-semibold w-8">{lineWidth}px</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="p-4 bg-slate-800">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full rounded-lg cursor-crosshair border border-white/10"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Info */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <p className="text-xs text-gray-400">
          💡 Zeichnungen werden in Echtzeit mit allen Teilnehmern synchronisiert
        </p>
      </div>
    </div>
  );
}

export default VirtualWhiteboard;
