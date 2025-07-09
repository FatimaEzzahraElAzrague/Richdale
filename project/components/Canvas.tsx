'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface CanvasProps {
  image: string;
  brushSize: number;
  onMaskChange: (maskData: string) => void;
}

const Canvas = forwardRef<any, CanvasProps>(({ image, brushSize, onMaskChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      if (maskCanvasRef.current) {
        const ctx = maskCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
          onMaskChange('');
        }
      }
    }
  }));

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageObj(img);
      setImageLoaded(true);
      
      if (canvasRef.current && maskCanvasRef.current) {
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        
        // Set canvas size to 512x512 for optimal API compatibility
        const container = canvas.parentElement;
        if (container) {
          const containerWidth = Math.min(container.clientWidth, 512);
          const canvasSize = containerWidth; // Square canvas
          
          canvas.width = canvasSize;
          canvas.height = canvasSize;
          maskCanvas.width = canvasSize;
          maskCanvas.height = canvasSize;
          
          // Draw the image centered and scaled to fit within the square canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Fill with white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            
            // Calculate scaling to fit image within square canvas while maintaining aspect ratio
            const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            
            // Center the image
            const x = (canvasSize - scaledWidth) / 2;
            const y = (canvasSize - scaledHeight) / 2;
            
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          }
          
          // Initialize mask canvas
          const maskCtx = maskCanvas.getContext('2d');
          if (maskCtx) {
            maskCtx.clearRect(0, 0, canvasSize, canvasSize);
          }
        }
      }
    };
    img.src = image;
  }, [image]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    
    setIsDrawing(true);
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // Bold blue, more opaque
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !imageLoaded) return;
    
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Create a proper black/white mask for the API
    if (maskCanvasRef.current) {
      // Create a temporary canvas for the API mask
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = maskCanvasRef.current.width;
      tempCanvas.height = maskCanvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Fill with black background
        tempCtx.fillStyle = 'black';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Get the current mask canvas data
        const maskCtx = maskCanvasRef.current.getContext('2d');
        if (maskCtx) {
          const imageData = maskCtx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
          const data = imageData.data;
          
          // Convert colored mask to white areas on black background
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // If pixel has any alpha (was drawn on)
              data[i] = 255;     // R
              data[i + 1] = 255; // G
              data[i + 2] = 255; // B
              data[i + 3] = 255; // A
            } else {
              data[i] = 0;       // R
              data[i + 1] = 0;   // G
              data[i + 2] = 0;   // B
              data[i + 3] = 255; // A
            }
          }
          
          tempCtx.putImageData(imageData, 0, 0);
        }
      }
      
      const maskDataUrl = tempCanvas.toDataURL('image/png');
      onMaskChange(maskDataUrl);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative w-full" style={{ paddingBottom: '100%', maxWidth: '512px', marginBottom: '20px' }}>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
          style={{ zIndex: 1 }}
        />
        <canvas
          ref={maskCanvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-xl cursor-crosshair"
          style={{ zIndex: 2 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      {!imageLoaded && (
        <div className="aspect-square bg-white/10 rounded-xl flex items-center justify-center max-w-[512px] border border-white/20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-300">Loading image...</p>
          </div>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;