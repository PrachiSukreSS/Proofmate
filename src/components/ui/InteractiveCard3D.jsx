import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const InteractiveCard3D = ({ 
  children, 
  className = '', 
  intensity = 10,
  perspective = 1000,
  scale = 1.02,
  glowEffect = false,
  ...props 
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateXValue = (mouseY / (rect.height / 2)) * intensity;
    const rotateYValue = (mouseX / (rect.width / 2)) * intensity;
    
    setRotateX(-rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative transform-gpu transition-all duration-300 ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? scale : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      {...props}
    >
      {/* Glow Effect */}
      {glowEffect && isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ transform: 'translateZ(-10px)' }}
        />
      )}
      
      {/* Card Content */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
      
      {/* Reflection Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none"
        style={{
          transform: 'translateZ(1px)',
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default InteractiveCard3D;