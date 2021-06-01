<template>
  <div
    v-if="!widgetData.err"
    class="waf-component waf-scorecard waf-footballscorecard si-waf-widget"
    widget-id="si-football-scorecard-widget-layout-01"
    :data-gamecode="widgetData.gameCode"
    :data-league="widgetData.leagueCode"
    :data-default-tab="widgetData.defaultTab"
    data-sport="football"
    :is-mobile="widgetData.isMobile"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <h3 class="title">{{ widgetData.matchDetails.series.name }}</h3>
        </div>
      </div>
      <div class="waf-body">
        <div class="content-wrap">
          <div class="card-section">
            <div
              class="card-item"
              :class="[
                widgetData.matchDetails.is_completed ||
                widgetData.matchDetails.status_id === '8' ||
                widgetData.matchDetails.status_id === '7' ||
                widgetData.matchDetails.status_id === 7
                  ? 'completed'
                  : widgetData.matchDetails.status_id === '9' || widgetData.matchDetails.status_id === '29'
                  ? 'upcoming'
                  : 'live'
              ]"
            >
              <div class="card-wrap">
                <div class="card-header">
                  <div class="head-wrap">
                    <span class="title">{{ widgetData.matchDetails.series.name }}</span>
                    <span class="match-time">
                      | {{ getDateTime(widgetData.matchDetails.date, "ddS mmm") }} |
                      {{ getDateTime(widgetData.matchDetails.date + " " + widgetData.matchDetails.start_time, "HH:MM TT") }}
                    </span>
                  </div>
                  <span class="status" v-if="widgetData.matchDetails.is_completed || widgetData.matchDetails.status_id === '8'">
                    completed
                  </span>
                  <span class="status" v-else-if="widgetData.matchDetails.status_id === 7 || widgetData.matchDetails.status_id === '7'">
                    abandoned
                  </span>
                  <span class="status" v-else-if="widgetData.matchDetails.status_id === '9' || widgetData.matchDetails.status_id === '29'">
                    upcoming
                  </span>
                  <span class="status" v-else>
                    live
                  </span>
                </div>
                <div class="card-content">
                  <div class="team team-a" :class="{ 'won-team': widgetData.teams[0].score > widgetData.teams[1].score }">
                    <div class="team-info">
                      <span class="team-name fullname">{{ widgetData.teams[0].name }}</span>
                      <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[0].id })" class="team-logo" importance="low" />

                      <span class="team-name shortname">{{ widgetData.teams[0].short_name }}</span>
                    </div>
                    <div class="team-score">
                      <span class="score" v-if="widgetData.matchDetails.status_id != 9">{{ widgetData.teams[0].score }}</span>
                    </div>
                  </div>
                  <div class="team team-timer">
                    <span
                      class="timer"
                      v-if="
                        widgetData.matchDetails.status_id != '9' && widgetData.matchDetails.status_id != '7' && widgetData.matchDetails.status_id != 7
                      "
                      v-html="getMatchTime()"
                    ></span>
                    <span class="timer" v-else>VS</span>

                    <span class="aggregate" v-if="widgetData.matchDetails.is_shootout" v-html="getAPScore('pen')"></span>
                    <span class="aggregate" v-if="widgetData.matchDetails.is_aggregate" v-html="getAPScore('agg')"></span>
                  </div>
                  <div class="team team-b" :class="{ 'won-team': widgetData.teams[0].score < widgetData.teams[1].score }">
                    <div class="team-score">
                      <span class="score" v-if="widgetData.matchDetails.status_id != 9">{{ widgetData.teams[1].score }}</span>
                    </div>
                    <div class="team-info">
                      <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[1].id })" class="team-logo" importance="low" />
                      <span class="team-name fullname">{{ widgetData.teams[1].name }}</span>
                      <span class="team-name shortname">{{ widgetData.teams[1].short_name }}</span>
                    </div>
                  </div>
                </div>
                <div class="live-match-footer">
                  <div class="footer-wrap">
                    <div class="progress-section" style="display: none">
                      <div class="progress-wrap">
                        <span class="label highlight-label">Win Predictor</span>
                        <div class="result">
                          <span class="label">Cad</span>
                          <span class="value-a">80%</span>
                          <div class="progress-bar">
                            <span style="width: 35.6%"></span>
                          </div>
                          <span class="value value-b">20%</span>
                          <span class="label">Bar</span>
                        </div>
                      </div>
                    </div>
                    <div class="innings-info">
                      <div class="player-details left-section">
                        <div
                          class="player-info"
                          v-for="playerGoal in widgetData.playerGoals"
                          v-if="widgetData.teams[0].id == playerGoal.team_id"
                          :class="{ 'goal goal-own': checkOwnGoal(playerGoal.goals) }"
                        >
                          <span class="player-name">{{ playerGoal.display_name }} </span>
                          <span class="player-score" v-html="goalScorer(playerGoal.goals)"></span>
                        </div>
                      </div>
                      <div class="player-details right-section">
                        <div
                          class="player-info"
                          v-for="playerGoal in widgetData.playerGoals"
                          v-if="widgetData.teams[1].id == playerGoal.team_id"
                          :class="{ 'goal goal-own': checkOwnGoal(playerGoal.goals) }"
                        >
                          <span class="player-name">{{ playerGoal.display_name }} </span>
                          <span class="player-score" v-html="goalScorer(playerGoal.goals)"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="timeline-container">
            <div v-if="!widgetData.isMobile" class="timeline-wrapper timeline-wrapper-desktop">
              <div class="timeline-elements">
                <div class="team-logo">
                  <div class="logo logo-a">
                    <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[0].id })" class="team-logo" importance="low" />
                  </div>
                  <div class="logo logo-b">
                    <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[1].id })" class="team-logo" importance="low" />
                  </div>
                </div>
                <div class="timeline-progressbar"></div>
                <!-- <div class="timeline-progressbar" :style="'width: ' + widgetData.timelineProgress + '%'"></div> -->
                <div class="time-interval-section">
                  <div class="interval-wrapper">
                    <span class="time-interval" v-for="(line, index) in Array(widgetData.fullTime / 10 + 1)">
                      <span v-if="index !== widgetData.fullTime / 10"> {{ 10 * index }}</span>
                      <span v-else>FT</span>
                    </span>
                    <span class="half-time">HT</span>
                  </div>
                </div>
                <div class="key-events">
                  <div class="event-list team-a" v-for="events in widgetData.aTeamEvents" :style="placePipe(widgetData.fullTime, events[0].time)">
                    <span class="event-circle"></span>
                    <div class="event-item" :class="getTimelineEventClass(events)">
                      <span class="symbol"></span>
                      <div class="event-tooltip">
                        <div class="txt-wrap" v-for="event in events">
                          <span class="text text1">{{ getEventTime(event) }} -{{ event.event }}</span>
                          <div class="tooltip-info" v-if="event.event_id == 13">
                            <span class="info-text on">{{ event.substitution.player_in.player_name }} (On) </span>
                            <span class="info-text off">{{ event.substitution.player_out.player_name }} (Off)</span>
                          </div>
                          <div class="tooltip-info" v-else>
                            {{ event.offensive_player.display_name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="event-list team-b" v-for="events in widgetData.bTeamEvents" :style="placePipe(widgetData.fullTime, events[0].time)">
                    <span class="event-circle"></span>
                    <div class="event-item" :class="getTimelineEventClass(events)">
                      <span class="symbol"></span>
                      <div class="event-tooltip">
                        <div class="txt-wrap" v-for="event in events">
                          <span class="text text1">{{ getEventTime(event) }} -{{ event.event }}</span>
                          <div class="tooltip-info" v-if="event.event_id == 13">
                            <span class="info-text on">{{ event.substitution.player_in.player_name }} (On) </span>
                            <span class="info-text off">{{ event.substitution.player_out.player_name }} (Off)</span>
                          </div>
                          <div class="tooltip-info" v-else>
                            {{ event.offensive_player.display_name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="timeline-wrapper timeline-wrapper-mobile" :class="widgetData.isTimeline ? 'expand' : 'collapse'">
              <div class="timeline-elements">
                <div class="team-logo">
                  <div class="logo logo-a">
                    <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[0].id })" class="team-logo" importance="low" />
                  </div>
                  <div class="logo logo-b">
                    <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[1].id })" class="team-logo" importance="low" />
                  </div>
                </div>
                <div class="timeline-progressbar"></div>
                <div class="key-events">
                  <div
                    class="event-list"
                    v-for="(event, index) in widgetData.abTeamEvents"
                    :class="event.team_id == widgetData.teams[0].id ? 'team-a' : 'team-b'"
                  >
                    <span class="event-circle" v-html="getEventTime(event)"></span>
                    <div class="event-item" :class="getEventClass(event)">
                      <span class="symbol"></span>
                      <div class="event-tooltip">
                        <div class="txt-wrap">
                          <div class="tooltip-info" v-if="event.event_id == 13">
                            <span class="info-text on">{{ event.substitution.player_in.player_name }} (On) </span>
                            <span class="info-text off">{{ event.substitution.player_out.player_name }} (Off)</span>
                          </div>
                          <div class="tooltip-info" v-else>
                            {{ event.offensive_player.display_name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="timeline-button" @click="toggleTimeline()" :class="{ active: widgetData.isTimeline }">
                <span class="timeline-arrow"></span>
              </div>
            </div>
          </div>
          <section id="" data-component="si-ads" data-template="widget_layout_01"></section>

          <div class="scorecard-container">
            <ul class="tabs scorecard-tab">
              <li class="tab-name" @click="tabContent(widgetData.pbpTab)" :class="{ 'tab-active': widgetData.defaultTab === widgetData.pbpTab }">
                <span>Play By Play</span>
              </li>
              <li
                class="tab-name"
                @click="tabContent(widgetData.lineupTab)"
                :class="{ 'tab-active': widgetData.defaultTab === widgetData.lineupTab }"
              >
                <span>Line-Ups</span>
              </li>
              <li class="tab-name" @click="tabContent(widgetData.eventTab)" :class="{ 'tab-active': widgetData.defaultTab === widgetData.eventTab }">
                <span>Events &amp; Stats</span>
              </li>
            </ul>
            <div class="tab-container">
              <div class="playbyplay-tab-container" v-if="widgetData.defaultTab === widgetData.pbpTab">
                <div class="container-wrap">
                  <ul class="tabs scorecard-sub-tab">
                    <li class="tab-name" @click="printEvents('all')" :class="{ 'tab-active': widgetData.pbpTabName === 'all' }">
                      <span>All</span>
                    </li>
                    <li class="tab-name" @click="printEvents('key')" :class="{ 'tab-active': widgetData.pbpTabName === 'key' }">
                      <span>Key Events</span>
                    </li>
                  </ul>
                  <div class="sub-container-wrap">
                    <div class="playbyplay-list" v-if="widgetData.keyEvents.length">
                      <div class="playbyplay-item" v-for="(e, index) in widgetData.keyEvents" :class="getEventClass(e)">
                        <div class="item-wrap">
                          <div class="col-one">
                            <span>{{ e.time.minutes }}'</span>
                            <span class="time-note" v-if="e.time.additional_minutes"> (+{{ e.time.additional_minutes }}) </span>
                          </div>
                          <div class="col-two">
                            <span class="icon"></span>
                          </div>
                          <div
                            class="col-three"
                            v-if="
                              e.event_id == 9 ||
                                e.event_id == 12 ||
                                e.event_id == 16 ||
                                e.event_id == 17 ||
                                e.event_id == 18 ||
                                e.event_id == 31 ||
                                e.event_id == 20 ||
                                e.event_id == 21 ||
                                e.event_id == 22
                            "
                          >
                            <span class="text">{{ e.event }}</span>
                            <span class="note" v-if="e.offensive_player.display_name">
                              {{ e.team_name }} : {{ e.offensive_player.display_name }}
                            </span>
                          </div>

                          <div
                            class="col-three"
                            v-else-if="
                              e.event_id == 1 ||
                                e.event_id == 11 ||
                                e.event_id == 14 ||
                                e.event_id == 2 ||
                                e.event_id == 3 ||
                                e.event_id == 4 ||
                                e.event_id == 7 ||
                                e.event_id == 8 ||
                                e.event_id == 10
                            "
                          >
                            <span class="text">{{ e.event_text }}</span>
                          </div>
                          <div class="col-three" v-else-if="e.event_id == 13">
                            <span class="text">{{ e.event }}</span>
                            <div class="substitution-players-info">
                              <span class="player-info player-out" v-if="e.substitution.player_out">
                                {{ e.substitution.player_out.player_display_name }}
                                <span class="status out">(Out)</span>
                              </span>
                              <span class="player-info player-in" v-if="e.substitution.player_in">
                                {{ e.substitution.player_in.player_display_name }}
                                <span class="status in">(IN)</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="playbyplay-list" v-else>
                      <div class="item-wrap">
                        <div class="col-three"><span class="text">No data available currently</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="lineup-tab-container" v-if="widgetData.defaultTab === widgetData.lineupTab">
                <div class="container-wrap">
                  <ul class="tabs scorecard-sub-tab">
                    <li class="tab-name" @click="changeTeam(0)" :class="{ 'tab-active': widgetData.selectedTeam === 0 }">
                      <span>{{ widgetData.teams[0].name }}</span>
                    </li>
                    <li class="tab-name" @click="changeTeam(1)" :class="{ 'tab-active': widgetData.selectedTeam === 1 }">
                      <span>{{ widgetData.teams[1].name }}</span>
                    </li>
                  </ul>
                  <div class="sub-container-wrap">
                    <div class="player-section">
                      <span class="lineup-format">{{ widgetData.selectedFormation }}</span>
                      <!--<span class="lineup-format">{{widgetData.formationB}}</span>-->
                      <div class="playing-player-list">
                        <div class="player-list">
                          <div class="player-item">
                            <div class="player-wrap">
                              <div class="event-list">
                                <div
                                  class="player-event"
                                  v-for="event in widgetData.selectedGoalKeeper[widgetData.selectedGoalKeeper.id]"
                                  :class="getEventClass(event)"
                                >
                                  <div class="tooltip">
                                    <span class="text text1">{{ getEventTime(event) }} - {{ event.event }}</span>
                                    <span class="text text2" v-if="event.event_id === 13"> {{ event.substitution.player_in.player_name }} (in) </span>
                                  </div>
                                  <span class="symbol"></span>
                                </div>
                              </div>
                              <div class="thumbnail">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 78.692 85.211">
                                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                    <path
                                      :fill="widgetData.teams[widgetData.selectedTeam].jersy_color"
                                      d="M-25.207-110.394a17.069,17.069,0,0,1-.19-1.837c-.062-2.193.031-4.4-.173-6.577-.217-2.32-.7-4.614-1.075-6.919a14.926,14.926,0,0,0-1.676-4.841c-.492-.9-.961-1.847-2.161-2.08a7.953,7.953,0,0,1-2.119-.71,2.429,2.429,0,0,0-.9-.307l-5.039-1.935,0-.018-.1-.019-.348-.134-3.385-1.237c-.465-.2-.926-.4-1.382-.612-1.466-.689-2.871-1.506-4.318-2.238a1.037,1.037,0,0,0-.773-.07,10.4,10.4,0,0,1-4.6.689c-1.57-.053-3.145-.01-4.717.024a10.807,10.807,0,0,1-4.152-.691,1.331,1.331,0,0,0-.967.042c-1.371.694-2.671,1.545-4.076,2.155-2.064.9-4.2,1.635-6.3,2.446-.2.077-.4.159-.6.243l-3.97,1.376c-.643.226-1.27.5-1.917.711a4.229,4.229,0,0,0-2.641,1.789,17.474,17.474,0,0,0-2.173,6.136c-.443,2.7-.673,5.438-.848,8.169-.136,2.124-.05,4.261-.059,6.393-.005,1.216.126,1.487,1.345,1.654a16.469,16.469,0,0,0,3.578.5,21.763,21.763,0,0,0,4.791-.408c.9-.27,1.174-.486,1.169-1.4-.005-.959-.021-1.919,0-2.877a6.677,6.677,0,0,1,.147-.942l.184.013c.31,1.157.659,2.3.922,3.471.34,1.51.662,3.027.9,4.555.391,2.515.861,5.032,1.021,7.566.231,3.653.217,1.873-.279,5.52-.269,1.979-.508,2.146-.731,4.131-.193,1.712-.34,3.429-.516,5.143a11.836,11.836,0,0,1-.238,1.835A4.618,4.618,0,0,0-71.9-76.8a13.675,13.675,0,0,0,5.726,2.744,27.3,27.3,0,0,0,5.672.989c.569.032,1.129.287,1.695.293,1.744.017,3.49-.037,5.235-.062a12.67,12.67,0,0,0,1.583-.022c1.526-.215,3.052-.448,4.566-.738a21.094,21.094,0,0,0,3.621-.883A27.526,27.526,0,0,0-40.014-76.4c1.448-.835,2.9-3.3,2.183-5.215a4,4,0,0,1-.161-.943c-.275-2.449-.561-4.9-.813-7.348-.265-2.578-.523-1.526-.736-4.109-.32-3.877,0-4.107.339-7.966.009-.106.034-.21.052-.315.356-2.048.69-4.1,1.078-6.143.226-1.186.5-2.366.831-3.527a7.881,7.881,0,0,1,.774-1.441c.111,1.331.235,2.493.294,3.658a1.028,1.028,0,0,0,.885,1.006,10.464,10.464,0,0,0,3.253.45c.918-.115,1.88.111,2.8-.011a23.818,23.818,0,0,0,3.2-.77C-25.3-109.278-25.106-109.664-25.207-110.394Zm-23.066-27.387a7.127,7.127,0,0,1-.911,1.521,8.4,8.4,0,0,1-3.869,3.074,16.449,16.449,0,0,1-2.313.548,8.538,8.538,0,0,1-7.022-3.852,4.424,4.424,0,0,1-.7-1.2,1.507,1.507,0,0,1,.115-1.1c.087-.144.626-.029.958,0,.182.014.357.107.539.132a6.907,6.907,0,0,1,.762.061c2.327.594,4.7.333,7.046.313,1.326-.011,2.651-.238,3.975-.378.119-.013.226-.138.345-.149.336-.033.863-.168.972-.016A1.272,1.272,0,0,1-48.273-137.781Z"
                                      transform="translate(94.87 145.98)"
                                    ></path>
                                  </g>
                                </svg>
                                <span class="player-number">{{ widgetData.selectedGoalKeeper.jersey_no }}</span>
                              </div>
                              <div class="content">
                                <div class="player-name" v-html="getPlayer(widgetData.selectedGoalKeeper.short_name)"></div>
                              </div>
                            </div>
                          </div>
                          <div class="player-item" v-for="row in widgetData.selectedTeamPlayers">
                            <div class="player-wrap" v-for="player in row">
                              <div class="event-list">
                                <div class="player-event" v-for="event in player[player.id]" :class="getEventClass(event)">
                                  <div class="tooltip">
                                    <span class="text text1">{{ getEventTime(event) }} - {{ event.event }}</span>
                                    <span class="text text2" v-if="event.event_id === 13"> {{ event.substitution.player_in.player_name }} (in) </span>
                                  </div>
                                  <span class="symbol"></span>
                                </div>
                              </div>
                              <div class="thumbnail">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 78.692 85.211">
                                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                    <path
                                      :fill="widgetData.teams[widgetData.selectedTeam].jersy_color"
                                      d="M-25.207-110.394a17.069,17.069,0,0,1-.19-1.837c-.062-2.193.031-4.4-.173-6.577-.217-2.32-.7-4.614-1.075-6.919a14.926,14.926,0,0,0-1.676-4.841c-.492-.9-.961-1.847-2.161-2.08a7.953,7.953,0,0,1-2.119-.71,2.429,2.429,0,0,0-.9-.307l-5.039-1.935,0-.018-.1-.019-.348-.134-3.385-1.237c-.465-.2-.926-.4-1.382-.612-1.466-.689-2.871-1.506-4.318-2.238a1.037,1.037,0,0,0-.773-.07,10.4,10.4,0,0,1-4.6.689c-1.57-.053-3.145-.01-4.717.024a10.807,10.807,0,0,1-4.152-.691,1.331,1.331,0,0,0-.967.042c-1.371.694-2.671,1.545-4.076,2.155-2.064.9-4.2,1.635-6.3,2.446-.2.077-.4.159-.6.243l-3.97,1.376c-.643.226-1.27.5-1.917.711a4.229,4.229,0,0,0-2.641,1.789,17.474,17.474,0,0,0-2.173,6.136c-.443,2.7-.673,5.438-.848,8.169-.136,2.124-.05,4.261-.059,6.393-.005,1.216.126,1.487,1.345,1.654a16.469,16.469,0,0,0,3.578.5,21.763,21.763,0,0,0,4.791-.408c.9-.27,1.174-.486,1.169-1.4-.005-.959-.021-1.919,0-2.877a6.677,6.677,0,0,1,.147-.942l.184.013c.31,1.157.659,2.3.922,3.471.34,1.51.662,3.027.9,4.555.391,2.515.861,5.032,1.021,7.566.231,3.653.217,1.873-.279,5.52-.269,1.979-.508,2.146-.731,4.131-.193,1.712-.34,3.429-.516,5.143a11.836,11.836,0,0,1-.238,1.835A4.618,4.618,0,0,0-71.9-76.8a13.675,13.675,0,0,0,5.726,2.744,27.3,27.3,0,0,0,5.672.989c.569.032,1.129.287,1.695.293,1.744.017,3.49-.037,5.235-.062a12.67,12.67,0,0,0,1.583-.022c1.526-.215,3.052-.448,4.566-.738a21.094,21.094,0,0,0,3.621-.883A27.526,27.526,0,0,0-40.014-76.4c1.448-.835,2.9-3.3,2.183-5.215a4,4,0,0,1-.161-.943c-.275-2.449-.561-4.9-.813-7.348-.265-2.578-.523-1.526-.736-4.109-.32-3.877,0-4.107.339-7.966.009-.106.034-.21.052-.315.356-2.048.69-4.1,1.078-6.143.226-1.186.5-2.366.831-3.527a7.881,7.881,0,0,1,.774-1.441c.111,1.331.235,2.493.294,3.658a1.028,1.028,0,0,0,.885,1.006,10.464,10.464,0,0,0,3.253.45c.918-.115,1.88.111,2.8-.011a23.818,23.818,0,0,0,3.2-.77C-25.3-109.278-25.106-109.664-25.207-110.394Zm-23.066-27.387a7.127,7.127,0,0,1-.911,1.521,8.4,8.4,0,0,1-3.869,3.074,16.449,16.449,0,0,1-2.313.548,8.538,8.538,0,0,1-7.022-3.852,4.424,4.424,0,0,1-.7-1.2,1.507,1.507,0,0,1,.115-1.1c.087-.144.626-.029.958,0,.182.014.357.107.539.132a6.907,6.907,0,0,1,.762.061c2.327.594,4.7.333,7.046.313,1.326-.011,2.651-.238,3.975-.378.119-.013.226-.138.345-.149.336-.033.863-.168.972-.016A1.272,1.272,0,0,1-48.273-137.781Z"
                                      transform="translate(94.87 145.98)"
                                    ></path>
                                  </g>
                                </svg>
                                <span class="player-number">{{ player.jersey_no }}</span>
                              </div>
                              <div class="content">
                                <div class="player-name" v-html="getPlayer(player.short_name)"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="substitute-player-list">
                        <span class="title">Substitutes</span>
                        <div class="player-list">
                          <div
                            class="player-wrap"
                            v-for="player in widgetData.teams[widgetData.selectedTeam].players"
                            v-if="player.is_started == false"
                          >
                            <div class="event-list">
                              <div class="player-event" v-for="event in player[player.id]" :class="getEventClass(event)">
                                <div class="tooltip">
                                  <span class="text text1">{{ getEventTime(event) }} - {{ event.event }}</span>
                                  <span class="text text2" v-if="event.event_id === 13"> {{ event.substitution.player_out.player_name }} (out) </span>
                                </div>
                                <span class="symbol"></span>
                              </div>
                            </div>
                            <div class="thumbnail">
                              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 78.692 85.211">
                                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                  <path
                                    :fill="widgetData.teams[widgetData.selectedTeam].jersy_color"
                                    d="M-25.207-110.394a17.069,17.069,0,0,1-.19-1.837c-.062-2.193.031-4.4-.173-6.577-.217-2.32-.7-4.614-1.075-6.919a14.926,14.926,0,0,0-1.676-4.841c-.492-.9-.961-1.847-2.161-2.08a7.953,7.953,0,0,1-2.119-.71,2.429,2.429,0,0,0-.9-.307l-5.039-1.935,0-.018-.1-.019-.348-.134-3.385-1.237c-.465-.2-.926-.4-1.382-.612-1.466-.689-2.871-1.506-4.318-2.238a1.037,1.037,0,0,0-.773-.07,10.4,10.4,0,0,1-4.6.689c-1.57-.053-3.145-.01-4.717.024a10.807,10.807,0,0,1-4.152-.691,1.331,1.331,0,0,0-.967.042c-1.371.694-2.671,1.545-4.076,2.155-2.064.9-4.2,1.635-6.3,2.446-.2.077-.4.159-.6.243l-3.97,1.376c-.643.226-1.27.5-1.917.711a4.229,4.229,0,0,0-2.641,1.789,17.474,17.474,0,0,0-2.173,6.136c-.443,2.7-.673,5.438-.848,8.169-.136,2.124-.05,4.261-.059,6.393-.005,1.216.126,1.487,1.345,1.654a16.469,16.469,0,0,0,3.578.5,21.763,21.763,0,0,0,4.791-.408c.9-.27,1.174-.486,1.169-1.4-.005-.959-.021-1.919,0-2.877a6.677,6.677,0,0,1,.147-.942l.184.013c.31,1.157.659,2.3.922,3.471.34,1.51.662,3.027.9,4.555.391,2.515.861,5.032,1.021,7.566.231,3.653.217,1.873-.279,5.52-.269,1.979-.508,2.146-.731,4.131-.193,1.712-.34,3.429-.516,5.143a11.836,11.836,0,0,1-.238,1.835A4.618,4.618,0,0,0-71.9-76.8a13.675,13.675,0,0,0,5.726,2.744,27.3,27.3,0,0,0,5.672.989c.569.032,1.129.287,1.695.293,1.744.017,3.49-.037,5.235-.062a12.67,12.67,0,0,0,1.583-.022c1.526-.215,3.052-.448,4.566-.738a21.094,21.094,0,0,0,3.621-.883A27.526,27.526,0,0,0-40.014-76.4c1.448-.835,2.9-3.3,2.183-5.215a4,4,0,0,1-.161-.943c-.275-2.449-.561-4.9-.813-7.348-.265-2.578-.523-1.526-.736-4.109-.32-3.877,0-4.107.339-7.966.009-.106.034-.21.052-.315.356-2.048.69-4.1,1.078-6.143.226-1.186.5-2.366.831-3.527a7.881,7.881,0,0,1,.774-1.441c.111,1.331.235,2.493.294,3.658a1.028,1.028,0,0,0,.885,1.006,10.464,10.464,0,0,0,3.253.45c.918-.115,1.88.111,2.8-.011a23.818,23.818,0,0,0,3.2-.77C-25.3-109.278-25.106-109.664-25.207-110.394Zm-23.066-27.387a7.127,7.127,0,0,1-.911,1.521,8.4,8.4,0,0,1-3.869,3.074,16.449,16.449,0,0,1-2.313.548,8.538,8.538,0,0,1-7.022-3.852,4.424,4.424,0,0,1-.7-1.2,1.507,1.507,0,0,1,.115-1.1c.087-.144.626-.029.958,0,.182.014.357.107.539.132a6.907,6.907,0,0,1,.762.061c2.327.594,4.7.333,7.046.313,1.326-.011,2.651-.238,3.975-.378.119-.013.226-.138.345-.149.336-.033.863-.168.972-.016A1.272,1.272,0,0,1-48.273-137.781Z"
                                    transform="translate(94.87 145.98)"
                                  ></path>
                                </g>
                              </svg>
                              <span class="player-number">{{ player.jersey_no }}</span>
                            </div>
                            <div class="content">
                              <div class="player-name" v-html="getPlayer(player.short_name)"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="eventsandstats-tab-container" v-if="widgetData.defaultTab === widgetData.eventTab">
                <div class="container-wrap">
                  <div class="match-teams">
                    <div class="team team-a">
                      <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[0].id })" class="team-logo" importance="low" />
                    </div>
                    <span class="sub-title">Key Stats</span>
                    <div class="team team-b">
                      <img :data-src="getDefaultFlag()" :src="getTeamFlag({ id: widgetData.teams[1].id })" class="team-logo" importance="low" />
                    </div>
                  </div>
                  <div class="stats-progressbar events-progressbar">
                    <div class="progressbar-listing">
                      <div class="progressbar-item" v-for="stats in widgetData.eventStats">
                        <div class="progress-wrap">
                          <div class="label-wrap">
                            <span class="label" v-html="statsProgress(0, stats, 'value')"></span>
                            <span class="label">{{ stats.displayName }}</span>
                            <span class="label" v-html="statsProgress(1, stats, 'value')"></span>
                          </div>
                          <div class="progress-view">
                            <div class="team-bar team-a-bar"><span :style="{ width: statsProgress(0, stats, 'style') + '%' }"></span></div>
                            <div class="team-bar team-b-bar"><span :style="{ width: statsProgress(1, stats, 'style') + '%' }"></span></div>
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
  </div>
</template>

<script>
import { getTeamFlag, getDateTime, getEventClass } from "./../../sdk/WidgetLibrary/utils";

export default {
  props: {
    widgetData: Object,
    selectedLanguage: String,
    translations: Object,
    imagePaths: Object,
    winstonLogger: Object
  },
  head() {
    // try {
    //   if (widgetData.pageTitle) {
    //     let title = widgetData.pageTitle
    //       .replace("{{HOMETEAM}}", widgetData.teams[0].name)
    //       .replace("{{AWAYTEAM}}", widgetData.teams[1].name)
    //       .replace("{{LEAGUENAME}}", widgetData.matchDetails.series.name.split(",")[0]);
    //     console.log(title, "title");
    //     return { title };
    //   }
    //   return {};
    // } catch (e) {
    //   return {};
    // }
  },
  methods: {
    getTeamFlag: function(participantsObj) {
      return getTeamFlag(this.winstonLogger, this.imagePaths, participantsObj, 2);
    },
    getDefaultFlag: function() {
      return getTeamFlag(this.winstonLogger, this.imagePaths, "", 2);
    },
    getEventTime: e => {
      let time = e.time.minutes + "'";
      if (e.time.additional_minutes) time = e.time.minutes + "+" + e.time.additional_minutes + "'";
      return time;
    },
    goalScorer: function(goals) {
      let goalMins = "";
      goals.forEach((goal, i) => {
        //let getTime = "";//vueInstance.getEventTime(goal);
        let getTime = goal.time.minutes + "'";
        goalMins += getTime;
        if (goal.event_id == 17) goalMins += "(P)";
        else if (goal.event_id == 16) goalMins += "(OG)";

        if (goals.length !== i + 1) goalMins += ", ";
      });
      return goalMins;
    },
    getAPScore: function(type) {
      const widgetData = this.widgetData;
      let score = "";
      let nodeAttr = type === "agg" ? "aggregate_score" : "shootout_score";
      if (widgetData.teams[0][nodeAttr] !== "" && widgetData.teams[1][nodeAttr] !== "") {
        score = "(" + widgetData.teams[0][nodeAttr] + " " + type.toUpperCase() + " " + widgetData.teams[1][nodeAttr] + ")";
      }
      return score;
    },
    getMatchTime: function() {
      const widgetData = this.widgetData;
      let matchTime = "";
      if (widgetData.matchDetails.is_completed || widgetData.matchDetails.status_id == 8) {
        matchTime = "FT";
      } else if (widgetData.matchDetails.status_id == 5) {
        matchTime = "HT";
      } else if (widgetData.matchDetails.status_id == 29 || widgetData.matchDetails.status_id == 9) {
        matchTime = "vs";
      } else if (widgetData.matchDetails.clock) {
        matchTime = widgetData.matchDetails.clock.minutes;
        if (widgetData.matchDetails.clock.seconds > 0) {
          matchTime += 1;
        }
        if (widgetData.matchDetails.clock.additional_minutes) {
          matchTime += "+" + widgetData.matchDetails.clock.additional_minutes;
        }
        matchTime = matchTime + "'";
      }

      if ([3, 10, 4, 12].indexOf(widgetData.matchDetails.status_id) != -1) {
        matchTime = "ET - " + matchTime;
      }
      if (widgetData.matchDetails.status_id == 10) {
        matchTime = "ET - HT";
      }
      return matchTime;
    },
    statsProgress: function(team, st, type) {
      const widgetData = this.widgetData;
      const parentKey = st.parentKey;
      const key = st.key;
      if (
        widgetData.teams[team] &&
        widgetData.teams[team].stats &&
        widgetData.teams[team].stats.hasOwnProperty(parentKey) &&
        widgetData.teams[team].stats[parentKey].hasOwnProperty(key)
      ) {
        if (type === "style") {
          let compareA = widgetData.teams[0].stats[parentKey][key] > widgetData.teams[1].stats[parentKey][key];
          let compareB = widgetData.teams[1].stats[parentKey][key] > widgetData.teams[0].stats[parentKey][key];

          if (team === 0) {
            if (compareA) return "100";
            else return (widgetData.teams[0].stats[parentKey][key] / widgetData.teams[1].stats[parentKey][key]) * 100;
          } else {
            if (compareB) return "100";
            else return (widgetData.teams[1].stats[parentKey][key] / widgetData.teams[0].stats[parentKey][key]) * 100;
          }
        } else return widgetData.teams[team].stats[parentKey][key];
      } else return "0";
    },
    getPlayer: name => {
      if (name.indexOf(" ") !== -1) {
        let Nm = name.split(" ");
        return '<span class="fname"' + Nm[0] + ' </span><span class="lname">' + Nm[Nm.length - 1] + "</span>";
      } else {
        return '<span class="si-lastNm">' + name + "</span>";
      }
    },
    placePipe: (ft, tm) => {
      return "position: absolute;left: " + ((tm.minutes / ft) * 100 - 0.54) + "%";
    },
    getDateTime: (date, format) => {
      return getDateTime(date, format);
    },
    getEventClass: event => {
      return getEventClass(event);
    },
    getTimelineEventClass: events => {
      if (events.length === 1) {
        return getEventClass(events[0]);
      } else return "plus";
    },
    checkOwnGoal: goals => {
      let isOwnGoal = false;
      goals.forEach(goal => {
        if (goal.event_id == 16) isOwnGoal = true;
      });
      return isOwnGoal;
    }
  }
};
</script>
