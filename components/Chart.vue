<template>
  <div class="chart-container">
    <h3 class="white--text">
      {{ title }}
    </h3>
    <apexchart
      type="area"
      :series="this.chartData(labels, metric)"
      :options="options"
      height="200"
      width="300"
    />
  </div>
</template>

<script>
export default {
  props: ['title', 'labels', 'metric'],
  computed: {
    options() {
      return {
        stroke: {
          show: true,
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
    }
  }
}
</script>

<style>
</style>
