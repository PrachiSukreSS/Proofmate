import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxSection = ({ 
  children, 
  speed = 0.5, 
  className = '',
  direction = 'vertical',
  offset = 0 
}) => {
  const ref = useRef(null);
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onResize = () => {
      setElementTop(element.offsetTop);
      setClientHeight(window.innerHeight);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const y = useTransform(
    scrollY,
    [elementTop - clientHeight, elementTop + clientHeight],
    direction === 'vertical' 
      ? [offset, -offset * speed * 100]
      : [0, 0]
  );

  const x = useTransform(
    scrollY,
    [elementTop - clientHeight, elementTop + clientHeight],
    direction === 'horizontal' 
      ? [offset, -offset * speed * 100]
      : [0, 0]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: direction === 'vertical' ? y : 0,
        x: direction === 'horizontal' ? x : 0,
      }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxSection;