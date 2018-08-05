require('dotenv').config()
const { router, get } = require('microrouter')
const uid = require('uid-promise')
const redirect = require('micro-redirect')
// TODO remove axios and j/ use vanilla js in order to shrink the dependencies needed
// https://www.mikeperham.com/2016/02/09/kill-your-dependencies/
const axios = require('axios')
// TODO querystring can probably be removed too to keep things smaller
const querystring = require('querystring')

const states = []
const vstsUrl = 'app.vssps.visualstudio.com'

const redirectWithQueryString = (res, data) => {
  const location = `${process.env.REDIRECT_URL}?${querystring.stringify(data)}`
  redirect(res, 302, location)
}

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

const callback = async (req, res) => {
  res.setHeader('Content-Type', 'text/html')

  const { code, state } = req.query
  if (!code && !state) {
    redirectWithQueryString(res, { error: 'Provide code and state query param' })
  } else if (!states.includes(state)) {
    redirectWithQueryString(res, { error: 'Unknown state' })
  } else {
    states.splice(states.indexOf(state), 1)
    const params = {
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: process.env.VSTS_CLIENT_SECRET,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: code,
      redirect_uri: `https://${req.headers.host}/callback`
    }
    try {
      const { status, data } = await axios({
        method: 'POST',
        url: `https://${vstsUrl}/oauth2/token`,
        data: querystring.stringify(params),
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      })

      if (status === 200) {
        if (data.access_token && data.refresh_token) {
          redirectWithQueryString(res, data)
        } else {
          redirectWithQueryString(res, { error: 'VSTS 200 response with missing tokens in response.' })
        }
      } else {
        redirectWithQueryString(res, { error: 'VSTS non-200 response.', status: status })
      }
    } catch (err) {
      redirectWithQueryString(res, { error: 'Please provide VSTS_CLIENT_ID and VSTS_CLIENT_SECRET as environment variables. (or VSTS might be down)' })
    }
  }
}

module.exports = router(
  get('/login', login),
  get('/callback', callback)
)
