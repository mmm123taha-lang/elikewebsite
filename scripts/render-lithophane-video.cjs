// Run node scripts/render-lithophane-video.cjs. Requires Chromium and FFmpeg.
// Original 3D product visualization; no customer photograph is used.
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const http = require('node:http')
const temporary = process.env.LITHO_FRAME_DIR || '/tmp/elike-realistic-video'
;(async () => {
  fs.mkdirSync(temporary, { recursive: true })
  const build = spawnSync(process.execPath, [path.resolve('node_modules/vite/bin/vite.js'), 'build', '--config', 'scripts/video.vite.config.ts'], { stdio: 'inherit' })
  if (build.status !== 0) throw Error('Renderer build failed')
  const files = { '/scene.js': ['/tmp/elike-video-build/scene.js', 'text/javascript'], '/example.webp': [path.resolve('public/media/lithophane-example.webp'), 'image/webp'] }
  const server = http.createServer((request, response) => {
    if (request.url === '/') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end('<!doctype html><title>ELIKE video renderer</title>'); return }
    const file = files[request.url]
    if (!file) { response.writeHead(404); response.end(); return }
    response.writeHead(200, { 'Content-Type': file[1] }); fs.createReadStream(file[0]).pipe(response)
  })
  await new Promise(resolve => server.listen(4182, '127.0.0.1', resolve))
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] })
  const page = await browser.newPage({ viewport: { width: 900, height: 1125 }, deviceScaleFactor: 1 })
  page.on('pageerror', error => { throw error })
  await page.goto('http://127.0.0.1:4182')
  await page.evaluate(async () => {
    const { LithophaneScene } = await import('/scene.js')
    const render = document.createElement('canvas'), output = document.createElement('canvas')
    render.width = output.width = 900; render.height = output.height = 1125
    document.body.replaceChildren(render)
    const scene = new LithophaneScene(render, 1)
    scene.resize(900, 1125)
    await scene.configure({ photo: '/example.webp', width: 10, height: 15, shape: 'arch', zoom: 1, lit: false })
    window.lithoMovie = { scene, render, output }
  })
  for (let frame = 0; frame < 216; frame++) {
    const data = await page.evaluate(frame => {
      const { scene, render, output } = window.lithoMovie, t = frame / 24
      const phase = Math.max(0, Math.min(1, (t - 3.1) / 2))
      const light = phase * phase * (3 - 2 * phase)
      scene.targetLight = light; scene.orbit = -.18 + t / 9 * .3; scene.render(true)
      const ctx = output.getContext('2d'); ctx.drawImage(render, 0, 0)
      ctx.fillStyle = light > .6 ? '#FDFDFB' : '#191816'; ctx.textAlign = 'center'; ctx.font = '600 15px Arial'
      ctx.fillText('E L I K E  /  A MEMORY IN A DIFFERENT LIGHT', 450, 66)
      ctx.font = '38px Arial'
      ctx.fillText(t < 3.1 ? 'Printed in white.' : t < 5.5 ? 'Just add light.' : 'A memory comes to life.', 450, 117)
      ctx.font = '19px Arial'
      ctx.fillText(t < 3.1 ? 'Fine layers. A photograph you can feel.' : t < 5.5 ? 'Light reveals the details in every layer.' : 'Your photograph. A little more personal.', 450, 1059)
      ctx.font = '12px Arial'; ctx.globalAlpha = .72; ctx.fillText('3D PRODUCT VISUALIZATION', 450, 1091); ctx.globalAlpha = 1
      return output.toDataURL('image/jpeg', .94).split(',')[1]
    }, frame)
    fs.writeFileSync(path.join(temporary, String(frame).padStart(4, '0') + '.jpg'), Buffer.from(data, 'base64'))
    if (frame % 48 === 0) console.log(`Rendered ${frame}/216 frames`)
  }
  await browser.close(); await new Promise(resolve => server.close(resolve))
  const result = spawnSync('ffmpeg', ['-hide_banner','-loglevel','error','-y','-framerate','24','-i',path.join(temporary,'%04d.jpg'),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-t','9',path.join(temporary,'lithophane-intro.mp4')], { stdio: 'inherit' })
  if (result.status !== 0) throw Error('Video encoding failed')
  fs.copyFileSync(path.join(temporary,'lithophane-intro.mp4'),'public/media/lithophane-intro.mp4')
  fs.copyFileSync(path.join(temporary,'0175.jpg'),'public/media/lithophane-poster.jpg')
  console.log('Saved 9-second realistic lithophane video and poster.')
})().catch(error => { console.error(error); process.exit(1) })
