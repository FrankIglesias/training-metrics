<template>
  <div class="chart-container">
    <h3 class="white--text">
      {{ title }}
    </h3>
    <apexchart
      type="area"
      :series="this.generateData()"
      :options="options"
      height="200"
      width="300"
    />
  </div>
</template>

<script>
export default {
  props: ['title', 'labels', 'metric', 'pullRequests'],
  computed: {
    options() {
      return {
        stroke: {
          width: 2,
          curve: 'smooth',
          colors: ['#60B686']
        },
        fill: {
          colors: ['#60B686']
        },
        xaxis: {
          labels: {
            show: false
          }
        }
      }
    }
  },
  methods: {
    generateData() {
      debugger
      if (typeof this.labels === 'object')
        return this.labels.map((name, index) => ({
          name: name,
          data: this.pullRequests.map(
            pullRequest => pullRequest[this.metric[index]]
          )
        }))
      else {
        return [
          {
            name: this.labels,
            data: this.pullRequests.map(pullRequest => pullRequest[this.metric])
          }
        ]
      }
    }
  }
}
</script>
