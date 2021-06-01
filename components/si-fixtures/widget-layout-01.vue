<template>
  <div
    v-infinite-scroll="loadMore"
    infinite-scroll-disabled="busy"
    infinite-scroll-distance="10"
    @click.stop="closeAllDropDowns()"
    v-if="!widgetData.err"
    :class="[widgetData.extraClass]"
    :server-data="widgetData.serverData"
    :team-id="widgetData.serverData.teamId"
    :team-name="widgetData.serverData.teamName"
    :tournament-id="widgetData.serverData.tournamentId"
    :tournament-name="widgetData.serverData.teamName"
    :selectedLanguage="selectedLanguage"
    class="waf-component waf-fixtures widget_layout_01 si-waf-widget"
    widget-id="si-fixtures-widget-layout-01"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <component class="title" :is="widgetData.widgetTitleTag" v-if="widgetData.showWidgetTitle">{{ getDisplayName }}</component>
          <div
            v-if="widgetData.configData.showLeaguesFilter"
            class="dropdown-wrap filter-container"
            :class="[widgetData.configData.showLeaguesDD ? 'active' : '']"
            @click.stop="toggleLeaguesDropDown()"
          >
            <div class="waf-select-box">
              <span class="selected-title">{{ widgetData.configData.selectedLeague ? widgetData.configData.selectedLeague.name : "" }}</span>
              <div class="select-box-wrap">
                <ul
                  v-if="
                    widgetData.configData.leaguesArray &&
                      widgetData.configData.leaguesArray.length &&
                      widgetData.configData.leaguesArray[0].is_linkable
                  "
                  class="select-list"
                >
                  <li v-for="(league, i) in widgetData.configData.leaguesArray" :key="i" class="list-item">
                    <a v-if="league.is_linkable" :href="widgetData.applicationDomain + '/' + league.redirect_link">{{ league.name }}</a>
                  </li>
                </ul>
                <div v-else class="select-list">
                  <button @click.stop="leagueSelection(league)" v-for="(league, i) in widgetData.configData.leaguesArray" :key="i" class="list-item">
                    {{ league.name }}
                  </button>
                </div>
                <span class="dropdown-close">Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="waf-body">
        <div class="filter-section">
          <div class="filter-wrapper">
            <section class="filter filter-status" v-if="widgetData.configData.hasTabs">
              <div
                @click.stop="tabSelection(tab)"
                v-for="(tab, i) in widgetData.configData.tabs"
                class="status"
                :key="i"
                :class="tab.name === widgetData.configData.currentTabObj.name ? 'active' : ''"
              >
                <span>{{ tab.name }}</span>
              </div>
              <div
                @click.stop="toggleHiddenFilter()"
                v-if="widgetData.configData.showExtraFilter"
                :class="widgetData.configData.showExtraFilter ? 'status-filter' : ''"
                class="status"
              >
                <span class="filter-options">Filter matches</span>
              </div>
            </section>
            <section class="filter filter-type" :class="[widgetData.configData.showHiddenFilters ? 'active' : '']">
              <!-- <div
                @click.stop="toggleMonthDropDown()"
                v-if="
                  widgetData.configData.showMonthsFilter && widgetData.configData.selectedSportId !== 1 && widgetData.configData.selectedSportId !== 3
                "
                class="dropdown team-dropdown"
                :class="[widgetData.configData.showMonthsDD ? 'active' : '']"
              >
                <label class="dropdown-label">{{ widgetData.configData.selectedMonthObj.displayDate || "Select Month" }}</label>
                <div class="select-box-wrap">
                  <span @click.stop="toggleMonthDropDown()" class="dropdown-close">Close</span>
                  <div
                    v-if="widgetData.configData.monthsArray && widgetData.configData.monthsArray.length && !isFilterLinkable('Month')"
                    class="select-list"
                  >
                    <button @click.stop="monthSelection(month)" v-for="(month, k) in widgetData.configData.monthsArray" :key="k" class="list-item">
                      {{ month.displayDate }}
                    </button>
                  </div>
                </div>
              </div> -->

              <div
                @click.stop="toggleYearDropDown()"
                v-if="widgetData.configData.showMonthsFilter"
                class="dropdown team-dropdown"
                :class="[widgetData.configData.showYearsDD ? 'active' : '']"
              >
                <label class="dropdown-label">{{ getYear }}</label>
                <div class="select-box-wrap">
                  <span @click.stop="toggleYearDropDown()" class="dropdown-close">Close</span>
                  <div
                    v-if="widgetData.configData.monthsArray && widgetData.configData.monthsArray.length && !isFilterLinkable('Month')"
                    class="select-list"
                  >
                    <button
                      @click.stop="monthSelection('', 'year')"
                      v-if="
                        (widgetData.configData.selectedTeamName || widgetData.configData.selectedTournamentName) &&
                          widgetData.configData.monthsArray.length > 1
                      "
                      class="list-item"
                    >
                      {{ "All" }}
                    </button>
                    <button
                      @click.stop="monthSelection(year, 'year')"
                      v-for="(year, k) in widgetData.configData.yearAndMonthObj.yearArray"
                      :key="k"
                      class="list-item"
                    >
                      {{ year }}
                    </button>
                  </div>
                </div>
              </div>

              <div
                @click.stop="toggleMonthOnlyDropDown()"
                v-if="widgetData.configData.showMonthsFilter"
                class="dropdown team-dropdown"
                :class="[widgetData.configData.showMonthsNewDD ? 'active' : '']"
              >
                <label class="dropdown-label">{{ getMonth }}</label>
                <div class="select-box-wrap">
                  <span @click.stop="toggleMonthOnlyDropDown()" class="dropdown-close">Close</span>
                  <div
                    v-if="
                      widgetData.configData.monthsArray &&
                        widgetData.configData.monthsArray.length &&
                        widgetData.configData.yearAndMonthObj &&
                        widgetData.configData.yearAndMonthObj.monthsObj &&
                        widgetData.configData.yearAndMonthObj.monthsObj[getYear] &&
                        !isFilterLinkable('Month')
                    "
                    class="select-list"
                  >
                    <button
                      @click.stop="monthSelection(monthData, 'month')"
                      v-for="(monthData, k) in widgetData.configData.yearAndMonthObj.monthsObj[getYear]"
                      :key="k"
                      class="list-item"
                    >
                      {{ monthData.month }}
                    </button>
                  </div>
                </div>
              </div>

              <div
                @click.stop="toggleTeamDropDown()"
                v-if="widgetData.configData.showTeamFilter"
                class="dropdown team-dropdown tour-dropdown"
                :class="[widgetData.configData.showTeamsDD ? 'active' : '']"
              >
                <label class="dropdown-label">{{ cleanNameForDisplay(widgetData.configData.selectedTeamName) || "Select Team" }}</label>
                <div class="select-box-wrap">
                  <span @click.stop="toggleTeamDropDown()" class="dropdown-close">Close</span>
                  <ul
                    v-if="widgetData.configData.teamsArray && widgetData.configData.teamsArray.length && isFilterLinkable('Teams')"
                    class="select-list"
                  >
                    <li v-for="(team, k) in widgetData.configData.teamsArray" :key="k" class="list-item">
                      <a :href="getTeamFixturesLink(team)">{{ team.team_name }}</a>
                    </li>
                  </ul>
                  <ul v-else-if="isFilterLinkable('Teams')" class="select-list">
                    <li class="list-item">
                      <span>{{ "NO TEAMS AVAILABLE" }}</span>
                    </li>
                  </ul>
                  <div
                    v-if="widgetData.configData.teamsArray && widgetData.configData.teamsArray.length && !isFilterLinkable('Teams')"
                    class="select-list"
                  >
                    <button @click.stop="teamSelection(team)" v-for="(team, k) in widgetData.configData.teamsArray" :key="k" class="list-item">
                      {{ team.team_name }}
                    </button>
                  </div>
                  <div v-else-if="!isFilterLinkable('Teams')" class="select-list">
                    <button class="list-item">
                      {{ "NO TEAMS AVAILABLE" }}
                    </button>
                  </div>
                </div>
              </div>

              <div
                @click.stop="toggleTournamentDropDown()"
                v-if="widgetData.configData.showTournamentFilter"
                class="dropdown team-dropdown tour-dropdown"
                :class="[widgetData.configData.showTournamentsDD ? 'active' : '']"
              >
                <label class="dropdown-label">{{ cleanNameForDisplay(widgetData.configData.selectedTournamentName) || "Select Tournament" }}</label>
                <div class="select-box-wrap">
                  <span @click.stop="toggleTournamentDropDown()" class="dropdown-close">Close</span>
                  <ul
                    v-if="widgetData.configData.tournamentsArray && widgetData.configData.tournamentsArray.length && isFilterLinkable('Tournaments')"
                    class="select-list"
                  >
                    <li v-for="(tour, k) in widgetData.configData.tournamentsArray" :key="k" class="list-item">
                      <a :href="getTourFixturesLink(tour)">{{ tour.tour_name }}</a>
                    </li>
                  </ul>
                  <ul v-else-if="isFilterLinkable('Tournaments')" class="select-list">
                    <li class="list-item">
                      <span>{{ "NO TOURNAMENTS AVAIABLE" }}</span>
                    </li>
                  </ul>
                  <div
                    v-if="widgetData.configData.tournamentsArray && widgetData.configData.tournamentsArray.length && !isFilterLinkable('Tournaments')"
                    class="select-list"
                  >
                    <button
                      @click.stop="tournamentSelection(tour)"
                      v-for="(tour, k) in widgetData.configData.tournamentsArray"
                      :key="k"
                      class="list-item"
                    >
                      {{ tour.tour_name }}
                    </button>
                  </div>
                  <div v-else-if="!isFilterLinkable('Tournaments')" class="select-list">
                    <button class="list-item">
                      NO TOURNAMENTS AVAILABLE
                    </button>
                  </div>
                </div>
              </div>
              <div @click.stop="toggleHiddenFilter()" class="status">
                <span class="close">Close</span>
              </div>
            </section>
          </div>
        </div>
        <div
          v-for="(cardData, i) in widgetData.liveCardLists"
          v-if="widgetData.configData.currentTabObj.name.toLowerCase() === 'live'"
          :style="{ display: widgetData.configData.currentTabObj.name.toLowerCase() === 'live' ? '' : 'none' }"
          :key="i"
          class="card-list"
        >
          <a
            v-for="(match, j) in cardData.matches"
            :key="j"
            :href="getMatchCenterUrl(match)"
            class="card-item"
            :class="match.event_state === 'L' ? 'live' : match.event_state === 'U' ? 'upcoming' : 'recent'"
          >
            <div class="vevent" style="display: none;">
              <span class="url">{{ getMatchCenterUrl(match) }}</span>
              <span class="summary">{{ match.participants[0].name }} vs {{ match.participants[1].name }}</span>
              <span class="dtstart">{{ match.start_date }}</span>
              <span class="dtend">{{ match.end_date }}</span>
              <span class="description">{{ match.series_name }}</span>
              <span class="location">{{ match.venue_name }}</span>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <div class="head-wrap">
                  <span class="title head-title">{{ match.customTourName }}</span>
                  <span class="matchinfo head-title">{{ match.event_name }}</span>
                  <span class="title head-title"> {{ getStartDate(match.start_date) }}</span>
                  <span class="title head-title"> {{ getVenue(match) }}</span>
                </div>
                <span v-if="match.event_state === 'L'" class="status">Live</span>
                <span v-else-if="match.event_state === 'R'" class="status">Recent</span>
                <span v-else class="status">Upcoming</span>
              </div>
              <div class="card-content">
                <div class="team team-a">
                  <div class="team-info">
                    <img class="team-logo lazy" :src="getDefaultFlag(match.participants[0])" :data-src="getTeamFlag(match.participants[0])" alt="" />
                    <span class="team-name">{{ match.participants[0].customName }}</span>
                  </div>
                  <div class="team-score" :class="[match.participants[0].highlight ? 'won' : '']">
                    <span class="score">{{ getInningsScore(match.participants[0], "first") }}</span>
                    <span v-if="hasMultipleInnings(match.participants[0])">&</span>
                    <span class="score" v-if="hasMultipleInnings(match.participants[0])">{{ getInningsScore(match.participants[0], "second") }}</span>
                  </div>
                </div>
                <div class="team team-b">
                  <div class="team-info">
                    <img class="team-logo lazy" :src="getDefaultFlag(match.participants[1])" :data-src="getTeamFlag(match.participants[1])" alt="" />
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
              </div>
              <div v-if="hasOdds(match)" class="card-highlight">
                <div @click.prevent="openOddsLink(match.sport)" target="_blank" class="highlight-wrap">
                  <div class="highlight-logo">
                    <img :src="getPartnerLogo" alt="" importance="low" />
                  </div>
                  <div v-if="match.market.markets[0].selections.length === 3" class="team-details">
                    <div class="team team-a">
                      <span class="name">{{ match.participants[0].customName }}</span>
                      <span class="points">{{ match.market.markets[0].selections[0].odds }}</span>
                    </div>
                    <div class="team team-draw">
                      <span class="draw">{{ match.market.markets[0].selections[1].odds }}</span>
                    </div>
                    <div class="team team-b">
                      <span class="points">{{ match.market.markets[0].selections[2].odds }}</span>
                      <span class="name">{{ match.participants[1].customName }}</span>
                    </div>
                  </div>
                  <div v-if="match.market.markets[0].selections.length === 2" class="team-details">
                    <div class="team team-a">
                      <span class="name">{{ match.participants[0].customName }}</span>
                      <span class="points">{{ match.market.markets[0].selections[0].odds }}</span>
                    </div>
                    <div class="team team-b">
                      <span class="points">{{ match.market.markets[0].selections[1].odds }}</span>
                      <span class="name">{{ match.participants[1].customName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <div v-if="!cardData.matches.length">
            No Live Matches Ongoing
          </div>
          <FixtureAds v-if="cardData.adObj" :widget-data="cardData.adObj" />
        </div>
        <div
          v-for="(cardData, i) in widgetData.upcomingCardLists"
          v-if="widgetData.configData.currentTabObj.name.toLowerCase() === 'upcoming'"
          :key="i"
          :style="{ display: widgetData.configData.currentTabObj.name.toLowerCase() === 'upcoming' ? '' : 'none' }"
          class="card-list"
        >
          <a
            v-for="(match, j) in cardData.matches"
            :key="j"
            :href="getMatchCenterUrl(match)"
            class="card-item"
            :class="match.event_state === 'L' ? 'live' : match.event_state === 'U' ? 'upcoming' : 'recent'"
          >
            <div class="vevent" style="display: none;">
              <span class="url">{{ getMatchCenterUrl(match) }}</span>
              <span class="summary">{{ match.participants[0].name }} vs {{ match.participants[1].name }}</span>
              <span class="dtstart">{{ match.start_date }}</span>
              <span class="dtend">{{ match.end_date }}</span>
              <span class="description">{{ match.series_name }}</span>
              <span class="location">{{ match.venue_name }}</span>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <div class="head-wrap">
                  <span class="title head-title">{{ match.customTourName }}</span>
                  <span class="matchinfo head-title">{{ match.event_name }}</span>
                  <span class="title head-title"> {{ getStartDate(match.start_date) }}</span>
                  <span class="title head-title"> {{ getVenue(match) }}</span>
                </div>
                <span v-if="match.event_state === 'L'" class="status">Live</span>
                <span v-else-if="match.event_state === 'R'" class="status">Recent</span>
                <span v-else class="status">Upcoming</span>
              </div>
              <div class="card-content">
                <div class="team team-a">
                  <div class="team-info">
                    <img class="team-logo lazy" :src="getDefaultFlag(match.participants[0])" :data-src="getTeamFlag(match.participants[0])" alt="" />
                    <span class="team-name">{{ match.participants[0].customName }}</span>
                  </div>
                  <div class="team-score " :class="[match.participants[0].highlight ? 'won' : '']">
                    <span class="score">{{ getInningsScore(match.participants[0], "first") }}</span>
                    <span v-if="hasMultipleInnings(match.participants[0])">&</span>
                    <span class="score" v-if="hasMultipleInnings(match.participants[0])">{{ getInningsScore(match.participants[0], "second") }}</span>
                  </div>
                </div>
                <div class="team team-b">
                  <div class="team-info">
                    <img class="team-logo lazy" :src="getDefaultFlag(match.participants[1])" :data-src="getTeamFlag(match.participants[1])" alt="" />
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
              </div>
              <div v-if="hasOdds(match)" class="card-highlight">
                <div @click.prevent="openOddsLink(match.sport)" target="_blank" class="highlight-wrap">
                  <div class="highlight-logo">
                    <img :src="getPartnerLogo" alt="" importance="low" />
                  </div>
                  <div v-if="match.market.markets[0].selections.length === 3" class="team-details">
                    <div class="team team-a">
                      <span class="name">{{ match.participants[0].customName }}</span>
                      <span class="points">{{ match.market.markets[0].selections[0].odds }}</span>
                    </div>
                    <div class="team team-draw">
                      <span class="draw">{{ match.market.markets[0].selections[2].odds }}</span>
                    </div>
                    <div class="team team-b">
                      <span class="name">{{ match.participants[1].customName }}</span>
                      <span class="points">{{ match.market.markets[0].selections[1].odds }}</span>
                    </div>
                  </div>
                  <div v-if="match.market.markets[0].selections.length === 2" class="team-details">
                    <div class="team team-a">
                      <span class="name">{{ match.participants[0].customName }}</span>
                      <span class="points">{{ match.market.markets[0].selections[0].odds }}</span>
                    </div>
                    <div class="team team-b">
                      <span class="points">{{ match.market.markets[0].selections[1].odds }}</span>
                      <span class="name">{{ match.participants[1].customName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <div v-if="!cardData.matches.length">
            No Upcoming Matches
          </div>
          <FixtureAds v-if="cardData.adObj" :widget-data="cardData.adObj" />
        </div>
        <div
          v-for="(cardData, i) in widgetData.recentCardLists"
          v-if="widgetData.configData.currentTabObj.name.toLowerCase() === 'recent'"
          :style="{ display: widgetData.configData.currentTabObj.name.toLowerCase() === 'recent' ? '' : 'none' }"
          :key="i"
          class="card-list"
        >
          <a
            v-for="(match, j) in cardData.matches"
            :key="j"
            :href="getMatchCenterUrl(match)"
            class="card-item"
            :class="match.event_state === 'L' ? 'live' : match.event_state === 'U' ? 'upcoming' : 'recent'"
          >
            <div class="vevent" style="display: none;">
              <span class="url">{{ getMatchCenterUrl(match) }}</span>
              <span class="summary">{{ match.participants[0].name }} vs {{ match.participants[1].name }}</span>
              <span class="dtstart">{{ match.start_date }}</span>
              <span class="dtend">{{ match.end_date }}</span>
              <span class="description">{{ match.series_name }}</span>
              <span class="location">{{ match.venue_name }}</span>
            </div>
            <div class="card-wrap">
              <div class="card-header">
                <div class="head-wrap">
                  <span class="title head-title">{{ match.customTourName }}</span>
                  <span class="matchinfo head-title">{{ match.event_name }}</span>
                  <span class="title head-title"> {{ getStartDate(match.start_date) }}</span>
                  <span class="title head-title"> {{ getVenue(match) }}</span>
                </div>
                <span v-if="match.event_state === 'L'" class="status">Live</span>
                <span v-else-if="match.event_state === 'R'" class="status">Recent</span>
                <span v-else class="status">Upcoming</span>
              </div>
              <div class="card-content">
                <div class="team team-a">
                  <div class="team-info">
                    <img class="team-logo lazy" :src="getDefaultFlag(match.participants[0])" :data-src="getTeamFlag(match.participants[0])" alt="" />
                    <span class="team-name">{{ match.participants[0].customName }}</span>
                  </div>
                  <div class="team-score " :class="[match.participants[0].highlight ? 'won' : '']">
                    <span class="score">{{ getInningsScore(match.participants[0], "first") }}</span>
                    <span v-if="hasMultipleInnings(match.participants[0])">&</span>
                    <span class="score" v-if="hasMultipleInnings(match.participants[0])">{{ getInningsScore(match.participants[0], "second") }}</span>
                  </div>
                </div>
                <div class="team team-b">
                  <div class="team-info">
                    <img class="team-logo lazy" :src="getDefaultFlag(match.participants[1])" :data-src="getTeamFlag(match.participants[1])" alt="" />
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
              </div>
              <div v-if="hasOdds(match)" class="card-highlight">
                <div @click.prevent="openOddsLink(match.sport)" target="_blank" class="highlight-wrap">
                  <div class="highlight-logo">
                    <img :src="getPartnerLogo" alt="" importance="low" />
                  </div>
                  <div v-if="match.market.markets[0].selections.length === 3" class="team-details">
                    <div class="team team-a">
                      <span class="name">{{ match.participants[0].customName }}</span>
                      <span class="points">{{ match.market.markets[0].selections[0].odds }}</span>
                    </div>
                    <div class="team team-draw">
                      <span class="draw">{{ match.market.markets[0].selections[1].odds }}</span>
                    </div>
                    <div class="team team-b">
                      <span class="points">{{ match.market.markets[0].selections[2].odds }}</span>
                      <span class="name">{{ match.participants[1].customName }}</span>
                    </div>
                  </div>
                  <div v-if="match.market.markets[0].selections.length === 2" class="team-details">
                    <div class="team team-a">
                      <span class="name">{{ match.participants[0].customName }}</span>
                      <span class="points">{{ match.market.markets[0].selections[0].odds }}</span>
                    </div>
                    <div class="team team-b">
                      <span class="points">{{ match.market.markets[0].selections[1].odds }}</span>
                      <span class="name">{{ match.participants[1].customName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <div v-if="!cardData.matches.length">
            No Recent Matches
          </div>
          <FixtureAds v-if="cardData.adObj" :widget-data="cardData.adObj" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { hasMultipleInnings, getTeamFlag, getInningsScore, getMatchCenterUrl, getDateTime } from "./../../sdk/WidgetLibrary/utils";
import FixtureAds from "./../../components/si-ads/fixture-ads.vue";

export default {
  head() {
    return {
      __dangerouslyDisableSanitizers: ["script"],
      script: [
        {
          innerHTML: `
              window.fixtureWidgetData = ${JSON.stringify(this.widgetData)}`
        }
      ]
    };
  },
  props: {
    widgetData: Object,
    selectedLanguage: String,
    translations: Object,
    imagePaths: Object,
    winstonLogger: Object,
    lazyLoaded: Boolean,
    configData: Object,
    busy: Boolean
  },
  components: {
    FixtureAds
  },
  computed: {
    matchesArray: function() {
      return this.widgetData.matches;
    },
    loopsForCardList: function() {
      return +(this.matchesArray.length / this.widgetData.configData.adsAfter).toFixed(0) + 1;
    },
    getPartnerLogo: function() {
      if (this.widgetData.configData.partnerLogo)
        return this.widgetData.applicationDomain + "/" + this.widgetData.configData.partnerLogo + "?v=" + this.configData.content.playerImg;
      return this.widgetData.applicationDomain + "/static-assets/images/affiliates/sportsbet.png?v=1.3";
    },
    getDisplayName: function() {
      try {
        let title = this.widgetData.displayTitle
          .replace("{{TEAMNAME}}", this.widgetData.configData.selectedTeamName)
          .replace("{{SERIESNAME}}", this.widgetData.configData.selectedTournamentName);
        return title.replace(/-/g, " ");
      } catch (e) {
        return "";
      }
    },
    getYear: function() {
      let defaultYearString = "Select Year";
      try {
        return this.widgetData.configData.selectedMonthObj && this.widgetData.configData.selectedMonthObj.displayDate
          ? this.widgetData.configData.selectedMonthObj.displayDate.split(" ")[1]
          : defaultYearString;
      } catch (e) {
        return defaultYearString;
      }
    },
    getMonth: function() {
      let defaultMonthString = "Select Month";
      try {
        return this.widgetData.configData.selectedMonthObj && this.widgetData.configData.selectedMonthObj.displayDate
          ? this.widgetData.configData.selectedMonthObj.displayDate.split(" ")[0]
          : defaultMonthString;
      } catch (e) {
        return defaultMonthString;
      }
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
      return getTeamFlag(this.winstonLogger, this.imagePaths, participantsObj, this.widgetData.configData.selectedSportId);
    },
    getMatchCenterUrl: function(matchData) {
      return getMatchCenterUrl(this.winstonLogger, matchData, this.widgetData.footballScoreCardMapper);
    },
    getDefaultFlag: function(participantsObj) {
      // if (this.lazyLoaded) {
      //   return getTeamFlag(this.winstonLogger, this.imagePaths, participantsObj, this.widgetData.configData.selectedSportId);
      // }
      return getTeamFlag(this.winstonLogger, this.imagePaths, "", this.widgetData.configData.selectedSportId);
    },
    matchesSlicedArray: function(index) {
      return this.matchesArray.slice(
        (index - 1) * this.widgetData.configData.adsAfter,
        (index - 1) * this.widgetData.configData.adsAfter + this.widgetData.configData.adsAfter
      );
    },
    getMonthFixturesLink: function(monthInfo) {
      try {
        let monthName = monthInfo.displayDate.replace(/ /g, "-").toLowerCase();
        let urlForMonthFixtures = this.widgetData.configData.extraFilter.find(filterInfo => filterInfo.name === "Month").redirect_link;
        return this.widgetData.applicationDomain + "/" + urlForMonthFixtures.replace("{{DATE}}", monthName);
      } catch (e) {
        return "";
      }
    },
    getTourFixturesLink: function(tourInfo) {
      try {
        let tourId = tourInfo.tour_id;
        let tourName = tourInfo.tour_name
          // .replace(/ /g, "-")
          // .replace(/'/g, "")
          .replace(/[^a-zA-Z0-9]/g, "-")
          .replace(/--/g, "-")
          .toLowerCase();
        let urlForTourFixtures = this.widgetData.configData.extraFilter.find(filterInfo => filterInfo.name === "Tournaments").redirect_link;
        return this.widgetData.applicationDomain + "/" + urlForTourFixtures.replace("{{TOURNAME}}", tourName).replace("{{TOURID}}", tourId);
      } catch (e) {
        return "";
      }
    },
    getTeamFixturesLink: function(teamInfo) {
      try {
        let urlForTeamFixtures = this.widgetData.configData.extraFilter.find(filterInfo => filterInfo.name === "Teams").redirect_link;
        let teamName = teamInfo.team_name.replace(/ /g, "-").toLowerCase();
        let teamId = teamInfo.team_id;
        return this.widgetData.applicationDomain + "/" + urlForTeamFixtures.replace("{{TEAMNAME}}", teamName).replace("{{TEAMID}}", teamId);
      } catch (e) {
        return "";
      }
    },
    isFilterLinkable: function(filterName) {
      let filterInfo = this.widgetData.configData.extraFilter.find(filterInfo => filterInfo.name === filterName);
      return filterInfo ? filterInfo.is_linkable : filterInfo;
    },
    cleanNameForDisplay: function(name) {
      try {
        if (!name) return "";
        return name.replace(/-/g, " ").replace(/,/g, "");
      } catch (e) {
        return "";
      }
    },
    closeAllDropDowns: function() {
      this.widgetData.configData.showLeaguesDD = false;
      this.widgetData.configData.showHiddenFilters = false;
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.showMonthsDD = false;
      this.widgetData.configData.showYearsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;
    },
    toggleLeaguesDropDown: function() {
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.showMonthsDD = false;
      this.widgetData.configData.showYearsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;
      this.widgetData.configData.showHiddenFilters = false;
      this.widgetData.configData.showLeaguesDD = !this.widgetData.configData.showLeaguesDD;
    },
    toggleHiddenFilter: function() {
      this.widgetData.configData.showLeaguesDD = false;
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.showMonthsDD = false;
      this.widgetData.configData.showYearsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;
      this.widgetData.configData.showHiddenFilters = !this.widgetData.configData.showHiddenFilters;
    },
    toggleTeamDropDown: function() {
      this.widgetData.configData.showTeamsDD = !this.widgetData.configData.showTeamsDD;
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.showMonthsDD = false;
      this.widgetData.configData.showYearsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;
    },
    toggleTournamentDropDown: function() {
      this.widgetData.configData.showTournamentsDD = !this.widgetData.configData.showTournamentsDD;
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.showMonthsDD = false;
      this.widgetData.configData.showYearsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;
    },
    toggleMonthDropDown: function() {
      if (this.widgetData.configData.lockMonthsDD) return;
      this.widgetData.configData.showMonthsDD = !this.widgetData.configData.showMonthsDD;
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.showYearsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;
    },
    toggleYearDropDown: function() {
      if (this.widgetData.configData.lockMonthsDD) return;
      this.widgetData.configData.showYearsDD = !this.widgetData.configData.showYearsDD;
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.showMonthsNewDD = false;
    },
    toggleMonthOnlyDropDown: function() {
      if (this.widgetData.configData.lockMonthsDD) return;
      this.widgetData.configData.showMonthsNewDD = !this.widgetData.configData.showMonthsNewDD;
      this.widgetData.configData.showTeamsDD = false;
      this.widgetData.configData.showTournamentsDD = false;
      this.widgetData.configData.showYearsDD = false;
    },
    openOddsLink: function(sport) {
      if (this.widgetData.configData.oddsLink) {
        window.open(this.widgetData.configData.oddsLink);
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
    },
    hasOdds: function(match) {
      return (
        match.market &&
        match.market.markets &&
        match.market.markets[0] &&
        match.market.markets[0].selections &&
        match.market.markets[0].selections.length
      );
    },
    getVenue: function(match) {
      try {
        return match.venue_name.split(", ")[1];
      } catch (e) {
        return "";
      }
    },
    loadMore: function() {
      this.busy = true;
      if (this.widgetData.configData.currentTabObj.name.toLowerCase() === "live") {
        if (this.widgetData.liveCardLists.length !== this.widgetData.liveCardListsBackup.length) {
          let previousLength = this.widgetData.liveCardLists.length;
          let newLength =
            previousLength + 3 > this.widgetData.liveCardListsBackup.length ? this.widgetData.liveCardListsBackup.length : previousLength + 3;
          this.widgetData.liveCardLists = this.widgetData.liveCardListsBackup.slice();
          this.widgetData.liveCardLists.length = newLength;
          this.busy = false;
        }
      } else if (this.widgetData.configData.currentTabObj.name.toLowerCase() === "upcoming") {
        if (this.widgetData.upcomingCardLists.length !== this.widgetData.upcomingCardListsBackup.length) {
          let previousLength = this.widgetData.upcomingCardLists.length;
          let newLength =
            previousLength + 3 > this.widgetData.upcomingCardListsBackup.length ? this.widgetData.upcomingCardListsBackup.length : previousLength + 3;
          this.widgetData.upcomingCardLists = this.widgetData.upcomingCardListsBackup.slice();
          this.widgetData.upcomingCardLists.length = newLength;
          this.busy = false;
        }
      } else {
        if (this.widgetData.recentCardLists.length !== this.widgetData.recentCardListsBackup.length) {
          let previousLength = this.widgetData.recentCardLists.length;
          let newLength =
            previousLength + 3 > this.widgetData.recentCardListsBackup.length ? this.widgetData.recentCardListsBackup.length : previousLength + 3;
          this.widgetData.recentCardLists = this.widgetData.recentCardListsBackup.slice();
          this.widgetData.recentCardLists.length = newLength;
          this.busy = false;
        }
      }

      setTimeout(() => {
        window.adModule({ type: "fixturesPage" });
      }, 1000);
    }
  }
};
</script>
