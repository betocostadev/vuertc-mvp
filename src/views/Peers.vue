<template>
  <div class="peers">
    <h1>Watch streaming</h1>
    <div class="video-container">
      <video controls width="1280">
        <source
          src="https://cdn3.wowza.com/1/WEh1cm93TWQzTVll/Skkvai9K/hls/live/playlist.m3u8"
          type="application/x-mpegURL"
        />Sorry, your browser doesn't support embedded videos.
      </video>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="stylus">
.video-container {
  width: 85;
}
</style>
