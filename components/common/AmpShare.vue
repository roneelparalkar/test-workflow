<template>
  <div class="social-share social">
    <span class="share-icon"></span>
    <div class="social-wrap">
      <!-- data-param-app_id: required, defaults to: none. This parameter is the Facebook app_id that's required for the Facebook Share dialog. -->
      <!-- data-param-href: optional, defaults to: rel=canonical URL -->
      <!-- data-param-quote: optional. Can be used to share a quote or text. -->
      <amp-social-share
        type="facebook"
        :data-param-quote="dataTitle"
        :data-param-app_id="fbAppId"
        :data-param-href="dataUrl"
        aria-label="Share on Facebook"
        width="30"
        height="30"
      >
      </amp-social-share>

      <!-- data-param-url: optional, defaults to: rel=canonical URL -->
      <!-- data-param-text: optional, defaults to: Current page title -->
      <amp-social-share
        type="twitter"
        aria-label="Share on Twitter"
        :data-param-url="dataUrl"
        width="30"
        height="30"
        :data-param-text="dataTitle"
      ></amp-social-share>

      <!-- data-param-text: optional, defaults to: "Current page title - current page URL -->
      <amp-social-share 
      :data-param-text="dataTitle" 
      width="30" 
      height="30"
      type="whatsapp" 
      aria-label="Share on WhatsApp">
      </amp-social-share>

      <!-- data-param-subject: optional, defaults to: Current page title -->
      <amp-social-share
        :data-param-subject="dataTitle"
        width="30"
        height="30"
        type="email"
        aria-label="Share on Email"
        :data-param-body="dataUrl"
      >
      </amp-social-share>
      <amp-social-share
        type="system"
        :data-param-text="dataTitle"
        data-mode="replace"
        aria-label="Share on Email"
        data-param-subject=""
        width="30"
        height="30"
      >
      </amp-social-share>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dataTitle: String,
    dataUrl: String,
    fbAppId: String,
  },
};
</script>
