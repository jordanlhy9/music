<template>
  <div class="progress-bar" @click="progressClick">
    <div class="bar-inner" ref="barInner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn" ref="progressBtn" @touchstart.prevent="btnTouchstart" @touchmove.prevent="btnTouchmove"
           @touchend="btnTouchend">
        <span class="btn"></span>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform');
  // 进度条按钮的宽度
  const btnWidth = 16;
  // 进度条可移动的宽度
  const activityProgressWidth = window.innerWidth * 0.8 - 60 - btnWidth;
  // 进度条距离屏幕左侧的距离
  const barToLeftWidth = window.innerWidth * 0.1 + 30;
  export default {
    created() {
      this.startX = 0;
      this.originX = 0;
      this.inTouch = false;
    },
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    methods: {
      progressClick(e) {
        let pageX = e.pageX;
        let transX = pageX - barToLeftWidth;
        this._transform(transX);
        this._changePercent();
      },
      btnTouchstart(e) {
        this.inTouch = true;
        this.startX = e.touches[0].pageX;
        this.originX = this.$refs.progress.clientWidth;
      },
      btnTouchmove(e) {
        let moveX = e.touches[0].pageX;
        // 记录拖动距离
        let deltaX = moveX - this.startX;
        // 进度条的记录要 >=0 and <= 可移动宽度
        let transX = Math.min(activityProgressWidth, Math.max(0, this.originX + deltaX));
        this._transform(transX);
      },
      btnTouchend(e) {
        this.inTouch = false;
        this._changePercent();
      },
      // 移动进度条以及按钮
      _transform(num) {
        this.$refs.progress.style.width = `${num}px`;
        this.$refs.progressBtn.style[transform] = `translate3d(${num}px,0,0)`;
      },
      // 重新计算进度百分比
      _changePercent() {
        let percent = this.$refs.progress.clientWidth / activityProgressWidth;
        this.$emit('changePercent', percent);
      }
    },
    watch: {
      // 歌曲进度变化时更新进度条状态
      percent (newPercent) {
        this.$nextTick(() => {
          if (!this.inTouch) {
            let transW = newPercent * activityProgressWidth;
            this._transform(transW);
          }
        })
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var');

  .progress-bar {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
    .bar-inner {
      position: absolute;
      width: 100%;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: @color-theme;
      }
      .progress-btn {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .btn {
          display: block;
          position: relative;
          top: 7px;
          left: 7px;
          width: 16px;
          height: 16px;
          border: 3px solid @color-text;
          border-radius: 50%;
          background: @color-theme;
        }
      }
    }
  }
</style>
