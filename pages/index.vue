<template>
  <div id="app">
    <v-progress-linear v-if="loading" :indeterminate="true" class="progress-bar" color="#75aa81" />
    <v-snackbar v-model="error" vertical top left :multi-line="false" />
    <v-layout row justify-space-between>
      <v-text-field v-model="repositoryUrl" color="#75aa81" />
      <v-btn @click="toggleDates()">
Filter by dates
</v-btn>
      <v-date-picker v-if="dates" v-model="dateStart" :allowed-dates="allowedDates" class="mt-3" />
      <v-date-picker v-if="dates" v-model="dateEnd" :allowed-dates="allowedDates" class="mt-3" />
      <v-btn @click="fetchData()">
Search
</v-btn>
    </v-layout>
    <div v-if="repositoryInfo.pull_requests">
      <chip>Closed pull requests: {{ repositoryInfo.closed_pull_requests }}</chip>
      <chip>Average Pickup Time: {{ repositoryInfo.average_pickup_time }} hours</chip>
      <chip>Average merge time: {{ repositoryInfo.average_merge_time }} hours</chip>
      <chip>Merged pull requests: {{ repositoryInfo.merged_pull_requests }}</chip>
      <chip>Open pull requests: {{ repositoryInfo.open_pull_requests }}</chip>
      <chip>Total amount of pull requests: {{ repositoryInfo.total_pull_requests }}</chip>
      <v-layout align-center justify-start row>
        <h3>Reviewers:</h3>
        <chip v-for="reviewer in repositoryInfo.reviewers" :key="reviewer.login">
          <a :href="reviewer.url" target="_blank" class="blue--text">
            <v-avatar>
              <img :src="reviewer.avatarUrl" >
            </v-avatar>
            {{ reviewer.login }}
          </a>
        </chip>
      </v-layout>
    </div>
    <div v-if="repositoryInfo.pull_requests" class="main-chart-container">
      <chart
        title="Amount of rebounds per pull request"
        labels="Rejects"
        metric="rejects_count"
        :pull-requests="repositoryInfo.pull_requests"
      />
      <chart
        title="Average pickup time (hours)"
        labels="Pickup average time"
        metric="pickup_time"
        :pull-requests="repositoryInfo.pull_requests"
      />
      <chart
        title="Average duration time (hours)"
        labels="Duration"
        metric="duration"
        :pull-requests="repositoryInfo.pull_requests"
      />
      <chart
        title="Number of lines"
        :labels="['Addition', 'Deletion']"
        :metric="['additions', 'deletions']"
        :pull-requests="repositoryInfo.pull_requests"
      />
    </div>
    <pull-request-list :pull-requests="repositoryInfo.pull_requests" />
  </div>
</template>

<script>
import Vue from 'vue'
import { getRepositoryInfo } from '../interactors/github'
import { pullRequestsMapper } from '../mappers/github'
import Chart from '../components/Chart'
import Chip from '../components/Chip'
import PullRequestList from '../components/PullRequestList'

if (process.client) {
  const VueApexCharts = require('vue-apexcharts')
  Vue.use(VueApexCharts)
  Vue.component('apexchart', VueApexCharts)
}

export default {
  name: 'App',
  components: {
    Chart,
    Chip,
    PullRequestList
  },
  data() {
    return {
      repositoryUrl: 'https://github.com/wolox-training/fd-express-js',
      repositoryInfo: {},
      loading: false,
      repositoryRegex: /https:\/\/github\.com\/(wolox-training|Wolox)\/([a-zA-Z0-9]|-[a-zA-Z0-9])*$/,
      errorMessage: null,
      error: false,
      dateStart: null,
      dateEnd: null,
      dates: false
    }
  },
  methods: {
    fetchData() {
      if (this.repositoryRegex.test(this.repositoryUrl)) {
        this.loading = true
        this.dates = false
        const repositoryData = this.repositoryUrl.split('/').slice(3)
        getRepositoryInfo({
          organization: repositoryData[0],
          repository: repositoryData[1]
        })
          .then(response => {
            this.repositoryInfo = pullRequestsMapper(
              response,
              this.dateStart,
              this.dateEnd
            )
            this.loading = false
          })
          .catch(() => {
            this.errorMessage = 'Invalid repository'
            this.error = true
            this.loading = false
          })
      } else {
        this.errorMessage = 'This is not a valid repository url'
        this.error = true
      }
    },
    toggleDates() {
      this.dates = !this.dates
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: white;
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
  margin: 10px;
}

.main-chart-container {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}

.progress-bar {
  top: -13px;
  width: 100vw;
  left: 0;
  position: absolute;
}
</style>
