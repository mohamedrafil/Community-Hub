import { motion } from 'framer-motion';

const Badge = ({ children, variant = 'primary', icon: Icon, className = '' }) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`badge ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </motion.span>
  );
};

export default Badge;
