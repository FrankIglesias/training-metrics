const express = require('express')
const app = express()
const { getRepositoryInfo } = require('../interactors/github')
const { pullRequestsMapper } = require('../mappers/github')

app.get('/metrics', (req, res, next) => {
  getRepositoryInfo(req.query.repository).then(response => {
    res.send(pullRequestsMapper(response))
  })
})
// export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
