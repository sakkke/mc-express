const { createServer } = require('./index')
const { client_id, client_secret, discord_guild_id, discord_token, oauth2_callback, oauth2_endpoint, port } = require('./oauth2-discord-proxy.config.json')
const { dynmap_port } = require('./config.json')

createServer({
  client_id,
  client_secret,
  discord_guild_id,
  discord_token,
  dynmap_port,
  oauth2_callback,
  oauth2_endpoint,
  port,
})
