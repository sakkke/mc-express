const { Hono } = require('hono')
const { html } = require('hono/html')
const { serve } = require('@hono/node-server')
const fs = require('fs')
const https = require('https')
const { createBot, createProxy } = require('oauth2-discord-proxy')
const { readFile, readdir } = require('fs/promises')

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

  app.get('/Backups/*', async c => {
    // .replace(/^\/Backups\//, '')
    const path = c.req.path
      .slice(9)

    if (path === '') {
      const files = await readdir('../Backups', {
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

    const data = await readFile(`../Backups/${path}`)
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
    createServer: https.createServer,
    serverOptions: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
  }, info => {
    console.log(`listening at https://0.0.0.0:${info.port}`)
    console.log(`login: https://0.0.0.0:${info.port}/login`)
  })
}

module.exports = { createServer }
