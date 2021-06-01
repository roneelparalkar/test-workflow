<template>
  <div
    v-if="!widgetData.err"
    :class="widgetData.serverData.extraClass"
    class="waf-component widget-layout-01 si-waf-widget"
    widget-id="si-statsdetail-widget-layout-01"
    :server-data="widgetData.serverDataString"
    :is-mobile="widgetData.isMobile"
    :selected-stats-type="widgetData.selectedStatType"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <component class="title" :is="widgetData.serverData.widgetTitleTag" v-if="widgetData.serverData.showWidgetTitle">{{
            widgetData.serverData.displayTitle
          }}</component>
        </div>
      </div>
      <div class="waf-body">
        <div class="statistic-container">
          <div class="statistic-wrapper">
            <div v-if="widgetData.isMobile" class="left-side">
              <div class="stats-list">
                <h5 @click.stop="selectStatsType('batting')" :class="[widgetData.selectedStatType === 'batting' ? 'active' : '']" class="stats-head">
                  Batting Stats
                </h5>
                <h5 @click.stop="selectStatsType('bowling')" :class="[widgetData.selectedStatType === 'bowling' ? 'active' : '']" class="stats-head">
                  Bowling Stats
                </h5>
              </div>
              <div @click.stop="toggleBatBowlStatsDD()" class="select-list" :class="[widgetData.showBatBowlStatsDD ? 'active' : '']">
                <span v-if="widgetData.serverData.selectedStatId === '2'" class="list-item">Most Runs</span>
                <span v-if="widgetData.serverData.selectedStatId === '1'" class="list-item">Highest Individual Score</span>
                <span v-if="widgetData.serverData.selectedStatId === '3'" class="list-item">Highest Average</span>
                <span v-if="widgetData.serverData.selectedStatId === '4'" class="list-item">Highest Strike Rate</span>
                <span v-if="widgetData.serverData.selectedStatId === '6'" class="list-item">Most Hundreds</span>
                <span v-if="widgetData.serverData.selectedStatId === '5'" class="list-item">Most Fifties</span>
                <span v-if="widgetData.serverData.selectedStatId === '7'" class="list-item">Most Fours</span>
                <span v-if="widgetData.serverData.selectedStatId === '8'" class="list-item">Most Sixes</span>
                <span v-if="widgetData.serverData.selectedStatId === '13'" class="list-item">Most Wickets</span>
                <span v-if="widgetData.serverData.selectedStatId === '12'" class="list-item">Best Bowling Figures</span>
                <span v-if="widgetData.serverData.selectedStatId === '17'" class="list-item">Most Five Wicket Hauls</span>
                <span v-if="widgetData.serverData.selectedStatId === '16'" class="list-item">Best Economy</span>
                <div v-if="widgetData.selectedStatType === 'batting'" class="select-box-wrap">
                  <button @click.stop="updateStats('2', widgetData.selectedStatType)" class="list-item">Most Runs</button>
                  <button @click.stop="updateStats('1', widgetData.selectedStatType)" class="list-item">Highest Individual Score</button>
                  <button @click.stop="updateStats('3', widgetData.selectedStatType)" class="list-item">Highest Average</button>
                  <button @click.stop="updateStats('4', widgetData.selectedStatType)" class="list-item">Highest Strike Rate</button>
                  <button @click.stop="updateStats('6', widgetData.selectedStatType)" class="list-item">Most Hundreds</button>
                  <button @click.stop="updateStats('5', widgetData.selectedStatType)" class="list-item">Most Fifties</button>
                  <button @click.stop="updateStats('7', widgetData.selectedStatType)" class="list-item">Most Fours</button>
                  <button @click.stop="updateStats('8', widgetData.selectedStatType)" class="list-item">Most Sixes</button>
                </div>

                <div v-else class="select-box-wrap">
                  <button @click.stop="updateStats('13', widgetData.selectedStatType)" class="list-item">Most Wickets</button>
                  <button @click.stop="updateStats('15', widgetData.selectedStatType)" class="list-item">Best Bowling Average</button>
                  <button @click.stop="updateStats('12', widgetData.selectedStatType)" class="list-item">Best Bowling Figures</button>
                  <button @click.stop="updateStats('17', widgetData.selectedStatType)" class="list-item">Most Five Wicket Hauls</button>
                  <button @click.stop="updateStats('16', widgetData.selectedStatType)" class="list-item">Best Economy</button>
                </div>
              </div>
            </div>
            <div v-else class="left-side">
              <div class="stats-list">
                <div class="stats-item">
                  <h5 class="stats-head">Batting Stats</h5>
                  <div class="stats-content">
                    <span
                      @click="updateStats('2', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '2' ? 'active' : '']"
                      class="stats-name"
                      >Most Runs</span
                    >
                    <span
                      @click="updateStats('1', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '1' ? 'active' : '']"
                      class="stats-name"
                      >Highest Individual Score</span
                    >
                    <span
                      @click="updateStats('3', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '3' ? 'active' : '']"
                      class="stats-name"
                      >Highest Average</span
                    >
                    <span
                      @click="updateStats('4', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '4' ? 'active' : '']"
                      class="stats-name"
                      >Highest Strike Rate</span
                    >
                    <span
                      @click="updateStats('6', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '6' ? 'active' : '']"
                      class="stats-name"
                      >Most Hundreds</span
                    >
                    <span
                      @click="updateStats('5', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '5' ? 'active' : '']"
                      class="stats-name"
                      >Most Fifties</span
                    >
                    <span
                      @click="updateStats('7', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '7' ? 'active' : '']"
                      class="stats-name"
                      >Most Fours</span
                    >
                    <span
                      @click="updateStats('8', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '8' ? 'active' : '']"
                      class="stats-name"
                      >Most Sixes</span
                    >
                  </div>
                </div>
                <div class="stats-item">
                  <h5 class="stats-head">Bowling Stats</h5>
                  <div class="stats-content">
                    <span
                      @click="updateStats('13', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '13' ? 'active' : '']"
                      class="stats-name"
                      >Most Wickets</span
                    >
                    <span
                      @click="updateStats('15', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '15' ? 'active' : '']"
                      class="stats-name"
                      >Best Bowling Average</span
                    >
                    <span
                      @click="updateStats('12', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '12' ? 'active' : '']"
                      class="stats-name"
                      >Best Bowling Figures</span
                    >
                    <span
                      @click="updateStats('17', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '17' ? 'active' : '']"
                      class="stats-name"
                      >Most Five Wicket Hauls</span
                    >
                    <span
                      @click="updateStats('16', widgetData.selectedStatType)"
                      :class="[widgetData.serverData.selectedStatId === '16' ? 'active' : '']"
                      class="stats-name"
                      >Best Economy</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="right-side">
              <div class="table-wrap">
                <div class="table-responsive">
                  <div class="table standings-table">
                    <div class="left-side">
                      <div class="table-row table-head">
                        <div class="table-data rank">
                          <span>#</span>
                        </div>
                        <div class="table-data player-name">
                          <span>Player</span>
                        </div>
                      </div>
                      <div v-for="(player, index) in widgetData.playersData" :key="index" class="table-row">
                        <div class="table-data rank">
                          <span>{{ index + 1 }}</span>
                        </div>
                        <div class="table-data player-name">
                          <div class="player-wrap">
                            <div class="logo">
                              <img :src="getTeamFlag(0)" :data-src="getTeamFlag(player.teamId)" class="lazy" alt="" importance="low" />
                            </div>
                            <div class="player-name">
                              <span class="fname">{{ getName(player.name, "first") }}</span>
                              <span class="lname">{{ getName(player.name, "last") }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="right-side">
                      <div class="table-row table-head">
                        <div
                          v-for="(header, index) in widgetData.configHeaders.attributes"
                          :class="[header.highlight ? 'highlight' : '', header.nodeName === 'runs_scored' ? 'player-runs' : '']"
                          :key="index"
                          class="table-data"
                        >
                          <span>{{ header.displayName }}</span>
                        </div>
                      </div>
                      <div v-for="(player, j) in widgetData.playersData" :key="j" class="table-row">
                        <div
                          v-for="(header, index) in widgetData.configHeaders.attributes"
                          :key="index"
                          :class="[header.highlight ? 'highlight' : '', header.nodeName === 'runs_scored' ? 'player-runs' : '']"
                          class="table-data innings-played"
                        >
                          <span v-if="header.nodeName === 'vs_team_name'">{{ getTeamCustomName(player) }}</span>
                          <span v-else>{{ player[header.nodeName] }}</span>
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
  methods: {
    getName(name, type) {
      if (type === "first") {
        return name.split(" ")[0];
      } else {
        return name
          .split(" ")
          .slice(1)
          .join(" ");
      }
    },
    getTeamFlag: function(teamId) {
      return getTeamFlag(this.winstonLogger, this.imagePaths, false, 1, teamId);
    },
    getTeamCustomName: function(playerInfo) {
      return (
        getTeamCustomName({
          winstonLogger: this.winstonLogger,
          id: playerInfo.teamId,
          customNames: this.widgetData.customNames,
          sportName: "cricket",
          type: "full"
        }) || playerInfo.teamName
      );
    },
    selectStatsType: function(statType) {
      this.widgetData.selectedStatType = statType;
      if (statType === "batting") {
        this.updateStats("2", statType);
      } else {
        this.updateStats("13", statType);
      }
    },
    toggleBatBowlStatsDD: function() {
      this.widgetData.showBatBowlStatsDD = !this.widgetData.showBatBowlStatsDD;
    }
    // getTeamShortCustomName: function(playerInfo) {
    //   return (
    //     getTeamCustomName({
    //       winstonLogger: this.winstonLogger,
    //       id: playerInfo.teamId,
    //       customNames: this.widgetData.customNames,
    //       sportName: "cricket",
    //       type: "short"
    //     }) || playerInfo.teamShortName
    //   );
    // }
  }
};
</script>
