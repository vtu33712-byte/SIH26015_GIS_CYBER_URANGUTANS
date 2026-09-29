export function VideoBackdrop() {
  return <div className="video-backdrop" aria-hidden="true">
    <video src="/videos/jal-watershed-background.mp4" autoPlay muted loop playsInline preload="metadata" tabIndex={-1}/>
  </div>
}
