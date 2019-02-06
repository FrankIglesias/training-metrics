<template>
  <div id="app">
    <h1>Training metrics dashboard</h1>
    <input v-model="repositoryName" type="text" />
    <button @click="fetchData()">Click me</button>
    <h3>Closed pull requests: {{ repositoryInfo.closed_pull_requests }}</h3>
    <h3>Merged pull requests: {{ repositoryInfo.merged_pull_requests }}</h3>
    <h3>Open pull requests: {{ repositoryInfo.open_pull_requests }}</h3>
    <h3>Total pull requests: {{ repositoryInfo.total_pull_requests }}</h3>
    <div v-for="pullRequest in repositoryInfo.pull_requests" :key="pullRequest.number">
      <h4>{{ pullRequest.number }}. {{ pullRequest.title }} - {{ pullRequest.state }}</h4>
      <p>Duration: {{ pullRequest.duration }} hours</p>
      <p>Reviewers: {{ pullRequest.reviewers }}</p>
      <p>Number of rejects: {{ pullRequest.rejects_count }}</p>
      <p>Comments: {{ pullRequest.total_comments }}</p>
      <p>Average pickup time: {{ averagePickupTime(pullRequest.reviews) }} hours</p>
    </div>
  </div>
</template>

<script>
import { getRepositoryInfo } from "./services/github"
import { pullRequestsMapper } from "./services/mapper"

export default {
  name: "app",
  data: () => ({
    repositoryName: "fdr-react",
    repositoryInfo: {}
  }),
  methods: {
    fetchData() {
      getRepositoryInfo(this.repositoryName).then(response => {
        this.repositoryInfo = pullRequestsMapper(response)
      });
    },
    averagePickupTime(reviews) {
      return (reviews.reduce((accum, actual) => actual.pickup_time + accum, 0) / reviews.length).toFixed(2)
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
h3,
h4,
p {
  margin: 0;
}

h4 {
  margin-top: 20px;
}

p,
h4 {
  text-align: left;
}
</style>
