import { motion } from 'framer-motion';

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = "",
  glowColor = '#16a34a'
}) => {
  const variants = {
    primary: 'bg-[#16a34a] text-white',
    secondary: 'bg-white border border-[#16a34a] text-[#16a34a]',
    outline: 'bg-transparent border border-[#e2e8f0] text-[#64748b] hover:text-[#16a34a]'
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.03,
        boxShadow: `0 0 15px ${glowColor}, 0 0 30px ${glowColor}80`,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl px-5 py-2.5 font-medium transition-all duration-300 ${variants[variant]} ${className}`}
    >
      {/* Efecto ripple */}
      <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
      
      {/* Luz que se mueve al hacer hover */}
      <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      </span>
      
      {children}
    </motion.button>
  );
};

export default AnimatedButton;