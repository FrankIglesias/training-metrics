<template>
  <div id="app">
    <h1>Training metrics dashboard</h1>
    <input
      v-model="repositoryName"
      type="text"
    />
    <button @click="fetchData()">Click me</button>
    <div
      v-if="repositoryInfo.pull_requests"
      class="row"
    >
      <h3>Closed pull requests: {{ repositoryInfo.closed_pull_requests }}</h3>
      <h3>Merged pull requests: {{ repositoryInfo.merged_pull_requests }}</h3>
      <h3>Open pull requests: {{ repositoryInfo.open_pull_requests }}</h3>
      <h3>Total pull requests: {{ repositoryInfo.total_pull_requests }}</h3>
      <h3>Reviewers: {{ reviewers }}</h3>
    </div>
    <div
      class="main-chart-container"
      v-if="repositoryInfo.pull_requests"
    >
      <div class="chart-container">
        <h3>Amount of rebounds per pull request</h3>
        <apexchart
          :series="this.chartData('Rejects', this.rejectsChartData)"
          :options="options"
          height="300"
          width="400"
        ></apexchart>
      </div>
      <div class="chart-container">
        <h3>Average pickup time (hours)</h3>
        <apexchart
          :series="this.chartData('Pickup average time', this.pickupChartData)"
          :options="options"
          height="300"
          width="400"
        ></apexchart>
      </div>
      <div class="chart-container">
        <h3>Average duration time (hours)</h3>
        <apexchart
          :series="this.chartData('Duration', this.durationChartData)"
          :options="options"
          height="300"
          width="400"
        ></apexchart>
      </div>
      <div class="chart-container">
        <h3>Number of lines</h3>
        <apexchart
          :series="this.chartData('Lines', this.linesChartData)"
          :options="options"
          height="300"
          width="400"
        ></apexchart>
      </div>
      <div class="chart-container">
        <h3>Number of comments</h3>
        <apexchart
          :series="this.chartData('Comments', this.commentsChartData)"
          :options="options"
          height="300"
          width="400"
        ></apexchart>
      </div>
    </div>
    <div
      v-for="pullRequest in repositoryInfo.pull_requests"
      :key="pullRequest.number"
    >
      <a
        :href="pullRequest.url"
        target="_blank"
      >
        <h4>{{ pullRequest.number }}. {{ pullRequest.title }} - {{ pullRequest.state }}</h4>
      </a>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import { getRepositoryInfo } from "./services/github"
import VueApexCharts from "vue-apexcharts"
import _ from 'lodash'

Vue.use(VueApexCharts)

Vue.component("apexchart", VueApexCharts)
import { pullRequestsMapper } from "./services/mapper"

export default {
  name: "app",
  data: () => ({
    repositoryName: "fdr-react",
    repositoryInfo: {}
  }),
  computed: {
    options() {
      return {
        type: 'line',
        stroke: {
          show: true,
          curve: "smooth",
          lineCap: "butt",
          colors: undefined,
          width: 2,
          dashArray: 0
        },
        xaxis: {
          labels: {
            show: false
          }
        }
      };
    },
    reviewers() {
      return _.uniq(this.repositoryInfo.pull_requests
        .map(pullRequest => pullRequest.reviewers)
        .reduce((accum, value) => ([...accum, ...value]), [])
        .map(reviewer => reviewer.login)).join(' ');
    }
  },
  methods: {
    fetchData() {
      getRepositoryInfo(this.repositoryName).then(response => {
        this.repositoryInfo = pullRequestsMapper(response);
      });
    },
    averagePickupTime(reviews) {
      return (
        reviews.reduce((accum, actual) => actual.pickup_time + accum, 0) /
        reviews.length
      ).toFixed(2);
    },
    chartData(name, dataGenerator) {
      return [
        {
          name: name,
          data: dataGenerator()
        }
      ]
    },
    rejectsChartData() {
      return this.repositoryInfo.pull_requests.map(
        pullRequest => pullRequest.rejects_count
      )
    },
    pickupChartData() {
      return this.repositoryInfo.pull_requests.map(pullRequest =>
        this.averagePickupTime(pullRequest.reviews)
      )
    },
    durationChartData() {
      return this.repositoryInfo.pull_requests.map(
        pullRequest => pullRequest.duration
      )
    },
    linesChartData() {
      return this.repositoryInfo.pull_requests.map(
        pullRequest => pullRequest.additions - pullRequest.deletions
      )
    },
    commentsChartData() {
      return this.repositoryInfo.pull_requests.map(
        pullRequest => pullRequest.total_comments
      )
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

.chart-container {
  margin: 30px;
}

.main-chart-container {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}

.row {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
</style>
