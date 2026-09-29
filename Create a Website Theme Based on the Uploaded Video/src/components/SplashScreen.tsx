import React, { useState, useEffect } from 'react'

type SplashScreenProps = {
  onFinish: () => void
  duration?: number // in ms, defaults to 3000
}

export function SplashScreen({ onFinish, duration = 3000 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    const intervalTime = 30

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentPct = Math.min(100, Math.floor((elapsed / (duration - 300)) * 100))
      setProgress(currentPct)

      if (elapsed >= duration - 300) {
        setIsFadingOut(true)
      }

      if (elapsed >= duration) {
        clearInterval(timer)
        onFinish()
      }
    }, intervalTime)

    return () => clearInterval(timer)
  }, [duration, onFinish])

  return (
    <div className={`splash-overlay ${isFadingOut ? 'fade-out' : ''}`} aria-label="Loading Jal-Impact">
      {/* Ambient Backdrop */}
      <div className="splash-ambient-grid"></div>
      <div className="splash-ambient-glow glow-top"></div>

      <div className="splash-content-card minimal">
        {/* Animated Mascot Character */}
        <div className="splash-mascot-arena">
          <div className="splash-orbital-ring ring-1"></div>
          <div className="splash-sonar-wave"></div>

          <div className="splash-mascot-frame">
            <img
              src="/logo.png"
              alt="Jal-Bot Mascot"
              className="splash-mascot-image"
            />
            <div className="splash-holo-shine"></div>
          </div>

          <div className="splash-mascot-shadow"></div>
        </div>

        {/* Minimal Clean Title */}
        <div className="splash-brand-wrap">
          <h1 className="splash-main-title">
            JAL<span>-IMPACT</span>
          </h1>
        </div>

        {/* Minimal Clean Progress Bar */}
        <div className="splash-progress-section minimal">
          <div className="splash-progress-track">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress}%` }}
            >
              <span className="splash-fill-glow"></span>
            </div>
          </div>
          <span className="splash-percent-clean">{progress}%</span>
        </div>
      </div>
    </div>
  )
}
