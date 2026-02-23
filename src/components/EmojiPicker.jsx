import React, { useState, useRef, useEffect } from 'react';

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝'],
  'Gestures': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤝', '👏', '🙌', '👐', '🤲', '🤞', '✌️', '🤟', '🤘', '🫶', '💪', '🙏', '👋', '🖐️', '✋', '🤚'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  'Objects': ['🔥', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '💡', '💎', '🔔', '📌', '🎵', '🎶', '☕', '🍕', '🍔'],
  'Nature': ['🌈', '☀️', '🌙', '⭐', '🌊', '🌺', '🌸', '🌻', '🌷', '🍀', '🌿', '🍃', '🦋', '🐱', '🐶', '🦊', '🐼', '🐨'],
};

function EmojiPicker({ onEmojiSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Smileys');
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (emoji) => {
    onEmojiSelect(emoji);
    // Don't close — let user pick multiple
  };

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      <button
        type="button"
        className="emoji-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Add emoji"
      >
        😊
      </button>

      {isOpen && (
        <div className="emoji-picker-popup">
          <div className="emoji-categories">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                className={`emoji-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[activeCategory].map((emoji, idx) => (
              <button
                key={idx}
                className="emoji-item"
                onClick={() => handleSelect(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
