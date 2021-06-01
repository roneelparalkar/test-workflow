<template>
  <div class="amp-page-header">
    <div class="site-logo">
      <a :href="widgetData.applicationDomain" class="logo">
        <h1>{{ widgetData.displayTitle }}</h1>
      </a>
    </div>
    <div class="amp-menu amp-header-menu">
      <ul class="nav-navbar" v-if="widgetData.menuList">
        <li v-for="(menu, i) in widgetData.menuList" :key="i">
          <a :href="getLink(menu)"
            ><span>{{ menu.title }}</span></a
          >
        </li>
      </ul>
      <!-- <ul class="nav-navbar">
        <li>
          <a href="/news"><span>Cricket</span></a>
        </li>
        <li>
          <a href="/photos"><span>Football</span></a>
        </li>
        <li>
          <a href="/photos"><span>Kabaddi</span></a>
        </li>
      </ul> -->
    </div>
  </div>
</template>

<script>
import MenuListing from "~/components/common/MenuListing";
export default {
  props: {
    widgetData: Object,
    configData: Object,
    winstonLogger: Object,
    globalData:Object
  },
  components: {
    MenuListing
  },
  methods: {
    getLink: function(menuInfo) {
      if (menuInfo.meta_info.link_type === 0) {
        return menuInfo.alias ? this.widgetData.applicationDomain + menuInfo.alias : this.widgetData.applicationDomain;
      } else if (menuInfo.meta_info.link_type === 1) {
        return "JavaScript:void(0);";
      } else if (menuInfo.meta_info.link_type === 3) {
        return this.widgetData.applicationDomain + menuInfo.external_url;
      }
      return "";
    }
  }
};
</script>

<style></style>
