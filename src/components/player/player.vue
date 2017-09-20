<template>
  <div class="player-rapper" v-show="playlist.length > 0">
    <transition name="full-screen"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background-image">
          <img :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <div class="title" v-html="currentSong.name"></div>
          <div class="subtitle" v-html="currentSong.singer"></div>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img :src="currentSong.image" alt="">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-wrapper">
            <div class="time time-l">0.00</div>
            <div class="progress-bar-wrapper">
              <progress-bar></progress-bar>
            </div>
            <div class="time time-r">0.00</div>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <div class="icon i-left">
              <i class="icon-prev"></i>
            </div>
            <div class="icon i-center">
              <i :class="cdIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon" :class="cdCls">
          <img width="40" height="40" :src="currentSong.image" ref="miniIcon">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="playing-btn">
          <i :class="miniCdIcon" @click.stop="togglePlaying"></i>
        </div>
        <div class="playlist-btn">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @play="ready" @timeupdate="updateTime"
          ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex'
  import {prefixStyle} from 'common/js/dom'
  import animations from 'create-keyframe-animation'
  import progressBar from 'base/progress-bar/progress-bar'

  const transform = prefixStyle('transform');
  const transition = prefixStyle('transition');
  const animation = prefixStyle('animation');

  export default {
    computed: {
      cdCls () {
        return this.playingStatus ? 'play' : 'play pause';
      },
      cdIcon() {
        return this.playingStatus ? 'icon-pause' : 'icon-play';
      },
      miniCdIcon() {
        return this.playingStatus ? 'icon-pause-mini' : 'icon-play-mini';
      },
      ...mapGetters([
        'playingStatus',
        'playlist',
        'currentSong',
        'fullScreen'
      ])
    },
    methods: {
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      enter(el, done) {
        let {transformX, transformY, scale} = this._getPosAndScale();

        // 利用create-keyframe-animation库进行动画设置
        let animation = {
          0: {
            transform: `translate3d(${transformX}px, ${transformY}px, 0) scale(${scale})`
          },
          50: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }

        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter(el) {
        animations.unregisterAnimation('move');
        this.$refs.cdWrapper.style[animation] = '';
      },
      leave(el, done) {
        let {transformX, transformY, scale} = this._getPosAndScale();

        this.$refs.cdWrapper.style[transition] = 'all .4s';
        this.$refs.cdWrapper.style[transform] = `translate3d(${transformX}px,${transformY}px,0) scale(${scale})`;
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave(el) {
        this.$refs.cdWrapper.style[transition] = '';
        this.$refs.cdWrapper.style[transform] = '';
      },
      togglePlaying() {
        console.log(!this.playingStatus);
        this.setPlayingStatus(!this.playingStatus);
      },
      ready() {
        this.songReady = true;
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime;
        console.log(this.currentTime)
      },
      // 计算大CD和小CD偏移以及缩放比例
      _getPosAndScale() {
        let cdWidth = window.innerWidth * 0.8;  // 大CD的宽度
        let cdToTopHeight = 80;                 // 距离浏览器头部的高度
        let miniCdWidth = 20;                   // 小CD的宽度
        let miniCdToLeftWidth = 20;             // 距离浏览器左侧的高度
        let miniPlayerWrapperHeight = 60;       // 底部播放器的高度
        let scale = miniCdWidth / cdWidth;
        let transformX = -(window.innerWidth / 2 - miniCdWidth / 2 - miniCdToLeftWidth);
        let transformY = window.innerHeight - cdToTopHeight - cdWidth / 2 - miniPlayerWrapperHeight / 2;
        return {
          transformX,
          transformY,
          scale
        }
      },
      ...mapMutations({
        'setFullScreen': 'SET_FULL_SCREEN',
        'setPlayingStatus': 'SET_PLAYING_STATUS'
      })
    },
    components: {
      progressBar
    },
    watch: {
      currentSong () {
        this.$nextTick(() => {
          this.$refs.audio.play();
        })
      },
      playingStatus () {
        const audio = this.$refs.audio;
        this.$nextTick(() => {
          this.playingStatus ? audio.play() : audio.pause();
        })
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var');

  .player-rapper {
    .normal-player {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      z-index: 150;
      background: @color-background;
      .background-image {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        img {
          width: 100%;
          height: 100%;
          opacity: 0.6;
          filter: blur(20px)
        }
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
            display: block;
            padding: 9px;
            font-size: @font-size-large-x;
            color: @color-theme;
            transform: rotate(-90deg);
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          height: 40px;
          line-height: 40px;
          text-align: center;
          color: @color-text;
          font-size: @font-size-large;
        }
        .subtitle {
          width: 70%;
          margin: 0 auto;
          height: 20px;
          line-height: 20px;
          text-align: center;
          font-size: @font-size-medium;
          color: @color-text;
        }
      }
      .middle {
        margin-top: 20px;
        .middle-l {
          .cd-wrapper {
            position: relative;
            width: 80%;
            margin: 0 auto;
            padding-top: 80%;
            .cd {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: 10px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
              &.play {
                animation: rotate 20s linear infinite;
              }
              &.pause{
                animation-play-state: paused;
              }
            }
          }
        }
      }
      .bottom {
        position: fixed;
        bottom: 50px;
        left: 0;
        width: 100%;
        .progress-wrapper{
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0 auto;
          padding: 10px 0;
          .time{
            flex: 0 0 40px;
            width: 40px;
            color: @color-text;
            font-size: @font-size-small;
            text-align: center;
          }
          .progress-bar-wrapper{
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          text-align: center;
          .icon {
            flex: 1;
            display: inline-block;
            font-size: 30px;
            color: @color-theme;
            &.i-center {
              font-size: 40px;
            }
          }
        }
      }
    }
    .full-screen-enter-active, .full-screen-leave-active {
      transition: all 0.4s;
      .top, .bottom {
        transition: .4s all cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }
    .full-screen-enter, .full-screen-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100%, 0);
      }
      .bottom {
        transform: translate3d(0, 100%, 0);
      }
    }
    .mini-player {
      display: flex;
      position: fixed;
      align-items: center;
      left: 0;
      bottom: 0;
      z-index: 200;
      width: 100%;
      height: 60px;
      background: @color-highlight-background;
      .icon {
        flex: 0 0 70px;
        width: 70px;
        padding: 0 10px 0 20px;
        img {
          border-radius: 50%;
        }
        &.play {
          animation: rotate 20s linear infinite;
        }
        &.pause{
          animation-play-state: paused;
        }
      }
      .text {
        display: flex;
        flex-direction: column;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          margin-bottom: 2px;
          font-size: @font-size-medium;
          color: @color-text;
        }
        .desc {
          font-size: @font-size-small;
          color: @color-text-d;
        }
      }
      .playing-btn {
        flex: 0 0 50px;
        width: 50px;
        padding: 0 10px;
        font-size: 32px;
        color: @color-theme-d;
      }
      .playlist-btn {
        flex: 0 0 50px;
        width: 50px;
        padding: 0 10px;
        font-size: 30px;
        color: @color-theme-d;
      }
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
