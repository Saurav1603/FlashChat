// src/components/ImageViewer.jsx
import React from 'react';

function ImageViewer({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <button className="image-viewer-close" onClick={onClose}>✕</button>
      <img src={url} alt="Full size" className="image-viewer-img" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export default ImageViewer;
