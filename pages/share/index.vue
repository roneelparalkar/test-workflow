<template>
  <div class="social-share social">
    <span class="share-icon"></span>
    <div class="social-share-wrap">
      <div class="social-wrap">
        <button type="button" class="social-icon icon-facebook">
          <span>Share on Facebook</span>
        </button>

        <button type="button" class="social-icon icon-twitter">
          <span>Share on Twitter</span>
        </button>

        <button type="button" class="social-icon icon-whatsapp">
          <span>Share on WhatsApp</span>
        </button>

        <button type="button" class="social-icon icon-email">
          <span>Share on Email</span>
        </button>

        <button type="button" class="social-icon icon-copylink">
          <span>Copy Link</span>
        </button>
      </div>
      <span class="close">Close </span>
    </div>
    <div :style="'height:1550px;width:1px;background:red'"></div>
    <img
      alt="bird"
      src="https://images.unsplash.com/photo-1470116073782-48ae2ccd8ffd?ixlib=rb-1.2.1&auto=format&fit=crop&w=100"
      data-src="https://images.unsplash.com/photo-1470116073782-48ae2ccd8ffd?ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=1600&amp;q=80"
      class=" lazyload"
    />
  </div>
</template>

<script>
export default {
  head() {
    return {
      meta: [
        { property: "og:type", content: "Website" },
        { property: "og:image", content: "https://www.sportsadda.com/static-assets/images/cssimages/logo.png?v=1.0" },
        { property: "og:title", content: "England Tour of India, 2021 Man of the Match Contest - SportsAdda" },
        { property: "og:site_name", content: "SportsAdda" },
        { property: "og:url", content: "https://www.sportsadda.com/games/man-of-the-match" },
        {
          property: "og:description",
          content:
            "Play our exclusive man of the match contest for England Tour of India, 2021 and compete with other players and stand a chance to win some amazing prizes only on SportsAdda."
        },
        { property: "og:updated_time", content: "2020-09-17T21:46:57.016116" }
      ],
      script: [
        {
          src: "/static-assets/build/js/main.js"
        }
      ]
    };
  }
};
</script>
