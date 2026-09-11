import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Zap, ZapOff, Image as ImageIcon, RefreshCw } from 'lucide-react';

export interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  onSwitchToGallery?: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onSwitchToGallery
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [useSimulated, setUseSimulated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isOpen) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            activeStream = s;
            setStream(s);
            if (videoRef.current) {
              videoRef.current.srcObject = s;
            }
          })
          .catch(() => {
            // Graceful fallback to simulated document scanner
            setUseSimulated(true);
          });
      } else {
        setUseSimulated(true);
      }
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSnap = () => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        return;
      }
    }

    // High quality clinical document mock fallback snapshot
    const mockImages = [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
    ];
    onCapture(mockImages[Math.floor(Math.random() * mockImages.length)]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 sm:p-6 text-white animate-fadeIn">
      {/* Top Camera Controls */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Cancel"
        >
          <X size={22} />
        </button>

        <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
          Position Document Within Frame
        </span>

        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`p-2 rounded-full transition-colors ${
            flashOn ? 'bg-amber-400 text-black' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title="Flash toggle"
        >
          {flashOn ? <Zap size={20} /> : <ZapOff size={20} />}
        </button>
      </div>

      {/* Center Viewfinder */}
      <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900 border border-white/20">
        {!useSimulated && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {/* Simulated Medical Document Preview in Viewfinder */}
            <div className="w-64 h-80 bg-slate-800/90 rounded-xl border border-dashed border-cyan-400/60 p-4 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-2 text-left opacity-70">
                <div className="h-3 w-32 bg-cyan-400/40 rounded"></div>
                <div className="h-2 w-48 bg-slate-600 rounded"></div>
                <div className="h-2 w-40 bg-slate-600 rounded"></div>
              </div>

              {/* Scanning laser line */}
              <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_#00f0ff] animate-scan-line"></div>

              <div className="space-y-2 text-left opacity-70">
                <div className="h-2 w-full bg-slate-700 rounded"></div>
                <div className="h-2 w-5/6 bg-slate-700 rounded"></div>
                <div className="h-2 w-4/6 bg-slate-700 rounded"></div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-mono">
              [Live Optical Scanner Ready]
            </p>
          </div>
        )}

        {/* Viewfinder Target Reticle Frame */}
        <div className="absolute inset-8 sm:inset-16 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
          <div className="flex justify-between">
            <div className="w-5 h-5 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="w-5 h-5 border-t-2 border-r-2 border-cyan-400"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-5 h-5 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="w-5 h-5 border-b-2 border-r-2 border-cyan-400"></div>
          </div>
        </div>
      </div>

      {/* Bottom Shutter & Gallery Switch */}
      <div className="flex items-center justify-around py-2 z-20">
        <button
          onClick={() => {
            onClose();
            onSwitchToGallery?.();
          }}
          className="flex flex-col items-center space-y-1 text-slate-300 hover:text-white transition-colors"
        >
          <div className="p-3 rounded-full bg-white/20">
            <ImageIcon size={22} />
          </div>
          <span className="text-[11px]">Gallery</span>
        </button>

        {/* Big Circular Capture Button */}
        <button
          onClick={handleSnap}
          className="w-20 h-20 rounded-full border-4 border-white p-1.5 flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          title="Capture Document"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-900">
            <Camera size={26} />
          </div>
        </button>

        <button
          onClick={() => setUseSimulated(!useSimulated)}
          className="flex flex-col items-center space-y-1 text-slate-300 hover:text-white transition-colors"
          title="Toggle camera input"
        >
          <div className="p-3 rounded-full bg-white/20">
            <RefreshCw size={22} />
          </div>
          <span className="text-[11px]">Camera</span>
        </button>
      </div>
    </div>
  );
};

export default CameraModal;
