<template>
  <div v-if="!widgetData.err" class="waf-component widget-layout-01" :class="widgetData.extraClass">
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <component class="title" :is="widgetData.widgetTitleTag" v-if="widgetData.showWidgetTitle">{{ widgetData.displayTitle }}</component>
          <a :href="getStatsLink" class="more-btn"> view more </a>
        </div>
      </div>
      <div class="waf-body">
        <div class="card-list">
          <div class="card-item" :key="'stat' + index" v-for="(stat, index) in getData">
            <div class="card-wrap">
              <div class="card-head">
                <h3 class="title">{{ stat.display_name }}</h3>
              </div>
              <div class="card-content">
                <div class="team-list">
                  <div class="team-item" :class="ind === 0 ? 'featured' : ''" :key="'team' + ind" v-for="(leaderboard, ind) in getLeaderboard(stat)">
                    <div class="item-wrap">
                      <span class="rank">{{ ind + 1 }}</span>
                      <div class="logo">
                        <img :src="getTeamFlag(0)" alt="" importance="low" class="lazy" :data-src="getTeamFlag(leaderboard.team_id)" />
                      </div>
                      <div class="name">
                        <span class="fname">{{ getName(leaderboard.player_name, "first") }}</span>
                        <span class="lname">{{ getName(leaderboard.player_name, "last") }}</span>
                      </div>
                      <div class="total-points">
                        <span class="points">{{ leaderboard.data_value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTeamFlag } from "./../../sdk/WidgetLibrary/utils";
import Pagination from "~/components/common/Pagination";
export default {
  props: {
    widgetData: Object,
    winstonLogger: Object,
    imagePaths: Object
  },
  components: {
    Pagination
  },
  computed: {
    getData() {
      return this.widgetData.stats;
    },
    getStatsLink() {
      return this.widgetData.applicationDomain + this.$route.path + "/stats";
    }
  },
  methods: {
    getLeaderboard(stats) {
      return stats.leaderboard.length <= 5 ? stats.leaderboard : stats.leaderboard.slice(0, 5);
    },
    getTeamFlag: function(teamId) {
      return getTeamFlag(this.winstonLogger, this.imagePaths, false, 1, teamId);
    },
    getName(name, type) {
      if (type === "first") {
        return name.split(" ")[0];
      } else {
        return name
          .split(" ")
          .slice(1)
          .join(" ");
      }
    }
  }
};
</script>

<style></style>
