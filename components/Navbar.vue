<template lang="pug">
  <nav class="navbar">
    <h1 class="nav-title">Training metrics dashboard</h1>
  </nav>
</template>
<script>
export default {}
</script>
<style lang="scss" scoped>
$green-vue: #75aa81;

.navbar {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
}

.nav-title {
  background: $green-vue;
  line-height: 80px;
  margin: 0;

  &::after {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    border-left: 40px solid $green-vue;
    border-right: 40px solid transparent;
    border-top: 40px solid transparent;
    border-bottom: 40px solid $green-vue;
  }
}
</style>
