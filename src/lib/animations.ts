import { Variants } from "framer-motion"

// Luxury fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

// Luxury scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

export const luxuryPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.175, 0.885, 0.32, 1.275],
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
}

// Stagger container for luxury lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

// Luxury hover animations
export const luxuryHover = {
  scale: 1.02,
  transition: { duration: 0.3, ease: "easeInOut" }
}

export const buttonHover = {
  scale: 1.05,
  boxShadow: "0 20px 60px rgba(128, 27, 43, 0.4)",
  transition: { duration: 0.3, ease: "easeInOut" }
}

// Executive entrance animations
export const executiveEntrance: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    rotateX: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

// Smooth slide animations
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
}

// Luxury text reveal
export const textReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    clipPath: "inset(100% 0% 0% 0%)"
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

// Floating animation for luxury elements
export const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Pulse animation for notifications
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Shimmer effect for loading states
export const shimmerAnimation = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Page transitions
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

// Card hover effect
export const cardHoverEffect = {
  rest: {
    scale: 1,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

// Luxury button press
export const buttonPress = {
  tap: {
    scale: 0.98,
    boxShadow: "0 5px 20px rgba(128, 27, 43, 0.2)",
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  }
}

// Success animation
export const successAnimation: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0,
    rotate: -180
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.175, 0.885, 0.32, 1.275],
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
}

// Smooth scroll reveal
export const scrollReveal = (delay = 0): Variants => ({
  hidden: { 
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1]
    }
  }
})

// Executive badge animation
export const badgeAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -5
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      ease: [0.175, 0.885, 0.32, 1.275]
    }
  }
}

// Notification slide in
export const notificationSlide: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}