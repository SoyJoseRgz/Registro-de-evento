'use client';

import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activeRef.current = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!activeRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (activeRef.current && videoRef.current) {
              videoRef.current.play().then(() => {
                if (activeRef.current) setReady(true);
              }).catch(() => {});
            }
          };
        }
      } catch (err: any) {
        if (activeRef.current) {
          setError('No se pudo acceder a la camara: ' + (err.message || 'Error'));
        }
      }
    };

    const timer = setTimeout(startCamera, 100);

    return () => {
      activeRef.current = false;
      clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    let animFrame: number;

    const scan = async () => {
      if (!activeRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.paused) {
        animFrame = requestAnimationFrame(scan);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrame = requestAnimationFrame(scan);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const BarcodeDetectorClass = (window as any).BarcodeDetector;
        if (BarcodeDetectorClass) {
          const bd = new BarcodeDetectorClass({ formats: ['qr_code'] });
          const bitmap = await createImageBitmap(canvas);
          const codes = await bd.detect(bitmap);
          if (codes.length > 0 && activeRef.current) {
            onScan(codes[0].rawValue);
            return;
          }
        }
      } catch {}

      try {
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code && activeRef.current) {
          onScan(code.data);
          return;
        }
      } catch {}

      animFrame = requestAnimationFrame(scan);
    };

    animFrame = requestAnimationFrame(scan);

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(animFrame);
    };
  }, [ready, onScan]);

  const stopCamera = () => {
    activeRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Escanear QR</h3>
          <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={stopCamera} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="relative rounded-lg overflow-hidden mb-4 bg-black">
              <video ref={videoRef} className="w-full" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 border-4 border-white border-opacity-70 rounded-lg" />
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">
              Apunta la camara al codigo QR del asistente
            </p>
          </>
        )}
      </div>
    </div>
  );
}
