"use client"

import { useEffect, useRef, useCallback } from "react"

interface ConfettiProps {
  trigger?: boolean
  colors?: string[]
  particleCount?: number
  duration?: number
  spread?: number
  origin?: { x: number; y: number }
  onComplete?: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  decay: number
  shape: 'circle' | 'square' | 'triangle'
}

export const ConfettiAnimation = ({
  trigger = false,
  colors = ['#D4AF37', '#E8BE35', '#F6F6F4', '#C7CAD1', '#8C5A3C'],
  particleCount = 50,
  duration = 3000,
  spread = 180,
  origin = { x: 0.5, y: 0.8 },
  onComplete
}: ConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180)
    const velocity = Math.random() * 10 + 5
    
    return {
      x: canvas.width * origin.x,
      y: canvas.height * origin.y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      life: 1,
      decay: Math.random() * 0.015 + 0.01,
      shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
    }
  }, [colors, origin, spread])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save()
    ctx.globalAlpha = particle.life
    ctx.fillStyle = particle.color
    
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.vx * 0.1)
    
    switch (particle.shape) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'square':
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        break
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(0, -particle.size / 2)
        ctx.lineTo(-particle.size / 2, particle.size / 2)
        ctx.lineTo(particle.size / 2, particle.size / 2)
        ctx.closePath()
        ctx.fill()
        break
    }
    
    ctx.restore()
  }, [])

  const updateParticle = useCallback((particle: Particle, canvas: HTMLCanvasElement) => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vy += 0.3 // gravity
    particle.vx *= 0.99 // air resistance
    particle.life -= particle.decay
    
    return particle.life > 0 && particle.y < canvas.height + 10
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with fade effect for trails
    ctx.fillStyle = 'rgba(11, 13, 17, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      const alive = updateParticle(particle, canvas)
      if (alive) {
        drawParticle(ctx, particle)
      }
      return alive
    })

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    } else if (onComplete) {
      onComplete()
    }
  }, [drawParticle, updateParticle, onComplete])

  const startConfetti = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Create particles
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas))

    // Start animation
    animate()

    // Auto-stop after duration
    setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      particlesRef.current = []
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      if (onComplete) {
        onComplete()
      }
    }, duration)
  }, [animate, createParticle, duration, onComplete, particleCount])

  useEffect(() => {
    if (trigger) {
      startConfetti()
    }
  }, [trigger, startConfetti])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  )
}

// Executive celebration confetti for major achievements
export const ExecutiveConfetti = ({ trigger, onComplete }: { trigger: boolean; onComplete?: () => void }) => {
  return (
    <ConfettiAnimation
      trigger={trigger}
      colors={['#D4AF37', '#E8BE35', '#F6F6F4', '#C7CAD1', '#122039']}
      particleCount={80}
      duration={4000}
      spread={160}
      origin={{ x: 0.5, y: 0.7 }}
      onComplete={onComplete}
    />
  )
}

// VIP confetti for premium interactions
export const VIPConfetti = ({ trigger, onComplete }: { trigger: boolean; onComplete?: () => void }) => {
  return (
    <ConfettiAnimation
      trigger={trigger}
      colors={['#8C5A3C', '#D4AF37', '#B8962F', '#F6F6F4']}
      particleCount={60}
      duration={3500}
      spread={140}
      origin={{ x: 0.5, y: 0.6 }}
      onComplete={onComplete}
    />
  )
}

// Success confetti for completed actions
export const SuccessConfetti = ({ trigger, onComplete }: { trigger: boolean; onComplete?: () => void }) => {
  return (
    <ConfettiAnimation
      trigger={trigger}
      colors={['#10B981', '#D4AF37', '#F6F6F4', '#C7CAD1']}
      particleCount={40}
      duration={2500}
      spread={120}
      origin={{ x: 0.5, y: 0.5 }}
      onComplete={onComplete}
    />
  )
}

// Utility hook for triggering confetti
export const useConfetti = () => {
  const triggerExecutiveConfetti = useCallback(() => {
    const event = new CustomEvent('executive-confetti')
    window.dispatchEvent(event)
  }, [])

  const triggerVIPConfetti = useCallback(() => {
    const event = new CustomEvent('vip-confetti')
    window.dispatchEvent(event)
  }, [])

  const triggerSuccessConfetti = useCallback(() => {
    const event = new CustomEvent('success-confetti')
    window.dispatchEvent(event)
  }, [])

  return {
    triggerExecutiveConfetti,
    triggerVIPConfetti,
    triggerSuccessConfetti
  }
}

export default ConfettiAnimation