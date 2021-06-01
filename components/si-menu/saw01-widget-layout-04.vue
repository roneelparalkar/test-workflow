<template>
  <div class="social social-share">
    <a href="https://www.facebook.com/SportsAddaOfficial/" class="facebook" target="_blank">
      <span>Follow us on Facebook</span>
    </a>
    <a href="https://twitter.com/sportsadda_" class="twitter" target="_blank">
      <span>Follow us on Twitter</span>
    </a>
    <a href="https://www.instagram.com/sportsaddaofficial/" class="instagram" target="_blank">
      <span>Follow us on Instagram</span>
    </a>
    <a href="https://www.youtube.com/channel/UCqJPjpJcnjJpGJDx5NOddQw" class="youtube" target="_blank">
      <span>Follow us on YouTube</span>
    </a>
    <a href="https://itunes.apple.com/us/app/stumped/id1465629990?mt=8" class="ios" target="_blank">
      <span>Download App iOS</span>
    </a>
    <a href="https://play.google.com/store/apps/details?id=com.stumped.app" class="android" target="_blank">
      <span>Download App Android</span>
    </a>
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
