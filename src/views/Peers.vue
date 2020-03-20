<template>
  <div class="peers">
    <h1>Watch streaming</h1>
    <div class="video-container">
      <video id="vid1" class="video-js" data-setup="{}">
        <video-player :options="videoOptions" />
      </video>
    </div>
  </div>
</template>

<script>
import VideoPlayer from '@/components/VideoPlayer.vue'

export default {
  name: 'Peers',
  components: {
    'video-player': VideoPlayer
  },
  data() {
    return {
      videoOptions: {
        autoplay: true,
        controls: true,
        width: 1280,
        height: 720,
        class: 'vjs-default-skin',
        sources: [
          {
            src:
              'https://cdn3.wowza.com/1/WEh1cm93TWQzTVll/Skkvai9K/hls/live/playlist.m3u8',
            type: 'application/x-mpegURL'
          }
        ]
      }
    }
  }
}
</script>

<style lang="stylus">
.video-container {
  width: 85;
}
</style>
