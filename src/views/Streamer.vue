<template>
  <div class="streamer">
    <h1>Vue WebRTC - Streaming test</h1>
    <div class="userChoices">
      <input type="hidden" id="userAgent" name="userAgent" value />

      <div>
        <label for="sdpURL">WS (SDP) URL:</label>
        <input type="text" id="sdpURL" size="50" v-model="wsURL" />
      </div>

      <div>
        <label for="applicationName">Application name:</label>
        <input type="text" id="applicationName" size="25" v-model="streamInfo.applicationName" />
      </div>

      <div>
        <label for="streamName">Stream name:</label>
        <input type="text" id="streamName" size="25" v-model="streamInfo.streamName" />
      </div>

      <div>
        <label for="videoBitrate">Video Bitrate:</label>
        <input type="text" id="videoBitrate" size="10" v-model="videoSettings.videoBitrate" />
      </div>

      <div>
        <label for="audioBitrate">Audio Bitrate:</label>
        <input type="text" id="audioBitrate" size="10" v-model="audioSettings.audioBitrate" />
      </div>

      <div>
        <label for="videoFrameRate">Video frame rate:</label>
        <input type="text" id="videoFrameRate" size="10" v-model="videoSettings.videoFrameRate" />
      </div>

      <div>
        <label for="videoChoice">Video choice:</label>
        <select name="videoChoice" id="videoChoice">
          <option :value="videoSettings.videoChoice" selected="selected">H264</option>
        </select>
      </div>

      <div>
        <label for="audioChoice">Audio choice:</label>
        <select type="text" id="audioChoice">
          <option :value="audioSettings.audioChoice">Opus</option>
        </select>
      </div>
    </div>

    <div class="buttons">
      <button @click="startCapture">Start capture device</button>
      <button v-show="localStream" @click="startStream">Start stream</button>
    </div>

    <div class="status">
      <p>Capture device: {{ device }}</p>
      <span v-if="!hasMediaDevice">Media device: off |</span>
      <span v-else>Media device: on |</span>
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
        applicationName: 'app-7e04',
        streamName: 'Skkvai9K',
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

    startPublisher() {
      this.wsURL = this.wsURL
      this.streamInfo.applicationName = this.streamInfo.applicationName
      this.streamInfo.streamName = this.streamInfo.streamName
      this.videoBitrate = this.videoSettings.videoBitrate
      this.audioBitrate = this.audioSettings.audioBitrate
      this.videoFrameRate = this.videoSettings.videoFrameRate
      this.userAgent = this.userAgent
      this.videoChoice = this.videoSettings.videoChoice
      this.audioChoice = this.audioSettings.audioChoice
      console.log('From startPublisher ', this.wsURL)

      console.log(
        'startPublisher: wsURL:' +
          this.wsURL +
          ' streamInfo:' +
          JSON.stringify(this.streamInfo)
      )

      this.wsConnect(this.wsURL)

      // $("#buttonGo").attr('value', GO_BUTTON_STOP);
    },

    stopPublisher() {
      if (this.peerConnection != null) this.peerConnection.close()
      this.peerConnection = null

      if (this.wsConnection != null) this.wsConnection.close()
      this.wsConnection = null

      // $("#buttonGo").attr('value', GO_BUTTON_START);

      console.log('stopPublisher')
    },

    startStream() {
      if (this.peerConnection == null) this.startPublisher()
      else this.stopPublisher()
    },
    // startStream() {
    //   this.wsConnect()
    // },

    wsConnect(url) {
      this.wsConnection = new WebSocket(this.wsURL)
      this.wsConnection.binaryType = 'arraybuffer'

      this.wsConnection.onopen = () => {
        console.log('wsConnection.onopen')

        this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig)
        this.peerConnection.onicecandidate = this.gotIceCandidate

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
          .then(this.gotDescription)
          .catch(this.errorHandler)
      }

      // var offerOptions = {
      // New spec states offerToReceiveAudio/Video are of type long (due to
      // having to tell how many "m" lines to generate).
      // http://w3c.github.io/webrtc-pc/#idl-def-RTCOfferAnswerOptions.
      //  offerToReceiveAudio: 1,
      // offerToReceiveVideo: 1,
      //	codecPayloadType: 0x42E01F,
      // }

      this.wsConnection.onmessage = evt => {
        console.log('wsConnection.onmessage: ' + evt.data)

        let msgJSON = JSON.parse(evt.data)

        let msgStatus = Number(msgJSON['status'])
        let msgCommand = msgJSON['command']

        if (msgStatus != 200) {
          this.elementText.sdpDataTag = msgJSON['statusDescription']
          this.stopPublisher()
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
        this.stopPublisher()
      }
    },

    addAudio(sdpStr, audioLine) {
      let sdpLines = sdpStr.split(/\r\n/)
      let sdpSection = 'header'
      let hitMID = false
      let sdpStrRet = ''
      let done = false

      for (let sdpLine of sdpLines) {
        if (sdpLine.length <= 0) continue

        sdpStrRet += sdpLine
        sdpStrRet += '\r\n'

        if ('a=rtcp-mux'.localeCompare(sdpLine) == 0 && done == false) {
          sdpStrRet += audioLine
          done = true
        }
      }
      return sdpStrRet
    },

    addVideo(sdpStr, videoLine) {
      let sdpLines = sdpStr.split(/\r\n/)
      let sdpSection = 'header'
      let hitMID = false
      let sdpStrRet = ''
      let done = false

      let rtcpSize = false
      let rtcpMux = false

      for (let sdpLine of sdpLines) {
        if (sdpLine.length <= 0) continue

        if (sdpLine.includes('a=rtcp-rsize')) {
          rtcpSize = true
        }

        if (sdpLine.includes('a=rtcp-mux')) {
          rtcpMux = true
        }
      }

      for (let sdpLine of sdpLines) {
        sdpStrRet += sdpLine
        sdpStrRet += '\r\n'

        if (
          'a=rtcp-rsize'.localeCompare(sdpLine) == 0 &&
          done == false &&
          rtcpSize == true
        ) {
          sdpStrRet += videoLine
          done = true
        }

        if (
          'a=rtcp-mux'.localeCompare(sdpLine) == 0 &&
          done == true &&
          rtcpSize == false
        ) {
          sdpStrRet += videoLine
          done = true
        }

        if (
          'a=rtcp-mux'.localeCompare(sdpLine) == 0 &&
          done == false &&
          rtcpSize == false
        ) {
          done = true
        }
      }
      return sdpStrRet
    },

    gotIceCandidate(event) {
      if (event.candidate != null) {
        console.log(
          'gotIceCandidate: ' +
            JSON.stringify({
              ice: event.candidate
            })
        )
      }
    },

    gotDescription(description) {
      let enhanceData = new Object()

      if (audioBitrate !== undefined)
        enhanceData.audioBitrate = Number(this.audioSettings.audioBitrate)
      if (videoBitrate !== undefined)
        enhanceData.videoBitrate = Number(this.videoSettings.videoBitrate)
      if (videoFrameRate !== undefined)
        enhanceData.videoFrameRate = Number(this.videoSettings.videoFrameRate)

      description.sdp = this.enhanceSDP(description.sdp, enhanceData)

      console.log(
        'gotDescription: ' +
          JSON.stringify({
            sdp: description
          })
      )

      return peerConnection
        .setLocalDescription(description)
        .then(() => {
          this.wsConnection.send(
            '{"direction":"publish", "command":"sendOffer", "streamInfo":' +
              JSON.stringify(streamInfo) +
              ', "sdp":' +
              JSON.stringify(description) +
              ', "userData":' +
              JSON.stringify(userData) +
              '}'
          )
        })
        .catch(err => {
          console.log('Set local description error:')
          console.log(err)
        })
    },

    enhanceSDP(sdpStr, enhanceData) {
      let sdpLines = sdpStr.split(/\r\n/)
      let sdpSection = 'header'
      let hitMID = false
      let sdpStrRet = ''

      //console.log("Original SDP: "+sdpStr)

      // Firefox provides a reasonable SDP, Chrome is just odd
      // so we have to doing a little mundging to make it all work
      if (
        !sdpStr.includes('THIS_IS_SDPARTA') ||
        this.videoSettings.videoChoice.includes('VP9')
      ) {
        for (let sdpLine of sdpLines) {
          if (sdpLine.length <= 0) continue

          let doneCheck = this.checkLine(sdpLine)
          if (!doneCheck) continue

          sdpStrRet += sdpLine
          sdpStrRet += '\r\n'
        }
        sdpStrRet = this.addAudio(
          sdpStrRet,
          deliverCheckLine(this.audioSettings.audioChoice, 'audio')
        )
        sdpStrRet = this.addVideo(
          sdpStrRet,
          deliverCheckLine(this.videoSettings.videoChoice, 'video')
        )
        sdpStr = sdpStrRet
        sdpLines = sdpStr.split(/\r\n/)
        sdpStrRet = ''
      }

      for (let sdpLine of sdpLines) {
        if (sdpLine.length <= 0) continue

        if (sdpLine.indexOf('m=audio') == 0 && audioIndex != -1) {
          audioMLines = sdpLine.split(' ')
          sdpStrRet +=
            audioMLines[0] +
            ' ' +
            audioMLines[1] +
            ' ' +
            audioMLines[2] +
            ' ' +
            audioIndex
        } else if (sdpLine.indexOf('m=video') == 0 && videoIndex != -1) {
          audioMLines = sdpLine.split(' ')
          sdpStrRet +=
            audioMLines[0] +
            ' ' +
            audioMLines[1] +
            ' ' +
            audioMLines[2] +
            ' ' +
            videoIndex
        } else {
          sdpStrRet += sdpLine
        }

        if (sdpLine.indexOf('m=audio') === 0) {
          sdpSection = 'audio'
          hitMID = false
        } else if (sdpLine.indexOf('m=video') === 0) {
          sdpSection = 'video'
          hitMID = false
        } else if (sdpLine.indexOf('a=rtpmap') == 0) {
          sdpSection = 'bandwidth'
          hitMID = false
        }

        if (
          sdpLine.indexOf('a=mid:') === 0 ||
          sdpLine.indexOf('a=rtpmap') == 0
        ) {
          if (!hitMID) {
            if ('audio'.localeCompare(sdpSection) == 0) {
              if (enhanceData.audioBitrate !== undefined) {
                sdpStrRet += '\r\nb=CT:' + enhanceData.audioBitrate
                sdpStrRet += '\r\nb=AS:' + enhanceData.audioBitrate
              }
              hitMID = true
            } else if ('video'.localeCompare(sdpSection) == 0) {
              if (enhanceData.videoBitrate !== undefined) {
                sdpStrRet += '\r\nb=CT:' + enhanceData.videoBitrate
                sdpStrRet += '\r\nb=AS:' + enhanceData.videoBitrate
                if (enhanceData.videoFrameRate !== undefined) {
                  sdpStrRet += '\r\na=framerate:' + enhanceData.videoFrameRate
                }
              }
              hitMID = true
            } else if ('bandwidth'.localeCompare(sdpSection) == 0) {
              var rtpmapID
              rtpmapID = getrtpMapID(sdpLine)
              if (rtpmapID !== null) {
                var match = rtpmapID[2].toLowerCase()
                if (
                  'vp9'.localeCompare(match) == 0 ||
                  'vp8'.localeCompare(match) == 0 ||
                  'h264'.localeCompare(match) == 0 ||
                  'red'.localeCompare(match) == 0 ||
                  'ulpfec'.localeCompare(match) == 0 ||
                  'rtx'.localeCompare(match) == 0
                ) {
                  if (enhanceData.videoBitrate !== undefined) {
                    sdpStrRet +=
                      '\r\na=fmtp:' +
                      rtpmapID[1] +
                      ' x-google-min-bitrate=' +
                      enhanceData.videoBitrate +
                      ';x-google-max-bitrate=' +
                      enhanceData.videoBitrate
                  }
                }

                if (
                  'opus'.localeCompare(match) == 0 ||
                  'isac'.localeCompare(match) == 0 ||
                  'g722'.localeCompare(match) == 0 ||
                  'pcmu'.localeCompare(match) == 0 ||
                  'pcma'.localeCompare(match) == 0 ||
                  'cn'.localeCompare(match) == 0
                ) {
                  if (enhanceData.audioBitrate !== undefined) {
                    sdpStrRet +=
                      '\r\na=fmtp:' +
                      rtpmapID[1] +
                      ' x-google-min-bitrate=' +
                      enhanceData.audioBitrate +
                      ';x-google-max-bitrate=' +
                      enhanceData.audioBitrate
                  }
                }
              }
            }
          }
        }
        sdpStrRet += '\r\n'
      }
      console.log('Resulting SDP: ' + sdpStrRet)
      return sdpStrRet
    },

    // Perform checkings for the SDP protocol
    // map from an RTP payload type number to a media encoding name that identifies the payload format
    checkLine(line) {
      if (
        line.startsWith('a=rtpmap') ||
        line.startsWith('a=rtcp-fb') ||
        line.startsWith('a=fmtp')
      ) {
        let res = line.split(':')

        if (res.length > 1) {
          let number = res[1].split(' ')
          if (!isNaN(number[0])) {
            if (!number[1].startsWith('http') && !number[1].startsWith('ur')) {
              let currentString = SDPOutput[number[0]]
              if (!currentString) {
                currentString = ''
              }
              currentString += line + '\r\n'
              SDPOutput[number[0]] = currentString
              return false
            }
          }
        }
      }

      return true
    },

    errorHandler(error) {
      console.log(error)
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
    margin: 0.25rem;
  }
}

img, video {
  max-width: 100%;
}

.video-container {
  margin: 2rem auto;
}

.userChoices {
  margin: 1rem;
  text-align: left;

  label {
    font-weight: bold;
    padding: 1rem;
  }
}
</style>
