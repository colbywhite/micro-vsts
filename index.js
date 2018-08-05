require('dotenv').config()
const { router, get } = require('microrouter')
const querystring = require('querystring')
const uid = require('uid-promise')
const redirect = require('micro-redirect')

const states = []
const vstsUrl = 'app.vssps.visualstudio.com'

const login = async (req, res) => {
  const state = await uid(20)
  states.push(state)
  const query = {
    client_id: process.env.VSTS_CLIENT_ID,
    response_type: 'Assertion',
    state: state,
    scope: process.env.VSTS_SCOPES,
    redirect_uri: `https://${req.headers.host}/callback`
  }

  return redirect(res, 302, `https://${vstsUrl}/oauth2/authorize?${querystring.stringify(query)}`)
}

const callback = (req, res) => 'Callback!'

module.exports = router(
  get('/login', login),
  get('/callback', callback)
)
