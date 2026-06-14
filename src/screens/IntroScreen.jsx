/**
 * IntroScreen.jsx — Tailwind v4
 * Drop /public/intro.mp4 to use a real video. Falls back to canvas animation.
 */

import { useEffect, useRef, useState } from 'react'
import { useGameStore, APP_SCREENS } from '../stores/useGameStore'

function ProceduralIntro({ onComplete }) {
  const canvasRef = useRef()
  const rafRef    = useRef()
  const startRef  = useRef(null)
  const DURATION  = 4500

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 120 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      vx:   (Math.random() - 0.5) * 0.8,
      vy:   -Math.random() * 1.5 - 0.5,
      size: Math.random() * 2.5 + 0.5,
      life: Math.random(),
    }))

    function draw(ts) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(elapsed / DURATION, 1)

      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      if (t < 0.35) {
        const burstT = t / 0.35
        ctx.save()
        ctx.globalAlpha = burstT * 0.6
        for (let i = 0; i < 40; i++) {
          const angle = (i / 40) * Math.PI * 2
          const len   = 80 + burstT * 280
          const gx    = cx + Math.cos(angle) * len * 0.1
          const gy    = cy + Math.sin(angle) * len * 0.1
          const ex    = cx + Math.cos(angle) * len
          const ey    = cy + Math.sin(angle) * len
          const grad  = ctx.createLinearGradient(gx, gy, ex, ey)
          grad.addColorStop(0, `rgba(230,57,70,${0.8 * burstT})`)
          grad.addColorStop(1, 'rgba(230,57,70,0)')
          ctx.beginPath()
          ctx.moveTo(gx, gy)
          ctx.lineTo(ex, ey)
          ctx.strokeStyle = grad
          ctx.lineWidth   = 1 + Math.random()
          ctx.stroke()
        }
        ctx.restore()
      }

      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.003
        if (p.life <= 0 || p.y < 0) {
          p.x = Math.random() * canvas.width; p.y = canvas.height + 10
          p.life = 0.6 + Math.random() * 0.4
          p.vy = -Math.random() * 1.5 - 0.3; p.vx = (Math.random() - 0.5) * 0.8
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230,${57 + Math.random() * 100},70,${p.life * 0.6})`
        ctx.fill()
      })

      const logoT = Math.max(0, Math.min((t - 0.2) / 0.35, 1))
      if (logoT > 0) {
        const fade = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : logoT
        ctx.save()
        ctx.globalAlpha = fade * 0.25
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200)
        bloom.addColorStop(0, '#e63946'); bloom.addColorStop(1, 'transparent')
        ctx.fillStyle = bloom
        ctx.fillRect(cx - 200, cy - 200, 400, 400)
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = fade * 0.5
        ctx.font = '600 11px "Courier New"'
        ctx.fillStyle = '#e63946'; ctx.textAlign = 'center'
        ctx.fillText('STUDIO PRESENTS', cx, cy - 68)
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = fade
        ctx.font = `900 ${Math.round(88 + logoT * 8)}px "Courier New"`
        ctx.fillStyle = 'white'; ctx.textAlign = 'center'
        ctx.shadowColor = '#e63946'; ctx.shadowBlur = 40 * fade
        ctx.fillText('APEX', cx, cy + 22)
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = fade * 0.7
        ctx.font = '400 14px "Courier New"'
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'center'
        ctx.fillText('RACING', cx, cy + 52)
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = fade * 0.4
        ctx.strokeStyle = '#e63946'; ctx.lineWidth = 1
        const ruleW = logoT * 180
        ctx.beginPath(); ctx.moveTo(cx - ruleW, cy + 66); ctx.lineTo(cx + ruleW, cy + 66); ctx.stroke()
        ctx.restore()
      }

      if (t > 0.82) {
        ctx.save()
        ctx.globalAlpha = (t - 0.82) / 0.18
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      }

      if (t < 1) rafRef.current = requestAnimationFrame(draw)
      else onComplete()
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onComplete])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
}

export function IntroScreen() {
  const screen    = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const [useVideo, setUseVideo] = useState(true)
  const [visible, setVisible]   = useState(true)

  if (screen !== APP_SCREENS.INTRO) return null

  const finish = () => {
    setVisible(false)
    setTimeout(() => setScreen(APP_SCREENS.MAIN_MENU), 400)
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black overflow-hidden cursor-pointer"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
      onClick={finish}
    >
      {useVideo ? (
        <video
          src="/intro.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          playsInline muted autoPlay
          onEnded={finish}
          onError={() => setUseVideo(false)}
        />
      ) : (
        <ProceduralIntro onComplete={finish} />
      )}

      <div
        className="absolute bottom-7 right-8 text-[11px] font-mono tracking-[0.2em] text-text-dim animate-fadein"
        style={{ animationDelay: '1.5s' }}
      >
        CLICK TO SKIP
      </div>
    </div>
  )
}
