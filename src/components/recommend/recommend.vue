<template>
  <div class="recommend">
    <Scroll class="recommend-content" ref="scroll" :data="dissList">
      <div>
        <div class="slider-warpper" v-if="recommends.length > 0">
          <Slider ref="slider">
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <img @load="imageOnload" :src="item.picUrl">
              </a>
            </div>
          </Slider>
        </div>
        <div class="recommend-list">
          <h1 class="title">热门歌单推荐</h1>
          <ul>
            <li class="item" v-for="(item,index) in dissList">
              <div class="icon">
                <img v-lazy="item.imgurl"
                     :alt="item.dissname">
              </div>
              <div class="text">
                <div class="name">{{item.creator.name}}</div>
                <div class="desc" v-html="item.dissname"></div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Scroll>
    <div class="loading-wrapper" v-show="!dissList.length">
      <Loading></Loading>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {ERR_OK} from 'api/config.js'
  import {getRecommend, getDissList} from 'api/recommend.js'

  export default {
    data() {
      return {
        recommends: [],
        dissList: []
      }
    },
    created() {
      this._getRecommend();
      this._getDissList();
    },
    methods: {
      imageOnload() {
        if (!this.imgLoad) {
          this.$refs.slider.refresh();
          this.$refs.scroll.refresh();
          this.imgLoad = true;
        }
      },
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider;
          }
        })
      },
      _getDissList() {
        getDissList().then((res) => {
          if (res.code === ERR_OK) {
            this.dissList = res.data.list;
          }
        })
      }
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var.less');

  .recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    .recommend-content {
      height: 100%;
      overflow: hidden;
      .slider-warpper {
        position: relative;
        width: 100%;
        overflow: hidden;
      }
      .recommend-list {
        .title {
          height: 65px;
          line-height: 65px;
          text-align: center;
          font-size: @font-size-medium;
          color: @color-theme;
        }
        .item {
          display: flex;
          align-items: center;
          padding: 0 20px 20px 20px;
          .icon {
            flex: 0 0 80px;
            width: 80px;
            height: 60px;
            padding-right: 20px;
            img {
              width: 100%
            }
          }
          .text {
            flex: 1;
            line-height: 20px;
            font-size: @font-size-medium;
            .name {
              margin-bottom: 10px;
              color: @color-text;
            }
            .desc {
              color: @color-text-d;
            }
          }
        }
      }
    }
    .loading-wrapper{
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%)
    }
  }
</style>
