import { Hono } from 'hono'
import { html } from 'hono/html'
import { serve } from 'bun'
import { createBot, createProxy } from 'oauth2-discord-proxy'
import { readFile, readdir } from 'node:fs/promises'

function createServer(config) {
  const {
    client_id,
    client_secret,
    discord_guild_id,
    discord_token,
    dynmap_port,
    oauth2_callback,
    oauth2_endpoint,
    port,
  } = config

  const app = new Hono()

  app.route('/', createProxy({
    bot: createBot(discord_token),
    client_id,
    client_secret,
    discord_guild_id,
    oauth2_callback,
    oauth2_endpoint,
  }))

  app.get('/', c => c.redirect('/maps/'))

  app.get('/backups/*', async c => {
    // .replace(/^\/backups\//, '')
    const path = c.req.path
      .slice(9)

    if (path.length === 0) {
      const files = await readdir('../backups', {
        withFileTypes: true,
      })
      return c.html(html`
        <!DOCTYPE html>
        <ul>
          ${files
            .filter(file => file.isFile())
            .map(file => html`
              <li><a href="${file.name}">${file.name}</a></li>
            `)}
        </ul>
      `)
    }

    const data = await readFile(`../backups/${path}`)
    return c.body(data, 200, { 'Content-Type': 'application/zip' })
  })

  app.get('/maps/*', async c => {
    // .replace(/^\/maps\//, '')
    const path = c.req.path
      .slice(6)
    const url = `http://127.0.0.1:${dynmap_port}/${path}`
    console.log(`fetching ${url}`)
    return fetch(url)
  })

  serve({
    fetch: app.fetch,
    port,
    key: Bun.file('./key.pem'),
    cert: Bun.file('./cert.pem'),
  })

  console.log(`listening at https://0.0.0.0:${port}`)
  console.log(`login: https://0.0.0.0:${port}/login`)
}

export { createServer }
