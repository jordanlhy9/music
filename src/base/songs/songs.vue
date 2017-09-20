<template>
  <div class="song-list">
    <ul>
      <li v-for="(song,index) in songs" class="item" @click="selectSong(song,index)">
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      songs: {
        type: Array,
        default: []
      }
    },
    computed: {},
    methods: {
      getDesc(song) {
        return `${song.singer}·${song.album}`
      },
      selectSong(song, index) {
        this.$emit('selectSong', song, index)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var.less');
  @import url('../../common/less/_fun.less');

  .song-list {
    .item {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 64px;
      font-size: @font-size-medium;
      .content {
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          .no-wrap();
          color: @color-text;
        }
        .desc {
          .no-wrap();
          margin-top: 4px;
          color: @color-text-d
        }
      }
    }
  }
</style>
