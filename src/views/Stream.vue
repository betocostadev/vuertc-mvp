<template>
  <div class="stream">
    <img class="play-image" alt="Play Image" src="../assets/play.png" />
    <h1>Vue WebRTC - Streaming test</h1>
    <div class="buttons">
      <button @click="streamCamera">Stream camera</button>
    </div>
    <div class="devices">
      <p>Available devices:</p>
      <ul>
        <li></li>
      </ul>
    </div>
    <div class="div-section">
      <video
        id="localVideo"
        autoplay
        playsinline
        muted
        controls
        style="height:720px;"
      ></video>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Stream',
  components: {},
  methods: {
    streamCamera() {
      const openMediaDevices = async constraints => {
        return await navigator.mediaDevices.getUserMedia(constraints)
      }
      try {
        const stream = openMediaDevices({ video: true, audio: true })
        console.log('Got MediaStream:', stream)
      } catch (error) {
        console.error('Error accessing media devices.', error)
      }
    }
  },
  mounted() {
    async function getConnectedDevices(type) {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === type)
    }

    const videoCameras = getConnectedDevices('videoinput').then(response => {
      response.push({
        InputDeviceInfo: {
          deviceId: '000232',
          groupId: '99928',
          kind: 'videoInput',
          label: 'happyCam'
        }
      })
      // const data = response.map(device => device.label)
      const data = response
      console.log(data)
    })
    console.log('Cameras found:', videoCameras)
  }
}
</script>

<style lang="stylus">
.play-image {
  max-width 10vw
  float left
}
</style>
