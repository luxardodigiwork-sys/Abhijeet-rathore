import React from 'react';
import { motion } from 'motion/react';
import { LOGO_BASE64 } from './LogoData';

interface LogoProps {
  className?: string;
  as?: 'div' | 'h1' | 'h2' | 'span';
  variant?: 'default' | 'large' | 'inline';
  dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', as: Component = 'div', variant = 'default', dark = false }) => {
  const MotionComponent = motion.create(Component);

  if (variant === 'inline') {
    return (
      <MotionComponent 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className={`font-display tracking-[0.2em] font-bold ${className}`}
      >
        LUXARDO
      </MotionComponent>
    );
  }

  return (
    <motion.img 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      src={LOGO_BASE64}
      alt="LUXARDO" 
      className={`object-contain h-auto  brightness-0 ${dark ? 'invert' : ''} ${variant === 'large' ? 'w-full max-w-6xl opacity-[0.03]' : ''} ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
