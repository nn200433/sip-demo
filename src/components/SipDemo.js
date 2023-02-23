import { Vue, Component, Ref } from "vue-property-decorator";

import { BButton, BFormInput } from "bootstrap-vue";
import { Web, URI } from "sip.js";

import "./SipDemo.less";

import Elli from "./Ellipsis.js";

// import { Audio2Wave } from 'audio2wave';


const { SimpleUser } = Web;

@Component
class SipDemo extends Vue {
  /** @type { import('sip.js/lib/platform/web').SimpleUser } */
  userAgent = null; // sipClient
  registed = false; // 用户是否已经注册成功
  connected = false; // sip是否已经连接
  incoming = false; // 当前是否有新的来电
  calling = false; // 是否正在通话中
  number = ""; // number for call
  callingUser = false; // 正在呼叫中

  // audio2wave = null;

  @Ref("remoteAudio") audio;
  @Ref("localAudio") localAudio;
  @Ref("remoteVideo") video;
  @Ref("localVideo") localVideo;
  @Ref("audio2wavetest") audio2wavetest;

  @Ref("sipconnectdomain") sipConnectDomain;
  @Ref("sipconnectport") sipConnectPort;
  @Ref("sipwsprotocol") sipWsProtocol;
  @Ref("sipwsport") sipWsPort;
  @Ref("user") user;
  @Ref("pass") pass;

  // Web.MediaStreamFactory = (
  //   constraints: MediaStreamConstraints,
  //   sessionDescriptionHandler: Web.SessionDescriptionHandler
  // )

  async initAgent() {
    let uri = new URI(
      "sip",
      this.user.value,
      this.sipConnectDomain.value,
      this.sipConnectPort.value
    );
    let wsUrl = this.getWebsocketUrl();
    console.log("uri = ", uri.toString);
    console.log("ws = ", wsUrl);
    const userAgent = new SimpleUser(wsUrl, {
      aor: uri,
      delegate: {
        onCallAnswered: (res) => {
          console.warn("呼叫应答...");
          // this.audio2wave = new Audio2Wave({
          //   audio: res,
          //   container: this.audio2wavetest,
          //   drawerConfig: {
          //     canvasWH: {
          //       width: 200,
          //       height: 80
          //     }
          //   }
          // });
          queueMicrotask(() => {
            // this.audio2wave.start();
          });
          this.callingUser = false;
          this.calling = true;
          this.incoming = false;
        },
        onCallReceived: (res) => {
          console.warn("呼叫接收...", res);
          this.incoming = true;
        },
        onCallHangup: () => {
          // this.audio2wave.destroy();
          this.calling = false;
          this.callingUser = false;
          this.incoming = false;
          console.warn("呼叫挂断...");
        },
        onCallCreated: (res) => {
          console.warn("呼叫创建...", res);
        },
        onRegistered: (res) => {
          console.warn("用户注册...", res);
          this.registed = true;
        },
        onServerConnect: (res) => {
          console.warn("服务器连接...", res);
          this.connected = true;
          setTimeout(() => {
            this.userAgent.register();
          }, 1000);
        },
      },
      media: {
        constraints: {
          audio: true,
          vedio: true,
        },
        remote: {
          audio: this.audio,
          video: this.video,
        },
        local: {
          audio: this.localAudio,
          video: this.localVideo,
        },
      },
      userAgentOptions: {
        authorizationUsername: this.user.value,
        authorizationPassword: this.pass.value || this.user.value,
        uri,
        // sipExtension100rel: SIPExtension.Unsupported,
        transportOptions: {
          server: wsUrl,
        },
      },
    });

    try {
      this.userAgent = userAgent;
      await userAgent.connect();
    } catch (e) {
      console.error("connecting or registing failed...");
    }

    return Promise.resolve();
  }

  async buildConnect() {
    await this.initAgent();
  }
  async call() {
    const { number } = this;
    try {
      this.callingUser = true;
      let callTo = `sip:${number}@${this.sipConnectDomain.value}:${this.sipConnectPort.value}`;
      console.log("---> 准备给", callTo, "打电话");
      await this.userAgent.call(callTo, {
        earlyMedia: false,
        inviteWithoutSdp: false,
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: true },
        },
        delegate: {
          onSessionDescriptionHandler: (sdh) => {
            console.log("----> call", sdh);
          },
        },
      });
    } catch (e) {
      console.error("call failed...");
    }
  }
  hangup() {
    this.userAgent.hangup();
  }
  hold() {
    this.userAgent.hold();
  }
  unhold() {
    this.userAgent.unhold();
  }
  numberInput(v) {
    this.number = v;
  }
  answer() {
    this.userAgent.answer({
      extraHeaders: [],
      sessionDescriptionHandlerModifiers: [],
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: true },
      },
    });
  }
  render() {
    const {
      connected,
      registed,
      calling,
      incoming,
      number,
      callingUser,
    } = this;
    return (
      <div class="sip-demo-component-container">
        <div style="display: flex; justify-content: space-around;">
          <div style="background: black; border: 1px solid lightgrey; width: 200px; ">
            <p style="color:white;">你的摄像头</p>
            <video id="localVideo" ref="localVideo" width="100%" muted="muted">
              <p>您的浏览器不支持HTML5的视频。</p>
            </video>
          </div>

          <div id="sip-info">
            <div style="display: flex">
              <label for="sipconnectdomain">
              <span style="width:75px;display: inline-block;">IP：</span>
                <input
                  ref="sipconnectdomain"
                  id="sipconnectdomain"
                  value="192.168.0.112"
                  size="sm"
                />
              </label>
              <label for="sipconnectport" style="margin-left:10px;">
                <span style="width:75px;display: inline-block;">SIP端口：</span>
                <input
                  ref="sipconnectport"
                  id="sipconnectport"
                  value="5060"
                  size="sm"
                />
              </label>
            </div>
            <div style="display: flex">
              <label for="sipwsprotocol">
                <span style="width:75px;display: inline-block;">ws协议：</span>
                <input
                  ref="sipwsprotocol"
                  id="sipwsprotocol"
                  value="wss"
                  size="sm"
                />
              </label>
              <label for="sipwsport"  style="margin-left:10px;">
                <span style="width:75px;display: inline-block;">ws端口：</span>
                <input ref="sipwsport" id="sipwsport" value="7443" size="sm" />
              </label>
            </div>
            <div style="display: flex">
              <label for="user">
                <span style="width:75px;display: inline-block;">分机号：</span>
                <input ref="user" id="user" value="1000" size="sm" />
              </label>
              <label for="pass"  style="margin-left:10px;">
                <span style="width:75px;display: inline-block;">密码：</span>
                <input ref="pass" id="pass" value="1234" size="sm" />
              </label>
            </div>
            <div style="display: flex;justify-content: right;">
            <BButton
                size="sm"
                style="width: 60px"
                onClick={this.buildConnect}
              >
                注册
              </BButton>
            </div>
          </div>
        </div>

        <div>sip {!connected ? "未连接" : "已连接"}</div>
        <div>
          {registed && this.user ? `${this.user.value} 已注册` : `未注册`}
        </div>
        {calling ? (
          <div>
            正在通话中
            <Elli />
            <BButton
              variant="danger"
              size="sm"
              style={{ width: "60px" }}
              onClick={this.hangup}
            >
              挂断
            </BButton>
          </div>
        ) : null}
        {callingUser || calling || incoming ? null : (
          <div>
            <div>暂无通话</div>
            <div style={{ display: "flex" }}>
              <BFormInput value={number} onInput={this.numberInput} size="sm" />
              <BButton
                size="sm"
                style={{ width: "60px" }}
                onClick={this.call}
                disabled={!number}
              >
                呼叫
              </BButton>
            </div>
          </div>
        )}
        {incoming ? (
          <div>
            <span>
              来电提示中
              <Elli />
            </span>
            <BButton variant="success" size="sm" onClick={this.answer}>
              接听
            </BButton>
          </div>
        ) : null}
        {callingUser ? (
          <div>
            正在拨号中
            <Elli />
          </div>
        ) : null}
        {}
        <audio ref="remoteAudio" class="hide-audio" controls src="" />
        <audio ref="localAudio" class="hide-audio" controls src="" />

          <div style="background: black; border: 1px solid lightgrey; width: 100%;     margin-top: 10px;">
            <p style="color:white;">对方的摄像头</p>
            <div style="height:100%;width:100%;">
              <video
                id="remoteVideo"
                ref="remoteVideo"
                width="100%"
                muted="muted"
                style="height:100%;width:100%;"
              >
                <p>您的浏览器不支持HTML5的视频。</p>
              </video>
            </div>
        </div>

        {/* <div ref="audio2wavetest" style="height: 80px; width: 500px"/> */}
      </div>
    );
  }

  getWebsocketUrl() {
    return `${this.sipWsProtocol.value}://${this.sipConnectDomain.value}:${this.sipWsPort.value}`;
  }
}

export default SipDemo;
