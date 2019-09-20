const { getRepositoryInfo } = require('../interactors/github')
const { pullRequestsMapper } = require('../mappers/github')

export const getMetrics = (req, res, next) =>
  getRepositoryInfo({
    repository: req.query.repository,
    organization: req.query.organization
  })
    .then(response => {
      res.send(pullRequestsMapper(response))
    })
    .catch(err => {
      console.log(req.query)
    })
