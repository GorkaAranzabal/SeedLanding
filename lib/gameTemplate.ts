// Wraps the agent's Three.js module source in a complete, sandboxed HTML
// document. Loaded into the preview iframe via srcdoc. The import map pins a
// modern Three.js (+ examples/jsm addons) from a CDN, and the error harness
// forwards runtime errors to the parent window via postMessage so the host UI
// can surface them and offer an auto-fix.

const THREE_VERSION = '0.160.0';

export function gameTemplate(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a0a; font-family: 'Space Mono', monospace; }
  #app { width: 100vw; height: 100vh; position: relative; }
  canvas { display: block; }
  #seed-error {
    position: fixed; inset: 0; display: none; flex-direction: column; gap: 8px;
    padding: 24px; background: rgba(10,10,10,0.92); color: #ff6b6b; z-index: 99999;
    font-size: 12px; line-height: 1.5; white-space: pre-wrap; overflow: auto;
  }
  #seed-error h2 { color: #fff; font-size: 13px; letter-spacing: 0.2em; }
</style>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/"
  }
}
</script>
</head>
<body>
<div id="app"></div>
<div id="seed-error"><h2>RUNTIME ERROR</h2><pre id="seed-error-msg"></pre></div>
<script>
  // Forward errors to the host and show an in-iframe overlay.
  function reportError(message) {
    try { parent.postMessage({ type: 'seed-game-error', message: String(message) }, '*'); } catch (e) {}
    var box = document.getElementById('seed-error');
    var msg = document.getElementById('seed-error-msg');
    if (box && msg) { msg.textContent = String(message); box.style.display = 'flex'; }
  }
  window.addEventListener('error', function (e) {
    reportError((e.error && e.error.stack) || e.message || 'Unknown error');
  });
  window.addEventListener('unhandledrejection', function (e) {
    reportError((e.reason && (e.reason.stack || e.reason.message)) || e.reason || 'Unhandled rejection');
  });
</script>
<script type="module">
${code}
//# sourceURL=seed-game.js
</script>
</body>
</html>`;
}
