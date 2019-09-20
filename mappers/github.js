import Moment from 'moment'
import { extendMoment } from 'moment-range'
import 'moment-business-time'
import _ from 'lodash'

const MERGED = 'MERGED'

const moment = extendMoment(Moment)

moment.locale('en', {
  workinghours: {
    0: null,
    1: ['07:00:00', '20:00:00'],
    2: ['07:00:00', '20:00:00'],
    3: ['07:00:00', '20:00:00'],
    4: ['07:00:00', '20:00:00'],
    5: ['07:00:00', '20:00:00'],
    6: null
  }
})

const hoursBetween = (start, end) =>
  moment(end).workingDiff(moment(start), 'hours')

const getReviewers = pullRequest =>
  _.uniq(
    pullRequest.reviews.nodes
      .map(review => review.author)
      .filter(author => author.login !== pullRequest.author.login)
  )

const getDuration = pullRequest =>
  pullRequest.state === MERGED
    ? hoursBetween(pullRequest.createdAt, pullRequest.mergedAt)
    : NaN

const getPickupTime = review => ({
  pickup_time: hoursBetween(review.commit.author.date, review.createdAt)
})

const getAvgPickupTime = pullRequest =>
  _.mean(
    pullRequest.reviews.nodes.map(review => getPickupTime(review).pickup_time)
  ).toFixed(2)

const getTotalAvgPickupTime = pullRequests => {
  const reviews = pullRequests.nodes.map(
    pullRequests => pullRequests.reviews.nodes
  )
  return _.mean(
    _.flatten(reviews).map(
      pullRequest => getPickupTime(pullRequest).pickup_time
    )
  ).toFixed(2)
}

const getTotalAvgMergeTime = pullRequests => {
  const mergedPullRequestDuration = pullRequests.nodes
    .map(pullRequest => getDuration(pullRequest))
    .filter(dur => !isNaN(dur) && dur !== null)
  return _.mean(mergedPullRequestDuration).toFixed(2)
}

export const pullRequestsMapper = (body, dateStart = null, dateEnd = null) => {
  const pullRequests = body.data.repository.pullRequests
  const repository = body.data.repository
  if (dateStart && dateEnd)
    pullRequests.nodes = pullRequests.nodes.filter(
      pullRequest =>
        pullRequest.state === MERGED
          ? moment(pullRequest.mergedAt).isAfter(
              moment(dateStart, 'YYYY-MM-DD')
            )
          : moment(pullRequest.updatedAt).isAfter(
              moment(dateStart, 'YYYY-MM-DD')
            ) &&
            moment(pullRequest.updatedAt).isBefore(
              moment(dateEnd, 'YYYY-MM-DD')
            )
    )
  return {
    total_pull_requests: repository.total_pull_requests.totalCount,
    merged_pull_requests: repository.merged_pull_requests.totalCount,
    open_pull_requests: repository.open_pull_requests.totalCount,
    closed_pull_requests: repository.closed_pull_requests.totalCount,
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
    average_pickup_time: getTotalAvgPickupTime(pullRequests),
    average_merge_time: getTotalAvgMergeTime(pullRequests)
  }
}
