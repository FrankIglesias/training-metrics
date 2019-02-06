const request = require("request-promise");
const Moment = require('moment');
const MomentRange = require('moment-range');
const _ = require('lodash');
const moment = MomentRange.extendMoment(Moment);
const baseUrl = "https://api.github.com/repos/wolox-training/";
const reponame = "fdr-react";
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
};


const requestFrom = uri => request({ uri , headers, json: true });

const daysBetween = (start, end) =>  moment.range(start, end).diff('days');

const analizePullRequests =  async pullRequest => {
  const comments = await requestFrom(pullRequest.review_comments_url);
  console.log('===================');
  console.log('Title: ', pullRequest.title);
  console.log('Status: ', pullRequest.state);
  if (pullRequest.state === 'closed') {
    let daysOpened = daysBetween(pullRequest.created_at, pullRequest.closed_at);
    console.log('Merge time: ', daysOpened);
  }
  console.log('Amount of comments: ', comments.length);
  const reviews = await requestFrom(`${pullRequest.url}/reviews`);
  reviews.forEach(async review => {
    let commit = await requestFrom(`${baseUrl}${reponame}/commits/${review.commit_id}`);
    let pickupTime = daysBetween(commit.commit.author.date, review.submitted_at);
    console.log(`Review pickup time: ${pickupTime} days`);
  });
  console.log('Reviewers: ', _.uniq(reviews.map(comment => comment.user.login)).join(' '));
}

requestFrom(`${baseUrl}${reponame}/pulls?state=all`).then(async pullRequests => {
  console.log('Amount of pull requests ', pullRequests.length);
  console.log('Merged pull requests ', pullRequests.filter(pull => pull.state === 'closed').length);
  console.log('Open pull requests ', pullRequests.filter(pull => pull.state === 'open').length);
  await Promise.all(pullRequests.map(analizePullRequests));
})
