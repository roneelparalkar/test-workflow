<template>
  <div
    v-if="!widgetData.err"
    widget-id="si-scorestrip-widget-layout-01"
    :sport="widgetData.sport"
    :tournament="widgetData.tournament"
    :team="widgetData.team"
    :selectedLeague="widgetData.selectedLeague"
    :selectedLanguage="selectedLanguage"
    :linkable="widgetData.selectedSportInfo ? widgetData.selectedSportInfo.is_linkable : ''"
    :server-data="widgetData.serverData"
    class="waf-component widget-layout-01 si-waf-widget"
    :class="getMetadata.extraclass"
    @click="disablePopups()"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <component class="title" v-if="getMetadata.show_widget_title" :is="widgetData.widgetTitleTag">{{ widgetData.displayTitle }}</component>
          <a v-if="widgetData.selectedSportInfo.redirect_link" :href="widgetData.selectedSportInfo.redirect_link" class="more-btn"> view more </a>
          <div class="filter-container-wrap">
            <div
              @click.stop="openSportSelectionDropDown()"
              v-if="widgetData.sportsArray && widgetData.sportsArray.length"
              :class="widgetData.openSportDD ? 'active' : ''"
              class="dropdown-wrap filter-container"
            >
              <div class="waf-select-box">
                <span class="selected-title">{{ widgetData.selectedSportInfo.name }}</span>
                <div v-if="widgetData.selectedSportInfo.is_linkable" class="select-box-wrap">
                  <span @click.stop="openSportSelectionDropDown()" class="dropdown-close">Close</span>
                  <ul class="select-list" v-for="(sport, i) in widgetData.sportsArray" :key="i">
                    <li class="list-item">
                      <a :href="sport.redirect_link">{{ sport.name }}</a>
                    </li>
                  </ul>
                </div>
                <div v-else class="select-box-wrap">
                  <span @click.stop="openSportSelectionDropDown()" class="dropdown-close">Close</span>
                  <button @click.stop="sportSelection(sport)" class="list-item" v-for="(sport, i) in widgetData.sportsArray" :key="i">
                    {{ sport.name }}
                  </button>
                </div>
              </div>
            </div>
            <div
              @click.stop="leagueDDSelection()"
              :class="widgetData.openLeagueDD ? 'active' : ''"
              v-if="
                widgetData.hasLeagueFilter &&
                  widgetData.selectedSportInfo &&
                  widgetData.selectedSportInfo.leagues &&
                  widgetData.selectedSportInfo.leagues.length
              "
              class="dropdown-wrap filter-container"
            >
              <div class="waf-select-box">
                <span v-if="widgetData.selectedLeagueName" class="selected-title">{{ widgetData.selectedLeagueName }}</span>
                <div class="select-box-wrap">
                  <span @click.stop="leagueDDSelection()" class="dropdown-close">Close</span>
                  <button
                    @click.stop="leagueSelection(league)"
                    class="list-item"
                    v-for="(league, i) in widgetData.selectedSportInfo.leagues"
                    :key="i"
                  >
                    {{ league.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="waf-body">
        <div class="card-list" v-if="widgetData.isServer">
          <a class="card-item" v-for="i in 5" :key="i">
            <div class="card-wrap">
              <div class="card-header">
                <div class="head-wrap"><span class="title"></span> <span class="matchinfo"></span></div>
                <span class="status"></span>
              </div>
              <div class="card-content">
                <div class="team team-a">
                  <div class="team-info">
                    <img
                      data-src=""
                      src="https://stg-sportsadda.sportz.io/static-assets/images/cricket/teams/0.png?v=2.8"
                      alt=""
                      class="team-logo ls-is-cached lazyloaded"
                    />
                    <span class="team-name"></span>
                  </div>
                  <div class="team-score"><span class="score"></span></div>
                </div>
                <div class="team team-b">
                  <div class="team-info">
                    <img
                      data-src=""
                      src="https://stg-sportsadda.sportz.io/static-assets/images/cricket/teams/0.png?v=2.8"
                      alt=""
                      class="team-logo ls-is-cached lazyloaded"
                    />
                    <span class="team-name"></span>
                  </div>
                  <div class="team-score"><span class="score"></span></div>
                </div>
              </div>
              <div class="card-footer"><span class="team-status shimmer"></span></div></div
          ></a>
        </div>

        <div class="card-list" v-if="!widgetData.isServer">
          <a
            v-for="(match, i) in matchesArray"
            :key="i"
            class="card-item"
            :class="match.event_state === 'R' ? 'recent' : match.event_state === 'L' ? 'live' : 'upcoming'"
            :href="getMatchCenterUrl(match)"
          >
            <div class="card-wrap">
              <div class="card-header">
                <div class="head-wrap">
                  <span class="title">{{ match.customTourName }} </span>
                  <span class="matchinfo">{{ match.event_name }} | {{ getStartDate(match.start_date) }}</span>
                </div>
                <span v-if="match.event_state === 'L'" class="status">Live</span>
                <span v-else-if="match.event_state === 'R'" class="status">Recent</span>
                <span v-else class="status">Upcoming</span>
              </div>
              <div class="card-content">
                <div class="team team-a">
                  <div class="team-info">
                    <img
                      class="team-logo lazy"
                      :data-src="getTeamFlag(match.participants[0])"
                      :src="[lazyLoaded ? getTeamFlag(match.participants[0]) : getDefaultFlag(match.participants[0])]"
                      alt=""
                    />
                    <span class="team-name">{{ match.participants[0].customName }}</span>
                  </div>
                  <div class="team-score" :class="[match.participants[0].highlight ? 'won' : '']">
                    <span class="score">{{ getInningsScore(match.participants[0], "first") }}</span>
                    <span v-if="hasMultipleInnings(match.participants[0])">&</span>
                    <span v-if="hasMultipleInnings(match.participants[0])" class="score">{{ getInningsScore(match.participants[0], "second") }}</span>
                  </div>
                </div>
                <div class="team team-b">
                  <div class="team-info">
                    <img
                      class="team-logo lazy"
                      :data-src="getTeamFlag(match.participants[1])"
                      :src="[lazyLoaded ? getTeamFlag(match.participants[1]) : getDefaultFlag(match.participants[1])]"
                      alt=""
                    />
                    <span class="team-name">{{ match.participants[1].customName }}</span>
                  </div>
                  <div class="team-score" :class="[match.participants[1].highlight ? 'won' : '']">
                    <span class="score">{{ getInningsScore(match.participants[1], "first") }}</span>
                    <span v-if="hasMultipleInnings(match.participants[1])">&</span>
                    <span v-if="hasMultipleInnings(match.participants[1])" class="score">{{ getInningsScore(match.participants[1], "second") }}</span>
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <span v-if="match.sport === 'cricket'" class="team-status">{{ match.customStatus }}</span>
                <span v-if="match.sport === 'football'" class="team-status">{{ match.venue_name }}</span>
                <span v-if="match.sport === 'kabaddi'" class="team-status">{{ match.event_sub_status }}</span>
                <div
                  v-if="match.marketInfo && match.marketInfo.markets && match.marketInfo.markets[0] && match.marketInfo.markets[0].selections"
                  class="card-highlight"
                  :class="[widgetData.showMarketInfo ? 'active' : '']"
                >
                  <div @click.prevent="openOddsLink(match.sport)" target="_blank" class="highlight-wrap">
                    <div class="highlight-logo">
                      <img class="lazy" :src="getPartnerLogo" alt="" importance="low" />
                    </div>
                    <div
                      v-if="match.marketInfo.markets && match.marketInfo.markets[0] && match.marketInfo.markets[0].selections.length === 3"
                      class="team-details"
                    >
                      <div class="team team-a">
                        <span class="name">{{ match.participants[0].customShortName }}</span>
                        <span class="points">{{ match.marketInfo.markets[0].selections[0].odds }}</span>
                      </div>
                      <div class="team team-draw">
                        <span class="draw">{{ match.marketInfo.markets[0].selections[1].odds }}</span>
                      </div>
                      <div class="team team-b">
                        <span class="points">{{ match.marketInfo.markets[0].selections[2].odds }}</span>
                        <span class="name">{{ match.participants[1].customShortName }}</span>
                      </div>
                    </div>
                    <div
                      v-if="match.marketInfo.markets && match.marketInfo.markets[0] && match.marketInfo.markets[0].selections.length === 2"
                      class="team-details"
                    >
                      <div class="team team-a">
                        <span class="name">{{ match.participants[0].customShortName }}</span>
                        <span class="points">{{ match.marketInfo.markets[0].selections[0].odds }}</span>
                      </div>
                      <div class="team team-b">
                        <span class="points">{{ match.marketInfo.markets[0].selections[1].odds }}</span>
                        <span class="name">{{ match.participants[1].customShortName }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { hasMultipleInnings, getTeamFlag, getInningsScore, getMatchCenterUrl, getDateTime } from "./../../sdk/WidgetLibrary/utils";

export default {
  props: {
    widgetData: Object,
    selectedLanguage: String,
    translations: Object,
    imagePaths: Object,
    winstonLogger: Object,
    lazyLoaded: Boolean,
    configData: Object
  },
  computed: {
    matchesArray: function() {
      return this.widgetData.matches;
    },
    getMetadata: function() {
      return this.widgetData.meta ? this.widgetData.meta : {};
    },
    getPartnerLogo: function() {
      if (this.widgetData.partnerLogo)
        return this.widgetData.applicationDomain + "/" + this.widgetData.partnerLogo + "?v=" + this.configData.content.playerImg;
      return this.widgetData.applicationDomain + "/static-assets/images/affiliates/sportsbet.png?v=1.3";
    }
  },
  methods: {
    getInningsScore: function(participant, innings) {
      return getInningsScore(this.winstonLogger, participant.value, innings);
    },
    hasMultipleInnings: function(participant) {
      return hasMultipleInnings(this.winstonLogger, participant.value);
    },
    getTeamFlag: function(participantsObj) {
      return getTeamFlag(this.winstonLogger, this.imagePaths, participantsObj, this.widgetData.sport);
    },
    getMatchCenterUrl: function(matchData) {
      return getMatchCenterUrl(this.winstonLogger, matchData, this.widgetData.footballScoreCardMapper);
    },
    getDefaultFlag: function(participantsObj) {
      if (this.lazyLoaded) {
        return getTeamFlag(this.winstonLogger, this.imagePaths, participantsObj, this.widgetData.sport);
      }
      return getTeamFlag(this.winstonLogger, this.imagePaths, false, this.widgetData.sport);
    },
    sportSelection: function(sport) {
      this.widgetData.openSportDD = false;
      this.widgetData.sport = sport.id;
      this.widgetData.selectedSportInfo = this.widgetData.sportsArray.find(sportInfo => sportInfo.id === this.widgetData.sport);

      this.widgetData.selectedSportName = this.widgetData.selectedSportInfo.name;
      this.widgetData.leagueInfo = this.widgetData.selectedSportInfo.has_leagues
        ? this.widgetData.selectedSportInfo.leagues.find(leagueInfo => leagueInfo.is_default)
        : {};
      this.widgetData.selectedLeagueName = this.widgetData.leagueInfo.name;
      this.getNewSportLeagueData();
    },
    leagueSelection: function(league) {
      this.widgetData.openLeagueDD = false;
      this.widgetData.leagueInfo = this.widgetData.selectedSportInfo.has_leagues
        ? this.widgetData.selectedSportInfo.leagues.find(leagueInfo => leagueInfo.league_code === league.league_code)
        : {};
      this.widgetData.selectedLeagueName = this.widgetData.leagueInfo.name;
      this.getNewSportLeagueData();
    },
    openSportSelectionDropDown: function() {
      this.widgetData.openLeagueDD = false;
      this.widgetData.openSportDD = !this.widgetData.openSportDD;
    },
    leagueDDSelection: function() {
      this.widgetData.openSportDD = false;
      this.widgetData.openLeagueDD = !this.widgetData.openLeagueDD;
    },
    disablePopups: function() {
      this.widgetData.openLeagueDD = false;
      this.widgetData.openSportDD = false;
    },
    openOddsLink: function(sport) {
      if (this.widgetData.oddsLink) {
        window.open(this.widgetData.oddsLink);
        return;
      }
      if (sport === "cricket") {
        window.open("https://sportsbet.io/sports/cricket/inplay?ref=scorecard");
      } else if (sport === "football") {
        window.open("https://sportsbet.io/sports/soccer/inplay?ref=scorecard");
      } else {
        window.open("https://sportsbet.io/sports?ref=scorecard");
      }
    },
    getStartDate: function(date) {
      try {
        return getDateTime(date, "dd mmm yyyy");
      } catch (e) {
        return "";
      }
    }
  }
};
</script>
