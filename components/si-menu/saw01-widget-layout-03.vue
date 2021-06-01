<template>
  <div class="waf-top-bar">
    <div class="waf-trending-article">
      <MenuListing :widget-data="widgetData" :dont-show-nav-class="true" />
    </div>
    <div class="waf-right-elements">
      <si-menu-saw01-widget-layout-04 />
      <SignIn :widget-data="widgetData" :config-data="configData" />
    </div>
  </div>
</template>

<script>
import MenuListing from "~/components/common/MenuListing";
import SignIn from "~/components/common/SignIn";

export default {
  props: {
    widgetData: Object,
    configData: Object
  },
  components: {
    MenuListing,
    SignIn
  }
};
</script>
