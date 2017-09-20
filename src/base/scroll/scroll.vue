<template>
  <div ref="scroll">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';

  export default {
    timer: null,
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: []
      },
      listenScroll: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      refresh() {
        this.scroll && this.scroll.refresh();
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
      },
      _initScroll() {
        if (!this.$refs.scroll) {
          return;
        }
        this.scroll = new BScroll(this.$refs.scroll, {
          probeType: this.probeType,
          click: this.click
        })

        // 监听滚动事件
        if (this.listenScroll) {
          let that = this;
          this.scroll.on('scroll', (pos) => {
            that.$emit('scroll', pos);
          })
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
        this._initScroll();
      })
    },
    watch: {
      data() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.refresh();
        }, 20)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
</style>
