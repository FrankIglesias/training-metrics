const { getRepositoryInfo } = require('../interactors/github')
const { pullRequestsMapper } = require('../mappers/github')

export const getMetrics = (req, res, next) => {
  getRepositoryInfo({ ...req.query }).then(response => {
    res.send(pullRequestsMapper(response))
  })
}
