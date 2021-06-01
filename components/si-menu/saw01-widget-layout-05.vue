<template>
  <div v-if="!widgetData.err" class="second-head">
    <div class="head-wrap">
      <div class="secondary-logo">
        <div class="logo-wrap">
          <img src="" class="logo" alt="" />
          <span class="logo-name">{{ widgetData.menuTitle }}</span>
        </div>
      </div>
      <nav class="secondary-navigation">
        <MenuListing :widget-data="widgetData" />
      </nav>
    </div>
  </div>
</template>

<script>
import MenuListing from "~/components/common/MenuListing";

export default {
  props: {
    widgetData: Object
  },
  components: {
    MenuListing
  }
};
</script>
