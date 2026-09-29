import { writeFile } from 'node:fs/promises'

const targets = await fetch('http://127.0.0.1:9335/json/list').then(response => response.json())
const page = targets.find(target => target.type === 'page' && target.url.startsWith('http://localhost:5173'))
if (!page) throw new Error('Isolated Edge did not have a local preview tab.')
const socket = new WebSocket(page.webSocketDebuggerUrl)
let nextId = 0
const pending = new Map()
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  const waiter = pending.get(message.id)
  if (!waiter) return
  pending.delete(message.id)
  if (message.error) waiter.reject(new Error(message.error.message))
  else waiter.resolve(message.result)
})
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId
  pending.set(id, { resolve, reject })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text)
  return response.result.value
}
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
const capture = async filename => {
  const response = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(filename, Buffer.from(response.data, 'base64'))
}
const report = async label => console.log(label, await evaluate("JSON.stringify({route:location.pathname,theme:document.querySelector('.app')?.className,rootTheme:document.documentElement.dataset.theme,heading:document.querySelector('.shell h1')?.innerText,headlineCharWrappers:document.querySelector('.shell h1')?.querySelectorAll('span').length||0,brightCards:[...document.querySelectorAll('.gov-kpis button,.public-kpis button,.ops-kpis button,.indicator-grid button,.alert-card,.field-form,.field-asset,.priority-detail,.spatial-panel,.gov-feed,.inspection-table')].filter(el=>{const c=getComputedStyle(el).backgroundColor.match(/\d+/g)?.map(Number)||[];return c.length>=3&&c[0]>215&&c[1]>215&&c[2]>215}).map(el=>el.className||el.parentElement?.className||el.tagName),kpiText:(()=>{const e=document.querySelector('.gov-kpis button');return e&&{value:getComputedStyle(e.querySelector('b')).color,label:getComputedStyle(e.querySelector('small')).color,background:getComputedStyle(e).backgroundColor}})()})"))
const openRoute = async label => {
  const found = await evaluate(`(() => { const button=[...document.querySelectorAll('.sidebar nav button')].find(item=>item.innerText.trim().toLowerCase().includes(${JSON.stringify(label.toLowerCase())})); if(!button)return false; button.click(); return true; })()`)
  if (!found) throw new Error(`Command Center route not found: ${label}`)
  await pause(label === 'Spatial Analytics' ? 1800 : 1000)
  await report(label.toUpperCase())
}

await send('Page.enable')
await send('Runtime.enable')
await pause(1200)
await capture('.verify-login.png')
await evaluate("localStorage.setItem('jal-impact-auth', JSON.stringify({ authenticated: true, role: 'government', governmentRole: 'district_officer' })); localStorage.setItem('jal-impact-theme-v2','light'); location.reload(); true")
await pause(2200)
await report('GOVERNMENT OVERVIEW / STALE LIGHT PREFERENCE')
await capture('.verify-government.png')

const point = await evaluate("(() => { const button=document.querySelector('.sidebar nav button:nth-child(2)'); const rect=button.getBoundingClientRect(); return {x:rect.x+rect.width/2,y:rect.y+rect.height/2} })()")
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, button: 'none' })
await pause(240)
console.log('COMMAND CENTER HOVER', await evaluate("(() => {const e=document.querySelector('.sidebar nav button:nth-child(2)');const s=getComputedStyle(e);return JSON.stringify({label:e.innerText.trim(),background:s.backgroundColor,border:s.borderColor,transform:s.transform,shine:getComputedStyle(e,'::after').opacity})})()"))
await capture('.verify-hover.png')
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
await pause(100)
console.log('KEYBOARD FOCUS', await evaluate("(() => {const e=document.activeElement,s=getComputedStyle(e);return JSON.stringify({label:e.innerText?.trim(),commandCenter:!!e.closest('.sidebar nav'),outline:s.outlineStyle+' '+s.outlineWidth+' '+s.outlineColor})})()"))
await capture('.verify-focus.png')

await openRoute('Field Observation')
await capture('.verify-field.png')
await openRoute('Spatial Analytics')
await capture('.verify-analytics.png')
await openRoute('Priority Intervention')
await capture('.verify-priority.png')
await openRoute('Alerts')
await capture('.verify-alerts.png')
await openRoute('Reports')
await capture('.verify-reports.png')
await openRoute('GIS Map')
await capture('.verify-map.png')

await evaluate("localStorage.setItem('jal-impact-auth', JSON.stringify({ authenticated: true, role: 'public' })); localStorage.setItem('jal-impact-theme-v2','water'); location.reload(); true")
await pause(2000)
await report('PUBLIC OVERVIEW / STALE WATER PREFERENCE')
await capture('.verify-public.png')
await openRoute('Development Insights')
await capture('.verify-public-insights.png')
await openRoute('Geo-Coded Images')
await capture('.verify-public-images.png')

socket.close()
