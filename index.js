const { router, get } = require('microrouter')

const login = (req, res) => 'Login!'
const callback = (req, res) => 'Callback!'

module.exports = router(
  get('/login', login),
  get('/callback', callback)
)
