import { useState, useEffect } from 'react';

const BottomSheet = ({ isOpen, onClose, title, options, selectedValue, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleSelect = (option) => {
    onSelect(option.value);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '60vh',
          background: 'white',
          borderRadius: '20px 20px 0 0',
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Handle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            background: '#ddd',
            borderRadius: '2px'
          }} />
        </div>

        {/* Title */}
        <div style={{
          padding: '0 20px 16px',
          borderBottom: '1px solid #eee'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            margin: 0,
            textAlign: 'center'
          }}>
            {title}
          </h3>
        </div>

        {/* Options */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0'
        }}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: 'none',
                background: selectedValue === option.value ? '#f0f4ff' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.15s ease'
              }}
            >
              <span style={{
                fontSize: '16px',
                color: selectedValue === option.value ? '#667eea' : '#333',
                fontWeight: selectedValue === option.value ? '600' : '400'
              }}>
                {option.label}
              </span>
              {selectedValue === option.value && (
                <span style={{ color: '#667eea', fontSize: '18px' }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Safe area for mobile */}
        <div style={{ height: '20px' }} />
      </div>
    </div>
  );
};

export default BottomSheet;
