<template>
  <div class="progress-bar">
    <div class="bar-inner">
      <div class="progress"></div>
      <div class="progress-btn">
        <span class="btn"></span>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
    export default {
      props: {
        percent: {
          type: Number,
          default: 0
        }
      }
    }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var');

  .progress-bar{
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
    .bar-inner{
      position: absolute;
      width: 100%;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress{
        position: absolute;
        left: 0;
        top: 0;
      }
      .progress-btn{
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .btn{
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
