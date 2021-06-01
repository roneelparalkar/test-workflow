<template>
  <div><div v-if="widgetData" :class="widgetData.extraClass" v-html="widgetData.adCode"></div></div>
</template>
<script>
export default {
  props: {
    widgetData: Object,
    winstonLogger: Object
  }
};
</script>
