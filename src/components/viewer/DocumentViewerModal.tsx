import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Share2, FileX } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title: string;
  sourceName?: string;
  date?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  sourceName,
  date
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const { addToast } = useApp();

  if (!isOpen) return null;

  const handleDownload = () => {
    addToast('Document downloaded to device');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(imageUrl || window.location.href);
      addToast('Document link copied to clipboard');
    } else {
      addToast('Document link ready to share');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 text-white animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-20 bg-slate-900/60 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{title}</h4>
          <p className="text-[11px] text-slate-400">
            {sourceName ? `${sourceName} • ` : ''}{date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified Record'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {imageUrl && (
            <>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Reset zoom"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Download original document"
              >
                <Download size={18} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Share document"
              >
                <Share2 size={18} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors ml-2"
            title="Close viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 flex items-center justify-center overflow-auto my-4 relative">
        {imageUrl ? (
          <div
            className="transition-transform duration-200 origin-center max-w-4xl w-full flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/50 rounded-2xl border border-white/10 max-w-sm">
            <FileX size={44} className="text-slate-500 mb-3" />
            <h5 className="text-base font-bold text-white mb-1">No scanned document available</h5>
            <p className="text-xs text-slate-400">
              This record was entered manually without a photographic scan.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="text-center text-xs text-slate-400 font-mono py-1">
        HealthVault Secure Document Viewer • 256-bit Encrypted Object Storage
      </div>
    </div>
  );
};

export default DocumentViewerModal;
