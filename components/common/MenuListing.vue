<template>
  <ul :class="[dontShowNavClass ? '' : 'navigation-links']" v-if="widgetData && widgetData.menuList">
    <li
      :class="['link-' + getClass(menu), menu.sub_menu ? 'submenu' : '', widgetData.currentPageId === menu.page_id ? 'active' : '']"
      v-for="(menu, i) in widgetData.menuList"
      :key="i"
      class="nav-link"
    >
      <span v-if="menu.sub_menu" :class="[getClass(menu)]">{{ menu.title }}</span>
      <ul v-if="menu.sub_menu" class="sub-ul">
        <li
          :class="['link-' + getClass(subMenu), subMenu.sub_menu ? 'sub-submenu' : '', widgetData.currentPageId === subMenu.page_id ? 'active' : '']"
          v-for="(subMenu, j) in menu.sub_menu"
          :key="j"
        >
          <span v-if="subMenu.sub_menu" :class="getClass(subMenu)">{{ subMenu.title }}</span>
          <ul v-if="subMenu.sub_menu" class="sub-ul">
            <li :class="['link-' + getClass(sub2Menu)]" v-for="(sub2Menu, k) in subMenu.sub_menu" :key="k">
              <button
                v-if="isFunction(sub2Menu)"
                :onclick="sub2Menu.function_info"
                :class="[getClass(sub2Menu), widgetData.currentPageId === sub2Menu.page_id ? 'active' : '']"
              >
                <span>{{ sub2Menu.title }}</span>
              </button>
              <a
                v-if="!isFunction(sub2Menu)"
                :href="getLink(sub2Menu)"
                :target="getTargetValue(sub2Menu)"
                :class="[getClass(sub2Menu), widgetData.currentPageId === sub2Menu.page_id ? 'active' : '']"
              >
                <span>{{ sub2Menu.title }}</span>
              </a>
            </li>
          </ul>
          <button v-if="!subMenu.sub_menu && isFunction(subMenu)" :onclick="subMenu.function_info" :class="getClass(subMenu)">
            <span>{{ subMenu.title }}</span>
          </button>
          <a v-if="!subMenu.sub_menu && !isFunction(subMenu)" :href="getLink(subMenu)" :target="getTargetValue(subMenu)" :class="getClass(subMenu)">
            <span>{{ subMenu.title }}</span>
          </a>
        </li>
      </ul>
      <button v-if="!menu.sub_menu && isFunction(menu)" :onclick="menu.function_info" :class="[getClass(menu)]">
        <span>{{ menu.title }}</span>
      </button>
      <a v-if="!menu.sub_menu && !isFunction(menu)" :href="getLink(menu)" :target="getTargetValue(menu)" :class="[getClass(menu)]">
        <span>{{ menu.title }}</span>
      </a>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    widgetData: Object,
    dontShowNavClass: Boolean
  },
  methods: {
    getClass: menuInfo => {
      return menuInfo.meta_info.link_class;
    },
    getTargetValue: menuInfo => {
      if (menuInfo.meta_info.link_type === 3) {
        return "_blank";
      }
      // if (menuInfo.is_opennewtab) return "_blank";
      return "";
    },
    getLink: function(menuInfo) {
      if (menuInfo.meta_info.link_type === 0) {
        return menuInfo.alias ? this.widgetData.applicationDomain + menuInfo.alias : this.widgetData.applicationDomain;
      } else if (menuInfo.meta_info.link_type === 1) {
        return "JavaScript:void(0);";
      } else if (menuInfo.meta_info.link_type === 3) {
        return this.widgetData.applicationDomain + menuInfo.external_url;
      }
      return "";
    },
    isFunction: menuInfo => {
      if (menuInfo.meta_info.link_type === 2) {
        return true;
      }
      // if (menuInfo.function_info && menuInfo.function_info !== "0") {
      //   return true;
      // }
      return false;
    }
  }
};
</script>
