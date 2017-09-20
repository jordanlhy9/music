<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="slider-status">
      <b v-for="(item,index) in sliderStatus" :class="{active: currentPageIndex === index}"></b>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import {addClass} from 'common/js/dom.js'

  export default {
    name: 'slider',
    timer: null,
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 3000
      },
      speed: {
        type: Number,
        default: 400
      }
    },
    data () {
      return {
        sliderStatus: [],
        currentPageIndex: 0
      }
    },
    mounted () {
      this.$nextTick(() => {
        this._setSliderWidth();
        this._initSliderStatus();
        setTimeout(() => {
          this._initSlider();
          this._pay();
        }, 100)
      });

      // 监听窗口变化事件
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }

        // 重新计算轮播图宽度
        this._setSliderWidth(true);
        this.slider.refresh();
      })
    },
    methods: {
      refresh() {
        if (!this.slider) {
          return;
        }
        this.slider.refresh();
      },
      // 设置轮播图宽度
      _setSliderWidth(isResize) {
        let width = 0;
        this.children = this.$refs.sliderGroup.children;
        let sliderWidth = this.$refs.slider.clientWidth;

        for (let i = 0; i < this.children.length; i++) {
          width += sliderWidth;
          this.children[i].style.width = sliderWidth + 'px';
          addClass(this.children[i], 'slider-item');
        }

        // 加上两个clone元素的宽度
        if (this.loop && !isResize) {
          width += 2 * sliderWidth;
        }

        this.$refs.sliderGroup.style.width = width + 'px';
      },
      // 初始化slider
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          momentum: false,
          snap: {
            loop: this.loop,
            threshold: 0.3,
            speed: this.speed
          },
          click: true
        });

        this.slider.on('scrollEnd', () => {
          this.currentPageIndex = this.slider.getCurrentPage().pageX;
          if (this.loop) {
            this.currentPageIndex -= 1;
          }

          clearTimeout(this.timer);
          this._pay();
        })
      },
      _initSliderStatus() {
        this.sliderStatus = new Array(this.children.length)
      },
      _pay() {
        let pageIndex = this.currentPageIndex + 1;

        if (this.loop) {
          pageIndex += 1;
        }

        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, this.speed)
        }, this.interval)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var.less');

  .slider {
    .slider-group {
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      .slider-item {
        float: left;
        overflow: hidden;
        a {
          display: block;
          width: 100%;
          overflow: hidden;
          text-decoration: none;
          img {
            display: block;
            width: 100%;
          }
        }
      }
    }
    .slider-status {
      position: absolute;
      bottom: 12px;
      right: 0px;
      width: 100%;
      text-align: center;
      font-size: 0px;
      b {
        display: inline-block;
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
  }
</style>
