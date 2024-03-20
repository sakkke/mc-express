import { createServer } from './index'
import { client_id, client_secret, discord_guild_id, discord_token, oauth2_callback, oauth2_endpoint, port } from '../oauth2-discord-proxy.config.json'
import { dynmap_port } from '../config.json'

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
