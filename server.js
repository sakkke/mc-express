const express = require('express')
const { createBot, createProxy } = require('oauth2-discord-proxy')
const { createProxyMiddleware } = require('http-proxy-middleware')
const { client_id, client_secret, discord_guild_id, discord_token, oauth2_callback, oauth2_endpoint, port } = require('./oauth2-discord-proxy.config.json')
const { dynmap_port } = require('./config.json')

const app = express()

const https = require('https')
const fs = require('fs')

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
