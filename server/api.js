const express = require('express')
const app = express()
const { getMetrics } = require('../controllers/github')

app.get('/metrics', getMetrics)

// export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
