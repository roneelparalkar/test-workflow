<template>
  <div class="social-share social" :data-img="dataImg" :data-desc="dataDesc" :data-url="dataUrl" :data-title="dataTitle">
    <span class="share-icon"></span>
    <div class="social-share-wrap">
      <div class="social-wrap">
        <span class="share-label">Share</span>
        <div class="social-items">
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

        <span class="close">Close</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dataImg: String,
    dataTitle: String,
    dataUrl: String,
    dataDesc:String
  },
};
</script>
