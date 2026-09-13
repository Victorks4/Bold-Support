import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

const ORB_SIZE = 43
const VIDEO_SRC = '/videos/login.mp4'

function centerOrb(mx: ReturnType<typeof useMotionValue<number>>, my: ReturnType<typeof useMotionValue<number>>, el: HTMLElement) {
  const w = el.clientWidth
  const h = el.clientHeight
  mx.set(w / 2 - ORB_SIZE / 2)
  my.set(h / 2 - ORB_SIZE / 2)
}

export function LoginLeftPanel() {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const [videoReady, setVideoReady] = useState(false)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const gx = useSpring(mx, { stiffness: 460, damping: 42 })
  const gy = useSpring(my, { stiffness: 460, damping: 42 })

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = rootRef.current
      if (!el || reduce) return
      const r = el.getBoundingClientRect()
      mx.set(e.clientX - r.left - ORB_SIZE / 2)
      my.set(e.clientY - r.top - ORB_SIZE / 2)
    },
    [mx, my, reduce],
  )

  const onPointerLeave = useCallback(() => {
    const el = rootRef.current
    if (!el || reduce) return
    centerOrb(mx, my, el)
  }, [mx, my, reduce])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    centerOrb(mx, my, el)
    const ro = new ResizeObserver(() => centerOrb(mx, my, el))
    ro.observe(el)
    return () => ro.disconnect()
  }, [mx, my])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => setVideoReady(false))
  }, [])

  return (
    <div
      ref={rootRef}
      className="login-left-panel relative isolate min-h-[42vh] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 lg:min-h-dvh"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <video
        ref={videoRef}
        className={`login-left-panel__video transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
      />

      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" aria-hidden />

      {!reduce && (
        <motion.div
          className="pointer-events-none absolute z-[2] backdrop-blur-2xl will-change-transform"
          style={{
            width: ORB_SIZE,
            height: ORB_SIZE,
            borderRadius: ORB_SIZE,
            x: gx,
            y: gy,
            background: 'radial-gradient(circle at 30% 30%, rgba(96,165,250,0.55), rgba(37,99,235,0.15) 70%, transparent)',
            boxShadow: '0 0 40px rgba(59,130,246,0.35)',
          }}
          aria-hidden
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] p-8">
        <p className="max-w-sm text-lg font-semibold text-white drop-shadow-md">
          Suporte que acompanha cada chamado do início ao fim.
        </p>
        <p className="mt-2 max-w-sm text-sm text-blue-100/80">
          Coloque seu vídeo em <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">public/videos/login.mp4</code>
        </p>
      </div>
    </div>
  )
}
