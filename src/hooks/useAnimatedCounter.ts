import { useState, useEffect, useRef } from 'react'

export function useAnimatedCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0)
  const startTime = useRef<number | null>(null)
  const frameRef = useRef<number>()
  const hasStarted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted.current) {
          hasStarted.current = true
          const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp
            const elapsed = timestamp - startTime.current
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) {
              frameRef.current = requestAnimationFrame(animate)
            } else {
              setCount(target)
            }
          }
          frameRef.current = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.1 }
    )

    const el = document.getElementById('counter-trigger')
    if (el) observer.observe(el)

    // Fallback: start immediately
    const timer = setTimeout(() => {
      if (!hasStarted.current) {
        hasStarted.current = true
        const animate = (timestamp: number) => {
          if (!startTime.current) startTime.current = timestamp
          const elapsed = timestamp - startTime.current
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) {
            frameRef.current = requestAnimationFrame(animate)
          } else {
            setCount(target)
          }
        }
        frameRef.current = requestAnimationFrame(animate)
      }
    }, 500)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [target, duration])

  return count
}
