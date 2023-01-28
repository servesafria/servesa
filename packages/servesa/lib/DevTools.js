import express from "express";
import { report, randomString } from "./utils";

export const DevTools = Servesa => new class {
  HOT_RELOAD = `<script type="text/javascript" src="/_reload.js"></script>`
  startErrorApp = error => {
    if (Servesa.error) return;
    let waiting = new Set();
    process.on('beforeexit', () => [...waiting].forEach(res => res.end()));
    Servesa.error = error;
    console.error(error)
    const errorApp = express()
    errorApp.get('/_wait', (req, res, next) => {
      waiting.add(res)
      report('_wait', waiting.size)
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      })
      res.write('retry: 500\n\n')
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
      req.on('close', () => {
        waiting.delete(res)
        console.log('_wait end', waiting.size)
        res.end()
        next()
      })
    })
    errorApp.use('/', (req, res, next) => {
      res.send(`
      <html>
        <head>${Servesa.HOT_RELOAD}</head>
        <body><big>Error: ${error.message}</big></body>
      </html>
      `)
    })
    errorApp.listen(Servesa.config.port, () => {
      report(`Listening on port ${Servesa.config.port}`)
    })
  }
  hotReloadHandler = () => {
    let KEY = randomString()
    Servesa.app.get('/_reload.js', (req, res, next) => {
      res.set({
        'Cache-Control': "no-cache, no-store, must-revalidate",
        'Content-Type': 'text/javascript',
      })
      res.send(('(' + String(`
        function () {
          let key;
          const src = new EventSource("/_wait")
          src.addEventListener('error', e => document.body.classList.add("servesa-disconnected"))
          src.addEventListener('message', e => e.data != (key ??= e.data) ? location.reload() : document.body?.classList.remove("servesa-disconnected"))
          window.addEventListener('beforeunload', e => src.close())
        }
      `) + ')()'))
    })
    let waiting = new Set();
    Servesa.app.get('/_wait', (req, res, next) => {
      waiting.add(res)
      report('_wait', waiting.size)
      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      })
      res.write('retry: 750\n\n')
      res.write(`data: ${KEY}\n\n`)
      let interval = setInterval(     
        ()=>res.write(`data: ${KEY}\n\n`),
        30000
      )
      req.on('close', () => {
        clearInterval(interval)
        waiting.delete(res)
        report('_wait end', waiting.size)
        next()
      })
      req.on('error', () => {
        clearInterval(interval)
        res.end()
        next();
      })
      res.on('error', () => {
        clearInterval(interval)
        res.end();
        next()
      })
    })
  }
  errorHandler = (err, req, res, next) => {
    if (res.writableEnded) {
      console.log(err)
      return next(err)
    }
    res.write(`
    <html>
      <head>${this.HOT_RELOAD}</head>
      <body><big><pre>
<big>[Error ${err.status}] ${String(err)}</big>

${JSON.stringify(err, null, 2)}          

${err.stack && err.stack
        .split("\n")
        .slice(0)
        .filter(line => !line.match(/ \(node:internal/))
        .map(line => {
          let m = line.match(/^(?:\s*at\s+)(?:<.*?>\s*)?(\S+\s+)?\(?(?:file:\/\/)?(?:.*\/(?=node_modules\/))?(?:.*\/servesa\/)?(.*?):(\d+):(\d+)\)?$/);
          if (!m) return '<i>' + line + '</i>'
          if (m[2].match(/node(:|_modules)/)) {
            return '' + (m[1] || '(anon)').padEnd(32) + ' | ' + m[2]
          }
          return '  ' + (m[1] || '(anon)').padEnd(30) + ' | <b>' + m[2] + ':' + m[3] + ':' + m[4] + '</b>'
        })
        .join("\n")
      }
      </pre></big>
      </body>
    </html>
    `)
    res.end()
    next()
  }
}