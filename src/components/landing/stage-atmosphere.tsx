/**
 * Stage atmosphere — the landing page's shared environment.
 * Layered radial aurora glows (dominant brand blue, faint amber and
 * emerald), a whisper-quiet grid texture, and a soft vignette.
 * Fixed, pointer-transparent, slow-drifting via CSS (transform/opacity
 * only; frozen under reduced motion by the kill switch in globals.css).
 * Alphas are theme-tuned via the glow / grid-line / vignette-edge
 * tokens in .landing-scope, so it reads on white and near-black alike.
 *
 * Purely decorative; server-renderable, no motion dependency.
 */
export function StageAtmosphere(): React.ReactElement {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Dominant brand aurora — upper stage */}
      <div
        className="landing-aurora absolute -top-[20%] left-1/2 h-[55vh] w-[80vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-blue) 0%, var(--glow-blue-deep) 45%, transparent 70%)",
        }}
      />
      {/* Faint amber echo — lower left */}
      <div
        className="landing-aurora-slow absolute bottom-[5%] -left-[10%] h-[40vh] w-[45vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-amber) 0%, transparent 65%)",
        }}
      />
      {/* Faint emerald echo — mid right */}
      <div
        className="landing-aurora absolute top-[35%] -right-[12%] h-[40vh] w-[40vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--glow-emerald) 0%, transparent 65%)",
        }}
      />
      {/* Grid texture, masked to the stage */}
      <div className="landing-grid absolute inset-0" />
      {/* Vignette */}
      <div className="landing-vignette absolute inset-0" />
    </div>
  );
}
