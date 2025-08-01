"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Crown, Shield, Zap, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NapoleonLogo } from "@/components/ui/napoleon-logo"
import { cn } from "@/lib/utils"

interface NavbarProps {
  className?: string
}

const navigationItems = [
  {
    name: "Command Center",
    href: "#features",
    description: "Executive intelligence dashboard"
  },
  {
    name: "Flight Plan",
    href: "#how-it-works", 
    description: "Strategic implementation process"
  },
  {
    name: "Executive Testimonials", 
    href: "#testimonials",
    description: "Fortune 500 success stories"
  },
  {
    name: "Investment",
    href: "#pricing",
    description: "Private jet experience pricing"
  }
]

export function Navbar({ className }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>, itemName: string) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()
    const navRect = navRef.current?.getBoundingClientRect()
    
    if (navRect) {
      setHoverPosition({
        left: rect.left - navRect.left,
        width: rect.width
      })
      setHoveredItem(itemName)
    }
  }

  const handleMouseLeave = () => {
    setHoveredItem(null)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "backdrop-blur-executive bg-jetBlack/80 border-b border-platinumSilver/20 shadow-luxury-glass" 
            : "bg-jetBlack/60 backdrop-blur-glass",
          className
        )}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Napoleon Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
            >
              <NapoleonLogo 
                variant={isScrolled ? "gold" : "light"} 
                size="md" 
                showIcon={true}
              />
            </motion.div>

            {/* Hover-Bar Desktop Navigation */}
            <div 
              ref={navRef}
              className="hidden lg:flex items-center relative"
              onMouseLeave={handleMouseLeave}
            >
              {/* Interactive Underline Slider */}
              <AnimatePresence>
                {hoveredItem && (
                  <motion.div
                    layoutId="hover-underline"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scaleX: 1,
                      x: hoverPosition.left,
                      width: hoverPosition.width
                    }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 30,
                      duration: 0.3
                    }}
                    className="absolute bottom-0 h-0.5 bg-gradient-champagne rounded-full"
                    style={{ 
                      transformOrigin: "left center"
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Navigation Items */}
              <div className="flex items-center space-x-8 px-8 py-4">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.3 }}
                    className="group relative"
                  >
                    <a
                      href={item.href}
                      onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                      className="relative text-warmIvory hover:text-champagneGold font-medium transition-colors duration-300 py-2 px-1 tracking-wide"
                    >
                      <span className="relative z-10">{item.name}</span>
                      
                      {/* Luxury glow effect on hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 rounded-lg bg-champagneGold/5 backdrop-blur-glass transition-opacity duration-300"
                      />
                    </a>
                    
                    {/* Executive Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      whileHover={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-3 bg-midnightBlue/90 backdrop-blur-executive border border-platinumSilver/20 text-warmIvory text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-luxury-glass"
                    >
                      {item.description}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-midnightBlue/90 border-l border-t border-platinumSilver/20 rotate-45" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Gold Pill CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  variant="ghost" 
                  size="md"
                  className="text-warmIvory hover:text-champagneGold hover:bg-midnightBlue/20 backdrop-blur-glass border border-transparent hover:border-platinumSilver/20 transition-all duration-300"
                >
                  Executive Access
                </Button>
              </motion.div>
              
              {/* Gold Pill Sign Up */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="relative bg-gradient-champagne text-jetBlack font-semibold px-6 py-2 rounded-full border-0 shadow-champagne hover:shadow-champagne-lg transition-all duration-300 group overflow-hidden"
                  onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Plane className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  <span className="relative z-10">Take Flight</span>
                  
                  {/* Gold shimmer effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-700" />
                </Button>
              </motion.div>
            </div>

            {/* Private Jet Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-warmIvory hover:text-champagneGold transition-colors duration-300 rounded-xl hover:bg-midnightBlue/20 backdrop-blur-glass"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Private Jet Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-20 left-0 right-0 z-40 backdrop-blur-executive bg-jetBlack/90 border-b border-platinumSilver/20 lg:hidden shadow-luxury-glass"
          >
            <div className="container mx-auto px-6">
              <div className="py-8 space-y-8">
                {/* Mobile Navigation Links */}
                <div className="space-y-6">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index + 0.1 }}
                      className="group"
                    >
                      <a
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-xl font-medium text-warmIvory hover:text-champagneGold transition-colors duration-300 py-2"
                      >
                        {item.name}
                      </a>
                      <p className="text-sm text-platinumSilver-400 mt-1 opacity-80">{item.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Private Jet Mobile Features */}
                <div className="border-t border-platinumSilver/20 pt-8">
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center group"
                    >
                      <div className="backdrop-blur-glass bg-midnightBlue/20 border border-platinumSilver/20 rounded-2xl p-4 mb-3 group-hover:shadow-luxury-glass transition-all duration-300">
                        <Shield className="w-8 h-8 text-champagneGold mx-auto group-hover:animate-pulse" />
                      </div>
                      <span className="text-sm font-medium text-warmIvory">Executive Security</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-center group"
                    >
                      <div className="backdrop-blur-glass bg-midnightBlue/20 border border-platinumSilver/20 rounded-2xl p-4 mb-3 group-hover:shadow-luxury-glass transition-all duration-300">
                        <Plane className="w-8 h-8 text-champagneGold mx-auto group-hover:animate-pulse" />
                      </div>
                      <span className="text-sm font-medium text-warmIvory">Private Jet Experience</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="text-center group"
                    >
                      <div className="backdrop-blur-glass bg-midnightBlue/20 border border-platinumSilver/20 rounded-2xl p-4 mb-3 group-hover:shadow-luxury-glass transition-all duration-300">
                        <Crown className="w-8 h-8 text-champagneGold mx-auto group-hover:animate-pulse" />
                      </div>
                      <span className="text-sm font-medium text-warmIvory">AI Intelligence</span>
                    </motion.div>
                  </div>
                </div>

                {/* Private Jet Mobile CTA Buttons */}
                <div className="space-y-4 border-t border-platinumSilver/20 pt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="w-full text-warmIvory hover:text-champagneGold hover:bg-midnightBlue/20 backdrop-blur-glass border border-platinumSilver/20 rounded-2xl"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Executive Access
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button 
                      className="w-full bg-gradient-champagne text-jetBlack font-semibold py-4 rounded-2xl border-0 shadow-champagne group overflow-hidden relative"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      <Plane className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                      <span className="relative z-10">Take Flight</span>
                      
                      {/* Mobile gold shimmer */}
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-700" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Private Jet Runway Progress Indicator */}
      <motion.div
        className="fixed top-20 left-0 right-0 h-1 bg-gradient-champagne z-40 origin-left shadow-champagne"
        style={{
          scaleX: isScrolled ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Runway Lights Effect */}
      {isScrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-[81px] left-0 right-0 h-0.5 z-40"
        >
          <div className="flex justify-between px-8">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-1 h-1 bg-champagneGold rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}