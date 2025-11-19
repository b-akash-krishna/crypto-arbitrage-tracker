'use client'

import { useEffect, useRef } from 'react'

export function MarketGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Animation variables
    let rotation = 0
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
      color: string
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#00d9ff' : '#a855f7',
      })
    }

    let animationId: number

    function animate() {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.fillStyle = 'rgba(15, 15, 30, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      rotation += 0.002

      // Update and draw particles
      particles.forEach((p) => {
        // Rotate around origin
        const cosR = Math.cos(rotation)
        const sinR = Math.sin(rotation)
        const x1 = p.x * cosR - p.z * sinR
        const z1 = p.x * sinR + p.z * cosR

        // Perspective projection
        const scale = 400 / (400 + z1)
        const x2d = (x1 * scale + canvas.width / 2) | 0
        const y2d = (p.y * scale + canvas.height / 2) | 0

        // Draw particle
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0.1, scale)
        ctx.beginPath()
        ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2)
        ctx.fill()

        // Update position
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        // Bounce off walls
        if (Math.abs(p.x) > 200) p.vx *= -1
        if (Math.abs(p.y) > 200) p.vy *= -1
        if (Math.abs(p.z) > 200) p.vz *= -1
      })

      ctx.globalAlpha = 1

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dist = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2) +
            Math.pow(p1.z - p2.z, 2)
          )

          if (dist < 150) {
            const cosR = Math.cos(rotation)
            const sinR = Math.sin(rotation)
            const x1_1 = p1.x * cosR - p1.z * sinR
            const z1_1 = p1.x * sinR + p1.z * cosR
            const x1_2 = p2.x * cosR - p2.z * sinR
            const z1_2 = p2.x * sinR + p2.z * cosR

            const scale1 = 400 / (400 + z1_1)
            const scale2 = 400 / (400 + z1_2)

            const x2d_1 = x1_1 * scale1 + canvas.width / 2
            const y2d_1 = p1.y * scale1 + canvas.height / 2
            const x2d_2 = x1_2 * scale2 + canvas.width / 2
            const y2d_2 = p2.y * scale2 + canvas.height / 2

            ctx.strokeStyle = `rgba(0, 217, 255, ${0.3 * (1 - dist / 150)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x2d_1, y2d_1)
            ctx.lineTo(x2d_2, y2d_2)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
    />
  )
}
