<template>
  <div class="peers">
    <h1>Watch streaming</h1>
    <button class="link" @click="play">Play video</button>
    <div class="video-container">
      <video
        ref="videoEl"
        autoplay
        playsinline
        muted
        controls
        style="width: 480px"
      ></video>
    </div>
  </div>
</template>

<script>
import Hls from 'hls.js'

export default {
  name: 'Peers',
  data() {
    return {
      streamURL:
        'https://cdn3.wowza.com/1/VnpjTm1TeVd4UVpa/eUpGL09h/hls/live/playlist.m3u8'
    }
  },
  methods: {
    play() {
      if (Hls.isSupported()) {
        let hls = new Hls()
        let url = this.streamURL
        // bind them together
        hls.attachMedia(this.$refs.videoEl)
        hls.on(Hls.Events.MEDIA_ATTACHED, function() {
          console.log('video and hls.js are now bound together !')
          hls.loadSource(url)
          hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
            console.log(
              'manifest loaded, found ' + data.levels.length + ' quality level'
            )
          })
        })
      }
    }
  }
}
</script>

<style lang="stylus">
.video-container {
  width 100
}
</style>
