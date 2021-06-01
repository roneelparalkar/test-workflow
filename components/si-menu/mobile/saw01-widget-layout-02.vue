<template>
  <div v-if="!widgetData.err" class="mobile-menu">
    <MenuListing :widget-data="widgetData" />
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

<style></style>
