<template>
  <div v-if="!widgetData.err">
    <div class="navigation-wrap">
      <div class="site-logo">
        <a :href="widgetData.applicationDomain + widgetData.applicationDomain" class="logo">
          <span>{{ widgetData.displayTitle }}</span>
        </a>
      </div>
      <nav class="site-nav">
        <SearchBox />

        <MenuListing :widget-data="widgetData" />
        <si-menu-saw01-widget-layout-04 />
        <div class="nav-bottom">
          <div class="web-mode">
            <span class="mode">Dark/Light Mode</span>
          </div>
          <div class="close-menu">close</div>
        </div>
      </nav>
      <SignIn :widget-data="widgetData" :config-data="configData" />
    </div>
  </div>
</template>

<script>
import MenuListing from "~/components/common/MenuListing";
import SearchBox from "~/components/common/SearchBox";
import SignIn from "~/components/common/SignIn";

export default {
  props: {
    widgetData: Object,
    configData: Object,
  },
  components: {
    MenuListing,
    SearchBox,
    SignIn,
  },
};
</script>
