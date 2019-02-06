const request = require("request-promise");
const baseUrl = "https://api.github.com/repos/wolox-training/";
const reponame = "fdr-react";
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"
};


const fetchAllComments = pullRequest =>
  request({ uri: pullRequest.review_comments_url, headers, json: true })
    .then(comments => {
      console.log('===================');
      console.log('Title: ', pullRequest.title);
      console.log('Status: ', pullRequest.state);
      if (pullRequest.state === 'closed') {
        let daysOpened = ((new Date(pullRequest.closed_at) - new Date(pullRequest.created_at)) / (1000 * 60 * 60 * 24)).toFixed();
        console.log('Merge time: ', daysOpened);
      }
      console.log('Amount of comments: ', comments.length);

      request({ uri: `${pullRequest.url}/reviews`, headers, json: true }).then(reviews => {
        reviews.forEach(review => {
          request({ uri: `${baseUrl}${reponame}/commits/${review.commit_id}`, headers, json: true }).then(commit => {
            let pickupTime = ((new Date(review.submitted_at) - new Date(commit.commit.author.date)) / (1000 * 60 * 60 * 24)).toFixed();
            console.log(`Review pickup time: ${pickupTime} days`);
          });
          console.log('Reviewers: ', [...new Set(reviews.map(comment => comment.user.login))].join(' '));
        })
      })
    });

request({
  uri: `${baseUrl}${reponame}/pulls?state=all`,
  headers,
  json: true
}).then(async pullRequests => {
  console.log('Amount of pull requests ', pullRequests.length);
  console.log('Merged pull requests ', pullRequests.filter(pull => pull.state === 'closed').length);
  console.log('Open pull requests ', pullRequests.filter(pull => pull.state === 'open').length);
  await Promise.all(pullRequests.map(fetchAllComments));
});
