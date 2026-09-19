import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <div className="logo-icon">
        <div className="logo-blade blade-cyan"></div>
        <div className="logo-blade blade-magenta"></div>
        <div className="logo-blade blade-yellow"></div>
        <div className="logo-blade blade-black"></div>
      </div>
      <span className="logo-text">Dsilk</span>
    </div>
  );
};
