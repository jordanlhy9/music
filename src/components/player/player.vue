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
        <div class="middle" @touchstart="middleTouchStart" @touchmove="middleTouchMove" @touchend="middleTouchEnd"
             ref="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img :src="currentSong.image" alt="">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{currentLyricText}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentMiddleShow==='left'}"></span>
            <span class="dot" :class="{'active':currentMiddleShow==='right'}"></span>
          </div>
          <div class="progress-wrapper">
            <div class="time time-l">{{numerFormat(currentTime)}}</div>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @changePercent="changePercent"></progress-bar>
            </div>
            <div class="time time-r">{{numerFormat(currentSong.duration)}}</div>
          </div>
          <div class="operators">
            <div class="icon i-left" :class="" @click="changeMode">
              <i :class="modeIcon"></i>
            </div>
            <div class="icon i-left" @click="prevSong" :class="disableCls">
              <i class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="cdIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" @click="nextSong" :class="disableCls">
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
        <div class="playing-btn" @click.stop="togglePlaying">
          <i :class="miniCdIcon"></i>
          <div class="progress-circle">
            <svg width="32" height="32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <circle class="progress-bar" r="15" cx="16" cy="16" fill="transparent" :stroke-dashoffset="dashOffset"/>
            </svg>
          </div>
        </div>
        <div class="playlist-btn">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @play="ready" @timeupdate="updateTime" @ended="end"
    ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations} from 'vuex'
  import {prefixStyle} from 'common/js/dom'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Scroll from 'base/scroll/scroll'
  import Lyric from 'lyric-parser'
  import animations from 'create-keyframe-animation'
  import progressBar from 'base/progress-bar/progress-bar'

  const transform = prefixStyle('transform');
  const transition = prefixStyle('transition');
  const animation = prefixStyle('animation');

  const circumference = 94;

  export default {
    created() {
      this.middleTouch = {};
      this.timer = null;
    },
    data() {
      return {
        songReady: false,
        currentTime: 0,
        currentLyric: null,
        currentLineNum: 0,
        currentMiddleShow: 'left',
        currentLyricText: ''
      }
    },
    computed: {
      cdCls () {
        return this.playingStatus ? 'play' : 'play pause';
      },
      disableCls() {
        return this.songReady ? '' : 'disable';
      },
      cdIcon() {
        return this.playingStatus ? 'icon-pause' : 'icon-play';
      },
      modeIcon() {
        return this.playMode === playMode.loop ? 'icon-loop' : (this.playMode === playMode.sequence ? 'icon-sequence' : 'icon-random');
      },
      miniCdIcon() {
        return this.playingStatus ? 'icon-pause-mini' : 'icon-play-mini';
      },
      dashOffset() {
        return circumference * (1 - this.percent);
      },
      percent() {
        if (!this.currentSong) {
          return 0;
        }
        return this.currentTime / this.currentSong.duration;
      },
      ...mapGetters([
        'playingStatus',
        'playlist',
        'sequenceList',
        'currentSong',
        'fullScreen',
        'currentIndex',
        'playMode'
      ])
    },
    methods: {
      // 最小化播放器
      back() {
        this.setFullScreen(false)
      },
      // 展开播放器
      open() {
        this.setFullScreen(true)
      },
      // 切换播放模式
      changeMode() {
        let mode = (this.playMode + 1) % 3;
        let list = this.sequenceList;
        // 随机模式时打乱歌曲顺序
        if (mode === playMode.random) {
          list = shuffle(list);
        }
        this.resetCurrentIndex(list)
        this.setPlaylist(list);
        this.setPlayMode(mode);
      },
      // 重新设置当前歌曲索引
      resetCurrentIndex(list) {
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id;
        })
        this.setCurrentIndex(index);
      },
      // 上一首
      prevSong() {
        if (!this.songReady) {
          return;
        }
        // 到第一首时切换到最后一首
        if (this.currentIndex === 0) {
          this.setCurrentIndex(this.playlist.length - 1);
        } else {
          this.setCurrentIndex(this.currentIndex - 1);
        }
        this.songReady = false;
      },
      // 下一首
      nextSong() {
        if (!this.songReady) {
          return;
        }
        // 都最后一首时切换到第一首
        if (this.currentIndex === this.playlist.length - 1) {
          this.setCurrentIndex(0);
        } else {
          this.setCurrentIndex(this.currentIndex + 1);
        }
        this.songReady = false;
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

        // 注册动画
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })

        // 执行动画
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
      middleTouchStart(e) {
        this.middleTouch.startX = e.touches[0].pageX;
        this.middleTouch.startY = e.touches[0].pageY;
        // 是否可以移动的标记
        this.middleTouch.moveAction = false;
      },
      middleTouchMove(e) {
        let touch = e.touches[0];
        let deltaX = touch.pageX - this.middleTouch.startX;
        let deltaY = touch.pageY - this.middleTouch.startY;
        // 防止划动歌词时切换
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return;
        }
        this.middleTouch.moveAction = true;
        let left = this.currentMiddleShow === 'left' ? 0 : -window.innerWidth;
        // 计算偏移宽度, 最大0, 最小-window.innerWidth
        let offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
        // 计算偏移百分比
        this.middleTouch.percent = Math.abs(offsetWidth / window.innerWidth);

        this.$refs.middle.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      },
      middleTouchEnd() {
        if (!this.middleTouch.moveAction) {
          return
        }
        let moveParcent = this.middleTouch.percent;
        let offsetWidth = 0;
        // 移动距离大于屏幕宽度10%时切换,否则回退
        if (this.currentMiddleShow === 'left') {
          if (moveParcent > 0.1) {
            offsetWidth = -window.innerWidth;
            this.currentMiddleShow = 'right';
          } else {
            offsetWidth = 0;
          }
        } else {
          if (moveParcent < 0.9) {
            offsetWidth = 0;
            this.currentMiddleShow = 'left';
          } else {
            offsetWidth = -window.innerWidth;
          }
        }
        let time = 0.3;
        this.$refs.middle.style[transition] = `all ${time}s`;
        this.$refs.middle.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      },
      // 切换播放器播放状态
      togglePlaying() {
        this.setPlayingStatus(!this.playingStatus);
      },
      // 歌曲播放结束
      end() {
        this.setCurrentIndex(this.currentIndex + 1);
      },
      // 准备播放
      ready() {
        this.songReady = true;
      },
      // 获取歌曲当前时间进度
      updateTime(e) {
        this.currentTime = e.target.currentTime;
      },
      // 改变歌曲的进度
      changePercent(percent) {
        let currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime;
        // 设置歌词进度
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      // 数字格式化
      numerFormat(num) {
        // 向下取整
        num = Math.min(num, this.currentSong.duration) | 0;
        let minute = num / 60 | 0;
        let second = this._pad(num % 60);
        return `${minute}:${second}`;
      },
      // 前面补零
      _pad(num, n = 2) {
        let len = num.toString().length;
        while (len < n) {
          num = '0' + num;
          len++
        }
        return num;
      },
      // 歌词变化回调
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum;
        // 滚动歌词, 大于5行时滚动
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5];
          this.$refs.lyricList.scrollToElement(lineEl, 1000);
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000);
        }
        this.currentLyricText = txt;
      },
      // 获取歌词
      _getLyric() {
        this.currentSong.getLyric().then((data) => {
          this.currentLyric = new Lyric(data, this.handleLyric)
          if (this.playingStatus) {
            this.currentLyric.play()
          }
        })
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
        'setCurrentIndex': 'SET_CURRENT_INDEX',
        'setPlayingStatus': 'SET_PLAYING_STATUS',
        'setPlaylist': 'SET_PLAYLIST',
        'setPlayMode': 'SET_PLAY_MODE'
      })
    },
    components: {
      progressBar,
      Scroll
    },
    watch: {
      // 当前歌曲有变化时立即开始播放
      currentSong (newSong, oldSong) {
        if (!newSong.id) {
          return;
        }
        if (newSong.id === oldSong) {
          return;
        }
        if (this.currentLyric) {
          this.currentLyric.stop();
          this.currentTime = 0;
          this.currentLyricText = '';
          this.currentLineNum = 0;
        }
        this.$nextTick(() => {
          // 延时一秒钟,防止快速切换报错
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.$refs.audio.play()
            this._getLyric();
          }, 1000)
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
        position: fixed;
        top: 80px;
        left: 0;
        bottom: 170px;
        width: 100%;
        white-space: nowrap;
        .middle-l {
          display: inline-block;
          width: 100%;
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
              &.pause {
                animation-play-state: paused;
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: @font-size-medium;
              color: @color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: @color-text-l;
              font-size: @font-size-medium;
              &.current {
                color: @color-text;
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
        .dot-wrapper {
          text-align: center;
          font-size: 0px;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: @color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: @color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0 auto;
          padding: 10px 0;
          .time {
            flex: 0 0 30px;
            width: 30px;
            color: @color-text;
            font-size: @font-size-small;
            text-align: left;
          }
          .time-r {
            text-align: right;
          }
          .progress-bar-wrapper {
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
            &.disable {
              color: @color-theme-d;
            }
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
        &.pause {
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
        position: relative;
        flex: 0 0 50px;
        width: 50px;
        padding: 0 10px;
        font-size: 32px;
        color: @color-theme-d;
        .progress-circle {
          position: absolute;
          stroke-width: 2px;
          top: 0;
          left: 10px;
          width: 32px;
          height: 32px;
          transform: rotate(-90deg);
          stroke-dasharray: 94;
          stroke-dashoffset: 94;
          stroke: @color-theme;
        }
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
