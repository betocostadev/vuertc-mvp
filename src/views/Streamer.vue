<template>
  <div class="streamer">
    <h1>Vue WebRTC - Streaming test</h1>
    <div class="userChoices">
      <input type="hidden" id="userAgent" name="userAgent" value="" />

      <div>
        <label for="sdpURL">WS (SDP) URL:</label>
        <input type="text" id="sdpURL" size="50" v-model="wsURL" />
      </div>

      <div>
        <label for="applicationName">Application name:</label>
        <input
          type="text"
          id="applicationName"
          size="25"
          v-model="streamInfo.applicationName"
        />
      </div>

      <div>
        <label for="streamName">Stream name:</label>
        <input
          type="text"
          id="streamName"
          size="25"
          v-model="streamInfo.streamName"
        />
      </div>

      <div>
        <label for="videoBitrate">Video Bitrate:</label>
        <input
          type="text"
          id="videoBitrate"
          size="10"
          v-model="videoSettings.videoBitrate"
        />
      </div>

      <div>
        <label for="audioBitrate">Audio Bitrate:</label>
        <input
          type="text"
          id="audioBitrate"
          size="10"
          v-model="audioSettings.audioBitrate"
        />
      </div>

      <div>
        <label for="videoFrameRate">Video frame rate:</label>
        <input
          type="text"
          id="videoFrameRate"
          size="10"
          v-model="videoSettings.videoFrameRate"
        />
      </div>

      <div>
        <label for="videoChoice">Video choice: </label>
        <select name="videoChoice" id="videoChoice">
          <option :value="videoSettings.videoChoice" selected="selected"
            >H264</option
          >
        </select>
      </div>

      <div>
        <label for="audioChoice">Audio choice: </label>
        <select type="text" id="audioChoice">
          <option :value="audioSettings.audioChoice">Opus</option>
        </select>
      </div>
    </div>

    <div class="buttons">
      <button @click="startCapture">Start capture device</button>
      <button v-show="localStream" @click="startStream">
        Start stream
      </button>
    </div>

    <div class="status">
      <p>Capture device: {{ device }}</p>
      <span v-if="!hasMediaDevice">Media device: off | </span>
      <span v-else>Media device: on | </span>
      <span v-if="!isLocalVideoPlaying">Local video: off</span>
      <span v-else>Local video: on</span>
    </div>

    <section class="video-container">
      <video
        id="localVideo"
        :srcObject.prop="localStream"
        autoplay
        playsinline
        muted
        controls
        :style="videoWidth"
      ></video>
    </section>

    <div>
      <span v-if="elementText.sdpDataTag">{{ elementText.sdpDataTag }}</span>
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
      elementText: {
        sdpDataTag: null
      },
      videoWidth: 'width: 720px',
      isLocalVideoPlaying: false,
      hasMediaDevice: false,
      device: null,
      remoteVideo: null,
      localStream: null,
      peerConnection: null,
      peerConnectionConfig: {
        iceServers: []
      },
      wsURL: 'wss://0afcf2.entrypoint.cloud.wowza.com/webrtc-session.json',
      wsConnection: null,
      streamInfo: {
        applicationName: 'webrtc',
        streamName: 'myStream',
        sessionId: '[empty]'
      },
      userData: {
        param1: 'value1'
      },
      videoSettings: {
        videoBitrate: 720,
        videoFrameRate: '29.97',
        videoChoice: '42e01f',
        videoIndex: -1
      },
      audioSettings: {
        audioBitrate: 64,
        audioChoice: 'opus',
        audioIndex: -1
      },
      userAgent: null,
      newAPI: false,
      SDPOutput: new Object()
    }
  },
  components: {},
  methods: {
    startCapture() {
      const openMediaDevices = async constraints => {
        return await navigator.mediaDevices.getUserMedia(constraints)
      }
      try {
        const stream = openMediaDevices({ video: true, audio: true })
        console.log('Got MediaStream:', stream)

        window.RTCPeerConnection =
          window.RTCPeerConnection ||
          window.mozRTCPeerConnection ||
          window.webkitRTCPeerConnection
        window.RTCIceCandidate =
          window.RTCIceCandidate ||
          window.mozRTCIceCandidate ||
          window.webkitRTCIceCandidate
        window.RTCSessionDescription =
          window.RTCSessionDescription ||
          window.mozRTCSessionDescription ||
          window.webkitRTCSessionDescription

        this.hasMediaDevice = true
        this.playVideoFromCaptureDevice()
      } catch (error) {
        this.hasMediaDevice = false
        console.error('Error accessing media devices.', error)
      }
    },

    async playVideoFromCaptureDevice() {
      try {
        const constraints = { video: true, audio: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.localStream = stream
        this.isLocalVideoPlaying = true
      } catch (error) {
        this.isLocalVideoPlaying = false
        console.error('Error opening capture device.', error)
      }
    },

    startStream() {
      this.wsConnect()
    },

    wsConnect(url) {
      this.wsConnection = new WebSocket(this.wsURL)
      this.wsConnection.binaryType = 'arraybuffer'

      this.wsConnection.onopen = () => {
        console.log('wsConnection.onopen')

        this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig)
        this.peerConnection.onicecandidate = gotIceCandidate

        if (this.newAPI) {
          let localTracks = this.localStream.getTracks()
          for (let localTrack of localTracks) {
            this.peerConnection.addTrack(localTrack, this.localStream)
          }
        } else {
          this.peerConnection.addStream(this.localStream)
        }

        this.peerConnection
          .createOffer()
          .then(gotDescription)
          .catch(errorHandler)
      }

      this.wsConnection.onmessage = evt => {
        console.log('wsConnection.onmessage: ' + evt.data)

        let msgJSON = JSON.parse(evt.data)

        let msgStatus = Number(msgJSON['status'])
        let msgCommand = msgJSON['command']

        if (msgStatus != 200) {
          this.elementText.sdpDataTag = msgJSON['statusDescription']
          stopPublisher()
        } else {
          this.elementText.sdpDataTag = ''

          let sdpData = msgJSON['sdp']
          if (sdpData !== undefined) {
            console.log('sdp: ' + msgJSON['sdp'])

            this.peerConnection
              .setRemoteDescription(new RTCSessionDescription(sdpData))
              .catch(errorHandler)
          }

          let iceCandidates = msgJSON['iceCandidates']
          if (iceCandidates !== undefined) {
            for (let iceCandidate of iceCandidates) {
              console.log('iceCandidates: ' + iceCandidate)

              this.peerConnection.addIceCandidate(
                new RTCIceCandidate(iceCandidate)
              )
            }
          }
        }

        if (this.wsConnection != null) this.wsConnection.close()
        this.wsConnection = null
      }

      this.wsConnection.onclose = () => {
        console.log('wsConnection.onclose')
      }

      this.wsConnection.onerror = evt => {
        console.log('wsConnection.onerror: ' + JSON.stringify(evt))

        this.elementText.sdpDataTag =
          'WebSocket connection failed: ' + this.wsURL
        stopPublisher()
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

.buttons {
  button {
    margin 0.25rem
  }
}
img, video {
  max-width 100%
}

.video-container {
  margin 2rem auto
}

.userChoices {
  margin 1rem
  text-align left
  label {
    font-weight bold
    padding 1rem
  }
}
</style>
