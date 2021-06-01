<template>
  <div v-if="!widgetData.err">
    <div class="navigation-wrap">
      <div class="site-logo">
        <a :href="widgetData.applicationDomain" class="logo">
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
    winstonLogger: Object
  },
  head() {
    try {
      let itemListElement = [];
      let index = 1;
      for (let i = 0; i < this.widgetData.menuList.length; i++) {
        let menu = this.widgetData.menuList[i];

        if (menu.sub_menu) {
          for (let j = 0; j < menu.sub_menu.length; j++) {
            let obj = {
              "@type": "SiteNavigationElement",
              position: index,
              item: {
                name: menu.sub_menu[j].title,
                url: this.getLink(menu.sub_menu[j])
              }
            };

            index++;
            itemListElement.push(obj);
          }
        } else {
          let obj = {
            "@type": "SiteNavigationElement",
            position: index,
            item: {
              name: menu.title,
              url: this.getLink(menu)
            }
          };

          index++;
          itemListElement.push(obj);
        }
      }
      let headObj = {
        __dangerouslyDisableSanitizers: ["script"],
        script: [
          {
            innerHTML: `{
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": ${JSON.stringify(itemListElement)}
            }`,
            type: "application/ld+json"
          }
        ]
      };
      return headObj;
    } catch (e) {
      this.winstonLogger.error({ location: "si-menu-saw01", name: e.name, message: e.message });
      return {};
    }
  },
  components: {
    MenuListing,
    SearchBox,
    SignIn
  },
  methods: {
    getLink: function(menuInfo) {
      if (menuInfo.meta_info.link_type === 0) {
        return menuInfo.alias ? this.widgetData.applicationDomain + menuInfo.alias : this.widgetData.applicationDomain;
      } else if (menuInfo.meta_info.link_type === 3) {
        let re = new RegExp(/http(?:s)?:\/\//);
        return menuInfo.external_url.match(re) ? menuInfo.external_url : this.widgetData.applicationDomain + menuInfo.external_url;
      }
      return "";
    }
  }
};
</script>
