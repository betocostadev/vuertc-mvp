<template>
  <div class="streamer">
    <img class="play-image" alt="Play Image" src="../assets/play.png" />
    <h1>Vue WebRTC - Streaming test</h1>
    <div class="buttons">
      <button @click="streamCamera">Stream camera</button>
    </div>
    <div class="status">
      <p>Capture device: {{ device }}</p>
      <span v-if="!mediaDevice">Media device: off | </span>
      <span v-else>Media device: on | </span>
      <span v-if="!localVideo">Local video: off</span>
      <span v-else>Local video: on</span>
    </div>
    <div class="div-section">
      <video
        id="localVideo"
        :srcObject.prop="localVideoSource"
        autoplay
        playsinline
        muted
        controls
        style="height:480px;"
      ></video>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Streamer',
  data() {
    return {
      localVideoSource: null,
      localVideo: false,
      mediaDevice: false,
      device: null
    }
  },
  components: {},
  methods: {
    streamCamera() {
      const openMediaDevices = async constraints => {
        return await navigator.mediaDevices.getUserMedia(constraints)
      }
      try {
        const stream = openMediaDevices({ video: true, audio: true })
        console.log('Got MediaStream:', stream)
        this.mediaDevice = true
        this.playVideoFromCamera()
      } catch (error) {
        this.mediaDevice = false
        console.error('Error accessing media devices.', error)
      }
    },
    async playVideoFromCamera() {
      try {
        const constraints = { video: true, audio: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.localVideoSource = stream
        this.localVideo = true
      } catch (error) {
        this.localVideo = false
        console.error('Error opening video camera.', error)
      }
    }
  },
  mounted() {
    // Check for available devices
    async function getConnectedDevices(type) {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === type)
    }

    const videoCameras = getConnectedDevices('videoinput').then(response => {
      let devices = response.map(device => device)
      if (!devices.length) {
        const noDeviceMessage = 'No capture device available'
        console.log(noDeviceMessage)
        this.device = noDeviceMessage
      } else {
        console.log('Capture devices found: ')
        console.table(devices)
        this.device = devices[0].label
      }
    })
    // console.log('Cameras found:', videoCameras)
  }
}
</script>

<style lang="stylus">
.play-image {
  max-width 10vw
  float left
}
</style>
