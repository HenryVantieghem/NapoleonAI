"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Crown, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavbarProps {
  className?: string
}

const navigationItems = [
  {
    name: "Features",
    href: "#features",
    description: "AI-powered executive tools"
  },
  {
    name: "How It Works",
    href: "#how-it-works", 
    description: "Strategic communication process"
  },
  {
    name: "Testimonials",
    href: "#testimonials",
    description: "C-suite success stories"
  },
  {
    name: "Pricing",
    href: "#pricing",
    description: "Executive investment plans"
  }
]

export function Navbar({ className }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "backdrop-luxury border-b border-gray-200 shadow-luxury" 
            : "bg-transparent",
          className
        )}
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <Crown className="w-8 h-8 text-burgundy-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="logo-text text-xl">Napoleon AI</span>
                <span className="text-xs text-gray-500 font-medium">Executive Commander</span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
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
                    className="text-gray-700 hover:text-burgundy-600 font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>{item.name}</span>
                  </a>
                  
                  {/* Hover Tooltip */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    {item.description}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  variant="luxury" 
                  size="md"
                  className="group"
                  onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Crown className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  Take Command Now
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-burgundy-600 transition-colors"
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-40 backdrop-luxury border-b border-gray-200 lg:hidden"
          >
            <div className="container-luxury">
              <div className="py-6 space-y-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <a
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-lg font-medium text-gray-700 hover:text-burgundy-600 transition-colors"
                      >
                        {item.name}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Executive Features */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-burgundy-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Secure</span>
                    </div>
                    <div className="text-center">
                      <Crown className="w-8 h-8 text-burgundy-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">Luxury</span>
                    </div>
                    <div className="text-center">
                      <Zap className="w-8 h-8 text-burgundy-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700">AI-Powered</span>
                    </div>
                  </div>
                </div>

                {/* Mobile CTA Buttons */}
                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="luxury" 
                    size="lg"
                    className="w-full group"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <Crown className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Take Command Now
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-20 left-0 right-0 h-0.5 bg-burgundy-600 z-40 origin-left"
        style={{
          scaleX: isScrolled ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      />
    </>
  )
}