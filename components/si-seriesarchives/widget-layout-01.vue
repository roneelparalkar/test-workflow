<template>
  <div
    @click.stop="closeAllDD()"
    class="waf-component waf-serieslisting widget-layout-01 si-waf-widget"
    widget-id="si-series-archive-widget-layout-01"
    :server-data="widgetData.serverData"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <component :is="widgetData.titleTag" class="title">{{ widgetData.displayTitle }}</component>
          <div @click.stop="showYears()" class="dropdown-wrap filter-container" :class="[widgetData.showYearsDD ? 'active' : '']">
            <div class="waf-select-box">
              <span class="selected-title">{{ widgetData.selectedYear }}</span>
              <div class="select-box-wrap">
                <span @click.stop="closeDD()" class="dropdown-close">Close</span>
                <div class="select-list">
                  <button @click.stop="selectYear(year)" class="list-item" v-for="(year, i) in widgetData.years" :key="i">{{ year }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="waf-body">
        <div class="series-container">
          <div class="series-content" v-for="(monthYearData, i) in widgetData.monthYearWiseDataTours" :key="i">
            <div class="list-date">
              <span class="month">{{ monthYearData.monthName }}</span>
              <span class="year">{{ monthYearData.year }}</span>
            </div>
            <div class="series-listing">
              <div v-for="(tour, i) in monthYearData.tours" :key="i" class="series-item">
                <div class="series-date">
                  <span class="date">{{ getTourStartEndDate(tour) }}</span>
                  <span class="total-matches">{{ getSeriesData(tour) }}</span>
                </div>
                <a :href="getTourLink(tour)" class="series-name">
                  <span class="name">{{ tour.tour_name }}</span>
                </a>
              </div>
            </div>
          </div>
          <section id="" data-component="si-ads" data-template="widget-layout-01">
            <div class="waf-ad waf-ad-leader">
              <span class="waf-ad-text"></span>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDateTime } from "./../../sdk/WidgetLibrary/utils";

export default {
  props: {
    widgetData: Object
  },
  methods: {
    getSeriesData: tourData => {
      let seriesFormatString = "{{TEST}}, {{ODI}}, {{T20}}";
      tourData.series.forEach(seriesInfo => {
        if (seriesInfo.comptype_name === "test") {
          seriesFormatString = seriesFormatString.replace("{{TEST}}", `Tests(${seriesInfo.total_matches})`);
        } else if (seriesInfo.comptype_name === "odi") {
          seriesFormatString = seriesFormatString.replace("{{ODI}}", `ODIs(${seriesInfo.total_matches})`);
        } else if (seriesInfo.comptype_name === "t20") {
          seriesFormatString = seriesFormatString.replace("{{T20}}", `T20Is(${seriesInfo.total_matches})`);
        }
      });
      return seriesFormatString
        .replace("{{TEST}},", "")
        .replace(", {{ODI}}", "")
        .replace(", {{T20}}", "")
        .replace("{{ODI}},", "")
        .replace("{{T20}}", "");
      return "Tests (4), ODIs (3), T20Is (5)";
    },
    getTourStartEndDate: tourData => {
      return getDateTime(tourData.tour_start, "mmm dd") + "-" + getDateTime(tourData.tour_end, "mmm dd");
    },
    getTourLink: function(tourData) {
      let tourLink =
        this.widgetData.applicationDomain +
        "/cricket/series/" +
        tourData.tour_name
          // .replace(/ /g, "-")
          // .replace(/,/g, "")
          // .replace(/'/g, "")
          // .replace(/\//g, "-")
          .replace(/[^a-zA-Z0-9]/g, "-")
          .replace(/--/g, "-")
          .toLowerCase() +
        "-" +
        tourData.tour_id +
        "/scores-fixtures";
      return tourLink;
    },
    closeAllDD: function() {
      this.widgetData.showYearsDD = false;
    },
    showYears: function() {
      this.widgetData.showYearsDD = !this.widgetData.showYearsDD;
    },
    selectYear: function(year) {
      this.widgetData.showYearsDD = false;
      this.getNewYearSeriesData(year);
    },
    closeDD: function() {
      this.widgetData.showYearsDD = false;
    }
  }
};
</script>
