import React, { useRef, useState, useEffect } from 'react';
import { TrashIcon, CheckIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';

interface DrawingCanvasProps {
  onConfirm: (base64Image: string) => void;
  onCancel: () => void;
  confirmText: string;
  clearText: string;
  cancelText?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onConfirm, onCancel, confirmText, clearText, cancelText = "Cancel" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#8B4513'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setHasDrawn(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault(); // Prevent scrolling on touch

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      onConfirm(base64);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-100 p-2 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
          {colors.map(c => (
            <button
              key={c}
              onClick={(e) => { e.preventDefault(); setColor(c); }}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button onClick={(e) => { e.preventDefault(); clearCanvas(); }} className="text-gray-400 hover:text-red-500 p-1">
           <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none"
      />

      <div className="flex gap-2 mt-2">
          <button 
             onClick={(e) => { e.preventDefault(); onCancel(); }}
             className="flex-1 py-2 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
             {cancelText}
          </button>
          <button 
             onClick={(e) => { e.preventDefault(); handleConfirm(); }}
             className="flex-1 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center gap-1"
          >
             <CheckIcon className="w-4 h-4" /> {confirmText}
          </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;