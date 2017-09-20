<template>
  <scroll ref="scroll" class="view-list" @scroll="scroll" :probeType="probeType" :listenScroll="listenScroll"
          :data="data">
    <ul>
      <li class="view-group" v-for="viewGroup in data" ref="viewGroup">
        <div class="title">{{ viewGroup.title }}</div>
        <ul>
          <li v-for="item in viewGroup.items" class="items" @click="selectItem(item)">
            <img v-lazy="item.avatar">
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <ul class="view-indexes-list">
      <li class="item" v-for="(item,index) in indexesList" :class="{current : index === currentIndex}"
          @touchstart="indexesTouchStart" @touchmove.stop.prevent="indexesTouchMove"
          :data-index="index">{{item}}
      </li>
    </ul>
    <div class="title-fixed" v-show="fixedTitle" ref="titleFixed">
      <div class="title">{{fixedTitle}}</div>
    </div>
    <div class="loading-wrapper" v-show="!data.length">
      <Loading></Loading>
    </div>

  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom.js'

  // 右侧锚索引的高度
  const ANCHOR_HEIGHT = 18;
  // 固定标题高度
  const TITLE_HEIGHT = 29;

  export default {
    created() {
      this.probeType = 3;
      this.touch = {};
      this.groupHeightArr = [];
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        currentIndex: 0,
        listenScroll: true,
        diff: 0,
        scrollOutOfBounds: false    // 滚动是否超出最上面
      }
    },
    methods: {
      indexesTouchStart (e) {
        let startIndex = parseInt(getData(e.target, 'index'));
        this.touch.scrollY = e.touches[0].pageY;
        this.touch.startIndex = startIndex;
        this._scrollTo(startIndex);
      },
      indexesTouchMove (e) {
        let scrollY = e.touches[0].pageY;
        // 计算touch元素的个数
        let moveIndex = Math.floor((scrollY - this.touch.scrollY) / ANCHOR_HEIGHT);
        // 计算当前位置
        let currentIndex = this.touch.startIndex + moveIndex;
        this._scrollTo(currentIndex);
      },
      scroll (pos) {
        let scrollY = pos.y;
        let groupHeightArr = this.groupHeightArr;
        // 滚动超出最上面
        if (scrollY > 0) {
          this.scrollOutOfBounds = true;
          this.currentIndex = 0;
          return;
        }
        this.scrollOutOfBounds = false;
        for (let i = 0; i < groupHeightArr.length - 1; i++) {
          // 计算当前滚动区域所在位置
          if (-scrollY >= groupHeightArr[i] && -scrollY < groupHeightArr[i + 1]) {
            this.diff = groupHeightArr[i + 1] + scrollY;
            this.currentIndex = i;
            return;
          }
        }
        this.currentIndex = groupHeightArr.length - 1;
      },
      selectItem(item) {
        this.$emit('select', item);
      },
      // 计算内容区域每块元素的高度
      _calculateGroupHeight () {
        let height = 0;
        this.groupHeightArr.push(height);
        let viewGroup = this.$refs.viewGroup;
        for (let i = 0; i < viewGroup.length; i++) {
          height += viewGroup[i].clientHeight;
          this.groupHeightArr.push(height);
        }
      },
      // 滚动到指定位置
      _scrollTo (index) {
        if (index < 0 || index > this.$refs.viewGroup.length - 1) {
          return;
        }
        this.$refs.scroll.scrollToElement(this.$refs.viewGroup[index], 0)
        this.currentIndex = index;
      }
    },
    computed: {
      fixedTitle () {
        return !this.scrollOutOfBounds && this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
      },
      // 右侧索引列表
      indexesList () {
        return this.data.map((item) => {
          return item.title.substr(0, 1);
        })
      }
    },
    watch: {
      data () {
        setTimeout(() => {
          this._calculateGroupHeight();
        }, 20)
      },
      diff (newY) {
        let transY = (newY > 0 && newY < TITLE_HEIGHT) ? newY - TITLE_HEIGHT : 0
        if (this.transY === transY) {
          return
        }
        this.transY = transY
        this.$refs.titleFixed.style.transform = `translate3d(0,${transY}px,0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var.less');

  .view-list {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .view-group {
      padding-bottom: 20px;
      .title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: @font-size-small;
        background: @color-highlight-background;
        color: @color-text-l
      }
      .items {
        display: flex;
        align-items: center;
        padding: 20px 0 0 30px;
        img {
          width: 50px;
          height: 50px;
          flex: 0 0 50px;
          border-radius: 50%
        }
        .name {
          flex: 1;
          margin-left: 20px;
          color: @color-text-l;
          font-size: @font-size-medium;
        }
      }
    }
    .view-indexes-list {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      width: 20px;
      padding: 20px 0;
      border-radius: 10px;
      text-align: center;
      background: @color-background-d;
      font-family: Helvetica;
      .item {
        padding: 3px;
        line-height: 1;
        color: @color-text-l;
        font-size: @font-size-small;
        &.current {
          color: @color-theme
        }
      }
    }
    .title-fixed {
      position: absolute;
      top: -1px;
      left: 0;
      width: 100%;
      .title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: @font-size-small;
        background: @color-highlight-background;
        color: @color-text-l
      }
    }
    .loading-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translate3d(0, -50%, 0);
    }
  }
</style>
