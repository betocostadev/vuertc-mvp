<template>
  <div id="app">
    <div id="nav">
      <router-link class="link" to="/">Streamer</router-link>
      <router-link class="link" to="/peers">Peers</router-link>
    </div>
    <router-view />
  </div>
</template>

<style lang="stylus">
body {
  background #232631
  margin 0
  .link {
      width 125px
      box-shadow inset 0px 1px 0px 0px #9acc85
      background linear-gradient(to bottom, #74ad5a 5%, #68a54b 100%)
      background-color #74ad5a
      border 1px solid #3b6e22
      display inline-block
      cursor pointer
      color #ffffff
      font-family Arial
      font-size 13px
      font-weight bold
      padding 6px 12px
      text-decoration none
    &:hover {
      background linear-gradient(to bottom, #68a54b 5%, #74ad5a 100%)
      background-color #68a54b
    }
    &:active {
      position relative
      top 1px
    }
  }
}


#app {
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #3b9d74
  margin-top: 1rem
}
</style>
