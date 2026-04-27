import React from "react";
import { env } from "@/config/env";

/**
 * ImageLightbox - Popup xem ảnh phóng to
 * Hỗ trợ gallery nhiều ảnh, điều hướng trái/phải, đóng bằng click nền hoặc ESC.
 * 
 * Usage:
 *   <ImageLightbox images={["/uploads/a.jpg"]} open={true} onClose={() => {}} startIndex={0} />
 */
export function ImageLightbox({ images = [], open, onClose, startIndex = 0 }) {
  const [current, setCurrent] = React.useState(startIndex);

  React.useEffect(() => {
    if (open) setCurrent(startIndex);
  }, [open, startIndex]);

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent(c => (c > 0 ? c - 1 : images.length - 1));
      if (e.key === "ArrowRight") setCurrent(c => (c < images.length - 1 ? c + 1 : 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, images.length, onClose]);

  if (!open || !images || images.length === 0) return null;

  const baseUrl = env?.apiBaseUrl || "";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl transition-colors z-10"
        title="Đóng (ESC)"
      >
        ✕
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-1.5 rounded-full font-medium">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent(c => (c > 0 ? c - 1 : images.length - 1)); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl transition-colors"
          title="Ảnh trước (←)"
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={baseUrl + images[current]}
        alt={`Ảnh ${current + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent(c => (c < images.length - 1 ? c + 1 : 0)); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl transition-colors"
          title="Ảnh sau (→)"
        >
          ›
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-3 py-2 rounded-xl">
          {images.map((url, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
              className={`w-14 h-10 rounded-md overflow-hidden border-2 transition-all ${idx === current ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={baseUrl + url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}

/**
 * ImageThumbnail - Thumbnail ảnh trong bảng, click để mở lightbox
 * Dùng cho tất cả bảng: xe, cư dân, phòng, hợp đồng
 */
export function ImageThumbnail({ images = [], alt = "", shape = "rounded" }) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const baseUrl = env?.apiBaseUrl || "";
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded";

  if (!images || images.length === 0) {
    return (
      <div className={`w-10 h-10 ${shapeClass} bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative w-10 h-10 cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
        title="Click để xem ảnh phóng to"
      >
        <img
          src={baseUrl + images[0]}
          alt={alt}
          className={`w-10 h-10 ${shapeClass} object-cover border border-gray-200 group-hover:border-indigo-400 group-hover:shadow-md transition-all`}
        />
        {images.length > 1 && (
          <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
            {images.length}
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded transition-colors flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
          </svg>
        </div>
      </div>
      <ImageLightbox images={images} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </>
  );
}
