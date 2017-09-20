<template>
  <div class="singer-wrapper">
    <viewlist :data="singerList" @select="goSingerDetail"></viewlist>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapMutations} from 'vuex'
  import {getSinger} from 'api/singer'
  import {ERR_OK} from 'api/config.js'
  import Singer from 'common/js/singer'
  import Viewlist from 'base/viewlist/viewlist'

  const HOT_TITLE = '热门';
  const HOT_LENGHT = 10;

  export default {
    data() {
      return {
        singerList: []
      }
    },
    methods: {
      goSingerDetail(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        this.setSinger(singer)
      },
      sortSingerList(data) {
        let hot = {
          title: HOT_TITLE,
          items: []
        };
        let map = {};
        data.forEach((item, index) => {
          // 头10条当作热门歌手数据
          if (index < HOT_LENGHT) {
            hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }));
          }

          // 添加所有歌手数据
          let key = item.Findex;
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            };
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })

        // 把map转化为数组, 去除数字开通的歌手
        let songerList = [];
        for (let key in map) {
          if (/[a-zA-Z]/.test(map[key].title)) {
            songerList.push(map[key]);
          }
        }

        // 按升序排序
        songerList.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })

        songerList.unshift(hot);

        return songerList;
      },
      _initSingerList() {
        getSinger().then((res) => {
          if (res.code === ERR_OK) {
            this.singerList = this.sortSingerList(res.data.list);
          }
        })
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    created () {
      this._initSingerList();
    },
    components: {
      Viewlist
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  .singer-wrapper {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
  }
</style>
