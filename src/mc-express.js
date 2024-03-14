const express = require('express')
const fs = require('fs')
const https = require('https')
const { createBot, createProxy } = require('oauth2-discord-proxy')
const { createProxyMiddleware } = require('http-proxy-middleware')

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

  const app = express()

  const server = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
  }, app)

  app.use('/', createProxy({
    bot: createBot(discord_token),
    client_id,
    client_secret,
    discord_guild_id,
    oauth2_callback,
    oauth2_endpoint,
  }))

  app.get('/', (req, res) => {
    res.redirect('/maps/')
  })

  app.use('/maps/', createProxyMiddleware({
    target: `http://localhost:${dynmap_port}`,
    changeOrigin: true,
    pathRewrite: {
      '^/maps/': '',
    },
  }))

  server.listen(port, () => {
    console.log(`listening at https://localhost:${port}`)
    console.log(`login: https://localhost:${port}/login`)
  })
}

module.exports = { createServer }
