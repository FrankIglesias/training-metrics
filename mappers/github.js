import Moment from 'moment'
import { extendMoment } from 'moment-range'
import _ from 'lodash'

const moment = extendMoment(Moment)

const hoursBetween = (start, end) => moment.range(start, end).diff('hours')

const countByState = (state, pullRequests) =>
  pullRequests.filter(pullRequest => pullRequest.state === state).length

const getReviewers = pullRequest =>
  _.uniq(
    pullRequest.reviews.nodes
      .map(review => review.author)
      .filter(author => author.login !== pullRequest.author.login)
  )

const getDuration = pullRequest =>
  pullRequest.state === 'MERGED'
    ? hoursBetween(pullRequest.createdAt, pullRequest.mergedAt)
    : null

const getPickupTime = review => ({
  pickup_time: hoursBetween(review.commit.author.date, review.createdAt)
})

const getAvgPickupTime = pullRequest =>
  (
    _.sum(
      pullRequest.reviews.nodes.map(
        pullRequest => getPickupTime(pullRequest).pickup_time
      )
    ) / pullRequest.reviews.totalCount
  ).toFixed(2)

export const pullRequestsMapper = body => {
  const pullRequests = body.data.repository.pullRequests
  return {
    total_pull_requests: pullRequests.totalCount,
    merged_pull_requests: countByState('MERGED', pullRequests.nodes),
    open_pull_requests: countByState('OPEN', pullRequests.nodes),
    closed_pull_requests: countByState('CLOSED', pullRequests.nodes),
    pull_requests: pullRequests.nodes.map(pullRequest => ({
      title: pullRequest.title,
      state: pullRequest.state,
      additions: pullRequest.additions,
      deletions: pullRequest.deletions,
      number: pullRequest.number,
      url: pullRequest.url,
      created_at: pullRequest.createdAt,
      total_comments: _.sumBy(
        pullRequest.reviews.edges,
        review => review.node.comments.totalCount
      ),
      duration: getDuration(pullRequest),
      reviews: pullRequest.reviews.nodes
        .map(getPickupTime)
        .sort((a, b) => a.number - b.number),
      reviewers: getReviewers(pullRequest),
      rejects_count: pullRequest.reviews.nodes.filter(
        review => review.state === 'CHANGES_REQUESTED'
      ).length,
      pickup_time: getAvgPickupTime(pullRequest)
    })),
    reviewers: _.uniqBy(
      _.flatMap(pullRequests.nodes.map(getReviewers)),
      reviewer => reviewer.login
    ),
    average_pickup_time:
      _.sum(
        pullRequests.nodes.map(getAvgPickupTime).filter(value => !isNaN(value))
      ) / pullRequests.totalCount
  }
}
