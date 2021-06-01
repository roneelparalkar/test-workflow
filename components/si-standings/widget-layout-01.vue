<template>
  <div
    @click.stop="closeStandingsDD()"
    v-if="!widgetData.err"
    class="waf-component widget-layout-01"
    :class="[widgetData.dataToPass.extraClass, widgetData.groups.length > 1 ? 'si-waf-widget' : '']"
    :server-data="widgetData.dataToPassString"
    widget-id="si-standings-widget-layout-01"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <component class="title" v-if="widgetData.dataToPass.showWidgetTitle" :is="widgetData.dataToPass.widgetTitleTag">{{
            widgetData.dataToPass.displayTitle
          }}</component>
          <div @click.stop="toggleGroupDD()" class="dropdown-wrap filter-container" :class="[widgetData.showGroups ? 'active' : '']">
            <div v-if="widgetData.groups.length > 1" class="waf-select-box">
              <span class="selected-title">{{ widgetData.groups[widgetData.selectedGroupIndex].groupName }}</span>
              <div class="select-box-wrap">
                <span @click.stop="toggleGroupDD()" class="dropdown-close">Close</span>
                <div @click.stop="groupSelection(i, group)" v-for="(group, i) in widgetData.groups" :key="i" class="select-list">
                  <button class="list-item">{{ group.groupName }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="waf-body">
        <div class="table-wrap">
          <div class="table-responsive">
            <div class="table standings-table">
              <div class="table-head">
                <div class="table-row">
                  <div class="table-data number">
                    <span>#</span>
                  </div>
                  <div class="table-data team-name">
                    <span>Team</span>
                  </div>
                  <div class="table-data played-matches">
                    <span>M</span>
                  </div>
                  <div class="table-data matches-won">
                    <span>W</span>
                  </div>
                  <div class="table-data matches-lost">
                    <span>L</span>
                  </div>
                  <div class="table-data matches-tied">
                    <span v-if="widgetData.dataToPass.selectedSport === 2">D</span>
                    <span v-else>Tied</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 2" class="table-data matches-tied">
                    <span>GF</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 2" class="table-data matches-tied">
                    <span>GA</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 2" class="table-data matches-tied">
                    <span>GD</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 3" class="table-data matches-tied">
                    <span>Score Difference</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 1" class="table-data no-result">
                    <span>N/R</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 1" class="table-data run-rate">
                    <span>NRR</span>
                  </div>
                  <div class="table-data total-points">
                    <span>Pts</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 1" class="table-data team-form">
                    <span>Last5</span>
                  </div>
                </div>
              </div>
              <div class="table-body">
                <div class="table-row" :key="i" v-for="(team, i) in widgetData.groups[widgetData.selectedGroupIndex].teams">
                  <div class="table-data number">
                    <span>{{ team.position || team.pos }}</span>
                  </div>
                  <div class="table-data team-name">
                    <div class="team-wrap">
                      <div class="team-logo">
                        <img :src="getTeamFlag(team.id || team.team_id)" alt="" class="lazy" importance="low" />
                      </div>
                      <div class="team-name">
                        <div class="full-name">
                          {{ getTeamCustomName(team) }}
                          <span v-if="team.is_qualified === true || team.is_qualified === 'true'" class="qualify">(Q)</span>
                        </div>
                        <div class="short-name">
                          {{ getTeamShortCustomName(team) }}
                          <span v-if="team.is_qualified === true || team.is_qualified === 'true'" class="qualify">(Q)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="table-data played-matches">
                    <span>{{ team.played || team.p }}</span>
                  </div>
                  <div class="table-data matches-won">
                    <span>{{ team.wins || team.w }}</span>
                  </div>
                  <div class="table-data matches-lost">
                    <span>{{ team.lost || team.l }}</span>
                  </div>
                  <div class="table-data matches-tied">
                    <span>{{ team.tied || team.t }}</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 2" class="table-data matches-tied">
                    <span>{{ team.gf }}</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 2" class="table-data matches-tied">
                    <span>{{ team.ga }}</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 2 || widgetData.dataToPass.selectedSport === 3" class="table-data matches-tied">
                    <span>{{ team.score_diff }}</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 1" class="table-data no-result">
                    <span>{{ team.noresult || team.nr }}</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 1" class="table-data run-rate">
                    <span v-if="team.nrr">{{ team.nrr }}</span>
                  </div>
                  <div class="table-data total-points">
                    <span>{{ team.points_scored || team.pts }}</span>
                  </div>
                  <div v-if="widgetData.dataToPass.selectedSport === 1 && team.matches && team.matches.length" class="table-data team-form">
                    <div class="form-status">
                      <span
                        v-for="(formData, j) in team.matches"
                        :key="j"
                        :class="[
                          team.id === formData.winner_id ? 'won' : formData.winner_id === formData.vs_id ? 'lost' : formData.winner_id ? 'tied' : '',
                          formData.outcome ? 'status' : ''
                        ]"
                      ></span>
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
import { getTeamFlag, getTeamCustomName } from "./../../sdk/WidgetLibrary/utils";
export default {
  props: {
    widgetData: Object,
    winstonLogger: Object,
    imagePaths: Object
  },
  data: function() {
    return {
      isLoader: false,
      currentGroup: ""
    };
  },
  methods: {
    groupSelection: function(i, groupData) {
      this.widgetData.selectedGroupIndex = i;
      this.widgetData.showGroups = false;
    },
    getTeamFlag: function(teamId, size) {
      return getTeamFlag(this.winstonLogger, this.imagePaths, false, this.widgetData.dataToPass.selectedSport, teamId);
    },
    toggleGroupDD: function() {
      this.widgetData.showGroups = !this.widgetData.showGroups;
    },
    closeStandingsDD: function() {
      this.widgetData.showGroups = false;
      this.widgetData.showLeagues = false;
    },
    getTeamCustomName: function(team) {
      return (
        getTeamCustomName({
          winstonLogger: this.winstonLogger,
          id: team.id || team.team_id,
          customNames: this.widgetData.customNames,
          sportName: this.widgetData.dataToPass.selectedSportName,
          type: "full"
        }) ||
        team.team_name ||
        team.name
      );
    },
    getTeamShortCustomName: function(team) {
      return (
        getTeamCustomName({
          winstonLogger: this.winstonLogger,
          id: team.id || team.team_id,
          customNames: this.widgetData.customNames,
          sportName: this.widgetData.dataToPass.selectedSportName,
          type: "short"
        }) ||
        team.team_short_name ||
        team.short_name
      );
    }
  }
};
</script>
