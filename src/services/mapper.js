import Moment from 'moment'
import { extendMoment } from 'moment-range'
import _ from 'lodash'

const moment = extendMoment(Moment)

const hoursBetween = (start, end) => moment.range(start, end).diff('hours')

export const pullRequestsMapper = (body) => ({
	total_pull_requests: body.data.repository.pullRequests.totalCount,
	merged_pull_requests: body.data.repository.pullRequests.nodes.filter((pull) => pull.state === 'MERGED').length,
	open_pull_requests: body.data.repository.pullRequests.nodes.filter((pull) => pull.state === 'OPEN').length,
	closed_pull_requests: body.data.repository.pullRequests.nodes.filter((pull) => pull.state === 'CLOSED').length,
	pull_requests: body.data.repository.pullRequests.nodes.map((pullRequest) => ({
		title: pullRequest.title,
		state: pullRequest.state,
		additions: pullRequest.additions,
		deletions: pullRequest.deletions,
		number: pullRequest.number,
		total_comments: pullRequest.reviews.edges.reduce((accum, actual) => actual.node.comments.totalCount + accum, 0),
		duration: pullRequest.state === 'MERGED' ? hoursBetween(pullRequest.createdAt, pullRequest.mergedAt) : null,
		reviews: pullRequest.reviews.nodes.map((review) => ({
			pickup_time: hoursBetween(review.commit.author.date, review.createdAt)
		})).sort((a,b) => a.number - b.number),
		reviewers: _.uniq(
			pullRequest.reviews.nodes
				.map((review) => review.author.login)
				.filter((author) => author !== pullRequest.author.login)
		).join(' '),
		rejects_count: pullRequest.reviews.nodes.filter((review) => review.state === 'CHANGES_REQUESTED').length
	}))
})
