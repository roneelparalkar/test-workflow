<template>
  <div class="pagination-wrap" v-if="widgetData.pagination">
    <div class="pagination">
      <a :href="getPageRoute({ isFirst: true })" class="nav-first" :class="widgetData.paginationData.isFirstPage ? 'disabled' : ''">
        <span>First</span>
      </a>
      <a :href="getPageRoute({ isPrev: true })" class="nav-arrow nav-left" :class="widgetData.paginationData.isFirstPage ? 'disabled' : ''">
        <span>Previous</span>
      </a>
      <div class="pagination-number">
        <a
          :href="getPageRoute({ pageIndex: 1 })"
          v-if="widgetData.paginationData.showStarPaginationDots"
          :class="[widgetData.paginationData.currentPage === 1 ? 'active' : '']"
          >1</a
        >
        <span class="pagination-dots" v-if="widgetData.paginationData.showStarPaginationDots">...</span>
        <a
          :href="getPageRoute({ pageIndex: page })"
          v-for="page in widgetData.paginationData.pages"
          :key="page"
          :class="[widgetData.paginationData.currentPage === page ? 'active' : '']"
          >{{ page }}</a
        >
        <span class="pagination-dots" v-if="widgetData.paginationData.showEndPaginationDots">...</span>
        <a :href="getPageRoute({ pageIndex: widgetData.paginationData.totalPages })" v-if="widgetData.paginationData.showEndPaginationDots">{{
          widgetData.paginationData.totalPages
        }}</a>
      </div>
      <a :href="getPageRoute({ isNext: true })" class="nav-arrow nav-right" :class="widgetData.paginationData.isLastPage ? 'disabled' : ''">
        <span>Next</span>
      </a>
      <a :href="getPageRoute({ isLast: true })" class="nav-last" :class="widgetData.paginationData.isLastPage ? 'disabled' : ''">
        <span>Last</span>
      </a>
    </div>
  </div>
</template>

<script>
import { getPageRoute } from "./../../sdk/helpers/index";
export default {
  name: "Pagination",
  props: {
    widgetData: Object,
    winstonLogger:Object
  },
  methods: {
    getPageRoute: function(params) {
      return getPageRoute(this.winstonLogger, this.widgetData, params,this.$route);
    }
  }
};
</script>

<style></style>
