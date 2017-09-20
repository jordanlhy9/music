<template>
  <transition name="silde">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'

  export default {
    created() {
      this._getDetail();
    },
    data() {
      return {
        songs: []
      }
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            res.data.list.forEach((item) => {
              let {musicData} = item;
              if (musicData.songid && musicData.albummid) {
                this.songs.push(createSong(musicData));
              }
            })
          }
        })
      }
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    components: {
      MusicList
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import url('../../common/less/_var.less');

  .silde-enter-active, .silde-leave-active {
    transition: all .3s;
  }

  .silde-enter, .silde-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
