<template>
  <v-list v-if="pullRequests">
    <v-list-group>
      <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Pull requests</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
      <v-list-tile
        v-for="pullRequest in pullRequests"
        :key="pullRequest.number"
      >
        <v-list-tile-content>
          <v-list-tile-title>
            <a :href="pullRequest.url" target="_blank">
              {{ pullRequest.number }}. {{ pullRequest.title }} - {{ pullRequest.state }}
            </a>
          </v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action />
      </v-list-tile>
    </v-list-group>
  </v-list>
</template>

<script>
export default {
  props: ['pullRequests']
}
</script>
