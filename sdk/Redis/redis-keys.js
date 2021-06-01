"use strict";
let nuxtConfigString = "nuxt_config:";
module.exports = {
  NAMESPACE: "saw01:",
  CMS_CONFIG: `${nuxtConfigString}client_config`,
  TRANSLATIONS: `${nuxtConfigString}translations`,
  CUSTOM_NAMES: `${nuxtConfigString}customNames`,
  WIDGET_CONFIG: `${nuxtConfigString}widgetConfig`,
  CSS_LINKS: "cssLinks:",
  CSS_LINK_EXTENSION: `beta:staticfiles=`,
  CSS_LINK_EXTENSION_DEV: `development:staticfiles=`
};
