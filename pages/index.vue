<template>
  <div id="app">
    <v-progress-linear
      v-if="loading"
      :indeterminate="true"
      class="progress-bar"
      color="#75aa81"
    />
    <v-flex row>
      <v-text-field
        v-model="repositoryName"
        color="#75aa81"
      />
      <v-btn @click="fetchData()">
        Search
      </v-btn>
    </v-flex>
    <div v-if="repositoryInfo.pull_requests">
      <span class="text-xs-center">
        <v-chip>
          Closed pull requests: {{ repositoryInfo.closed_pull_requests }}
        </v-chip>
      </span>
      <span class="text-xs-center">
        <v-chip>
          Total average pickup: {{ averageTotalPickupTime }}
        </v-chip>
      </span>
      <span class="text-xs-center">
        <v-chip>
          Merged pull requests: {{ repositoryInfo.merged_pull_requests }}
        </v-chip>
      </span>
      <span class="text-xs-center">
        <v-chip>Open pull requests: {{ repositoryInfo.open_pull_requests }}</v-chip>
      </span>
      <span class="text-xs-center">
        <v-chip>Total pull requests: {{ repositoryInfo.total_pull_requests }}</v-chip>
      </span>
      <v-flex row>
        <h3>Reviewers</h3>
        <span
          v-for="reviewer in reviewers"
          :key="reviewer.login"
          class="text-xs-center"
        >
          <v-chip>
            <a
              :href="reviewer.url"
              target="_blank"
              class="blue--text"
            >
              <v-avatar>
                <img :src="reviewer.avatarUrl">
              </v-avatar>{{ reviewer.login }}
            </a>
          </v-chip>
        </span>
      </v-flex>
    </div>
    <div
      v-if="repositoryInfo.pull_requests"
      class="main-chart-container"
    >
      <chart
        title="Amount of rebounds per pull request"
        labels="Rejects"
        :metric="this.rejectsChartData"
      />
      <chart
        title="Average pickup time (hours)"
        labels="Pickup average time"
        :metric="this.pickupChartData"
      />
      <chart
        title="Average duration time (hours)"
        labels="Duration"
        :metric="this.durationChartData"
      />
      <chart
        title="Number of lines"
        :labels="['Addition', 'Deletion']"
        :metric="[this.additionChartData, this.deletionChartData]"
      />
      <chart
        title="Number of comments"
        labels="Comments"
        :metric="this.commentsChartData"
      />
    </div>
    <v-list>
      <v-list-group>
        <template v-slot:activator>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Pull requests</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
        <v-list-tile
          v-for="pullRequest in repositoryInfo.pull_requests"
          :key="pullRequest.number"
        >
          <v-list-tile-content>
            <v-list-tile-title>{{ pullRequest.number }}. {{ pullRequest.title }} - {{ pullRequest.state }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action />
        </v-list-tile>
      </v-list-group>
    </v-list>
  </div>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import { getRepositoryInfo } from '../interactors/github'
import { pullRequestsMapper } from '../mappers/github'
import Chart from '../components/Chart'

if (process.client) {
  const VueApexCharts = require('vue-apexcharts')
  Vue.use(VueApexCharts)
  Vue.component('apexchart', VueApexCharts)
}

export default {
  name: 'App',
  components: {
    Chart
  },
  data: () => ({
    repositoryName: 'fdr-react',
    repositoryInfo: {},
    loading: false
  }),
  computed: {
    averageTotalPickupTime() {
      const variable =
        _.sum(
          this.repositoryInfo.pull_requests
            .map(pullRequest => pullRequest.duration)
            .filter(value => !isNaN(value))
        ) / this.repositoryInfo.pull_requests.length
      return variable
    },
    reviewers() {
      return _.uniqBy(
        this.repositoryInfo.pull_requests
          .map(pullRequest => pullRequest.reviewers)
          .reduce((accum, value) => [...accum, ...value], []),
        reviewer => reviewer.login
      )
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      getRepositoryInfo(this.repositoryName).then(response => {
        this.repositoryInfo = pullRequestsMapper(response)
        this.loading = false
      })
    },
    averagePickupTime(reviews) {
      return (
        reviews.reduce((accum, actual) => actual.pickup_time + accum, 0) /
        reviews.length
      ).toFixed(2)
    },
    chartData(names, dataGenerator) {
      if (typeof names === 'object')
        return names.map((name, index) => ({
          name: name,
          data: dataGenerator[index]()
        }))
      else {
        return [
          {
            name: names,
            data: dataGenerator()
          }
        ]
      }
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
    additionChartData() {
      return this.repositoryInfo.pull_requests.map(
        pullRequest => pullRequest.additions
      )
    },
    deletionChartData() {
      return this.repositoryInfo.pull_requests.map(
        pullRequest => -pullRequest.deletions
      )
    },
    commentsChartData() {
      return this.repositoryInfo.pull_requests.map(
        pullRequest => pullRequest.total_comments
      )
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

.row {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.progress-bar {
  top: -13px;
  width: 100vw;
  left: 0;
  position: absolute;
}
</style>
