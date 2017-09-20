<template>
  <div class="singer-detail">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <Scroll :data="songs" ref="scroll" class="scroll-list" :probeType="probeType" :listenScroll="listenScroll"
            @scroll="scroll">
      <div class="song-list-wrapper">
        <Songs :songs="songs" @selectSong="selectSong"></Songs>
      </div>
      <div class="loading-wrapper" v-show="!songs.length">
        <Loading></Loading>
      </div>
    </Scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Songs from 'base/songs/songs'
  import Loading from 'base/loading/loading'
  import {mapActions} from 'vuex'
  import {prefixStyle} from 'common/js/dom'

  const RESERVED_HEIGHT = 40;
  const transform = prefixStyle('transform');
  const backdrop = prefixStyle('backdrop-filter');

  export default {
    created() {
      this.scrollY = 0;
    },
    props: {
      title: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      bgImage: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        probeType: 3,
        listenScroll: true
      }
    },
    methods: {
      back() {
        this.$router.back();
      },
      selectSong(song, index) {
        this.selectPlay({
          list: this.songs,
          index: index
        })
      },
      scroll(pos) {
        let y = pos.y;
        let blur = 0;
        let zIndex = 0;
        // 计算最小滚动距离,距离最上方40px
        let minTransfromY = -this.bgImageHeight + RESERVED_HEIGHT;
        let transfromY = Math.max(minTransfromY, y);
        let scale = 1;
        // 背景图片放大比例
        const percent = Math.abs(y / this.bgImageHeight)

        if (y > 0) {
          scale = 1 + percent;
          zIndex = 10;
        } else {
          blur = Math.min(20, percent * 20)
        }

        this.$refs.layer.style[transform] = `translate3d(0,${transfromY}px,0)`;
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`;

        if (y < minTransfromY) {
          // 滑到最上方时设置背景图片的高度,zindex,隐藏按钮
          zIndex = 10;
          this.$refs.bgImage.style.paddingTop = 0;
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;
          this.$refs.playBtn.style.display = 'none';
        } else {
          // 重置
          this.$refs.bgImage.style.paddingTop = '70%';
          this.$refs.bgImage.style.height = 0;
          this.$refs.playBtn.style.display = '';
        }

        this.$refs.bgImage.style[transform] = `scale(${scale})`;
        this.$refs.bgImage.style.zIndex = zIndex;
      },
      ...mapActions([
        'selectPlay'
      ])
    },
    mounted() {
      this.bgImageHeight = this.$refs.bgImage.clientHeight;
      this.$refs.scroll.$el.style.top = `${this.bgImageHeight}px`;
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    components: {
      Scroll,
      Songs,
      Loading
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var.less');
  @import url('../../common/less/_fun.less');

  .singer-detail {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: @color-background;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 40;
      .icon-back {
        display: block;
        padding: 10px;
        font-size: @font-size-large-x;
        color: @color-theme
      }
    }
    .title {
      position: absolute;
      top: 0;
      left: 10%;
      z-index: 40;
      width: 80%;
      .no-wrap();
      text-align: center;
      line-height: 40px;
      font-size: @font-size-large;
      color: @color-text;
    }
    .bg-image {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 70%;
      transform-origin: top;
      background-size: cover;
      .play-wrapper {
        position: absolute;
        bottom: 20px;
        z-index: 50;
        width: 100%;
        .play {
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid @color-theme;
          color: @color-theme;
          border-radius: 100px;
          font-size: 0;
          .icon-play {
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            font-size: @font-size-medium-x;
          }
          .text {
            display: inline-block;
            vertical-align: middle;
            font-size: @font-size-small;
          }
        }
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .bg-layer {
      position: relative;
      height: 100%;
      background: @color-background;
    }
    .scroll-list {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 100%;
      background: @color-background;
      .song-list-wrapper {
        padding: 20px 30px;
      }
      .loading-wrapper {
        position: absolute;
        top: 40%;
        width: 100%;
        transfrom: translateY(-50%);
      }
    }
  }
</style>
