<template>
  <div class="site-login signInIcon">
    <span class="login userName">Sign In</span>
    <div class="icon-user proImage" :data-default-img="getDefaultImg">
      <img :src="getDefaultImg" id="profileImage" importance="low" alt="" />
    </div>
    <div class="user-action" id="user-action">
      <ul class="action-option">
        <li class="option username"><span class="userNameMob"></span></li>
        <a :href="getProfileLink" class="option profile" id="myProfile"><span>My Adda</span></a>
        <li class="option logout" id="logout"><span class="load">Logout</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    widgetData: Object,
    configData: Object
  },
  computed: {
    getSingInLink() {
      return this.widgetData.applicationDomain + "login";
    },
    getProfileLink() {
      return this.widgetData.applicationDomain + "profile";
    },
    getDefaultImg() {
      if (this.configData.content.defaultProfileImage) {
        return this.configData.content.defaultProfileImage + "?v=" + this.configData.content.playerImg;
      } else {
        return "";
      }
    }
  }
};
</script>
