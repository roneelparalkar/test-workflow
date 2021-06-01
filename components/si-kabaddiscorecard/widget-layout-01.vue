<template>
  <div
    v-if="!widgetData.err"
    class="waf-component waf-scorecard waf-kabaddiscorecard si-waf-widget"
    widget-id="si-kabaddi-scorecard-widget-layout-01"
    :data-gameCode="widgetData.gameCode"
    :data-defaulttab="widgetData.defaulttab"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <h3 class="title">{{ widgetData.gameData.match_detail.series.name }}</h3>
        </div>
      </div>
      <div class="waf-body">
        <div class="content-wrap">
          <div class="card-section">
            <div class="card-item live">
              <div class="card-wrap">
                <div class="card-header">
                  <div class="head-wrap">
                    <span class="title">{{ widgetData.gameData.match_detail.series.name }} |</span>
                    <span class="matchinfo">{{ widgetData.gameData.match_detail.match_number }} |</span>
                    <span class="match-time">{{ widgetData.gameData.match_detail.date }} | {{ widgetData.gameData.match_detail.start_time }}</span>
                  </div>
                  <span class="status">{{ widgetData.gameData.match_detail.status }}</span>
                </div>
                <div class="card-content">
                  <div class="team team-a">
                    <div class="team-info">
                      <span class="team-name fullname">{{ widgetData.gameData.teams.team[0].name }}</span>
                      <img
                        :data-src="getDefaultFlag()"
                        :src="getTeamFlag({ id: widgetData.gameData.teams.team[0].id })"
                        class="team-logo"
                        importance="low"
                      />
                      <span class="team-name shortname">{{ widgetData.gameData.teams.team[0].short_name }}</span>
                    </div>
                    <div class="team-score">
                      <span class="score">{{ widgetData.gameData.teams.team[0].score }}</span>
                    </div>
                  </div>
                  <div class="team team-timer">
                    <span class="timer" v-if="widgetData.gameData.match_detail.status_id != '9'" v-html="getMatchTime(widgetData.gameData)"></span>
                    <span class="timer" v-else>VS</span>
                  </div>
                  <div class="team team-b team-lose">
                    <div class="team-score">
                      <span class="score">{{ widgetData.gameData.teams.team[1].score }}</span>
                    </div>
                    <div class="team-info">
                      <img
                        :data-src="getDefaultFlag()"
                        :src="getTeamFlag({ id: widgetData.gameData.teams.team[1].id })"
                        class="team-logo"
                        importance="low"
                      />
                      <span class="team-name fullname">{{ widgetData.gameData.teams.team[1].name }}</span>
                      <span class="team-name shortname">{{ widgetData.gameData.teams.team[1].short_name }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <span class="team-status" v-if="widgetData.gameData.match_detail.result && widgetData.gameData.match_detail.result.value">{{
                    widgetData.gameData.match_detail.result.value
                  }}</span>
                </div>
                <div class="live-match-footer" style="display: none">
                  <div class="footer-wrap">
                    <div class="progress-section">
                      <div class="progress-wrap">
                        <span class="label highlight-label">Win Predictor</span>
                        <div class="result">
                          <span class="label">Bgb</span>
                          <span class="value value-a">80%</span>
                          <div class="progress-bar">
                            <span style="width: 35.6%"></span>
                          </div>
                          <span class="value value-b">20%</span>
                          <span class="label">Ddkc</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <section id="" data-component="si-ads" data-template="widget_layout_01"></section>

          <div class="scorecard-container">
            <ul class="tabs scorecard-tab">
              <li
                class="tab-name"
                :class="{ 'tab-active': widgetData.defaulttab === widgetData.scoreTab }"
                data-si-tabs="scorecard"
                @click.stop.prevent="tabSelection(widgetData.scoreTab)"
              >
                <span>Scorecard</span>
              </li>
              <li
                class="tab-name"
                :class="{ 'tab-active': widgetData.defaulttab === widgetData.pbpTab }"
                data-si-tabs="pbp"
                @click.stop.prevent="tabSelection(widgetData.pbpTab)"
              >
                <span>Play By Play</span>
              </li>
              <li
                class="tab-name"
                :class="{ 'tab-active': widgetData.defaulttab === widgetData.statTab }"
                data-si-tabs="mstats"
                @click.stop.prevent="tabSelection(widgetData.statTab)"
              >
                <span>Match Stats</span>
              </li>
            </ul>
            <div class="tab-container">
              <div class="scorecard-tab-container" v-if="widgetData.defaulttab === widgetData.scoreTab">
                <div class="container-wrap">
                  <ul class="tabs scorecard-sub-tab">
                    <li
                      class="tab-name"
                      :class="{ 'tab-active': 0 === widgetData.selectedInn }"
                      @click.stop.prevent="tabSelection(widgetData.scoreTab, 'innings', 0)"
                    >
                      <span>{{ widgetData.gameData.teams.team[0].name }}</span>
                    </li>
                    <li
                      class="tab-name"
                      :class="{ 'tab-active': 1 === widgetData.selectedInn }"
                      @click.stop.prevent="tabSelection(widgetData.scoreTab, 'innings', 1)"
                    >
                      <span>{{ widgetData.gameData.teams.team[1].name }}</span>
                    </li>
                  </ul>
                  <div class="sub-container-wrap">
                    <div class="player-scorecard starter-player-scorecard">
                      <div class="table-responsive">
                        <div class="table starter-player-table">
                          <div class="table-head">
                            <div class="table-row">
                              <div class="table-data label">
                                <span>Starters</span>
                              </div>
                              <div class="table-data touch-points">
                                <span>Touch Points</span>
                              </div>
                              <div class="table-data bonus-points">
                                <span>Bonus Points</span>
                              </div>
                              <div class="table-data raid-points">
                                <span>Raid Points</span>
                              </div>
                              <div class="table-data tackle-points">
                                <span>Tackle Points</span>
                              </div>
                              <div class="table-data total-points">
                                <span>Points</span>
                              </div>
                            </div>
                          </div>
                          <div class="table-body">
                            <div
                              class="table-element"
                              v-for="(squad, index) in widgetData.gameData.teams.team[widgetData.selectedInn].squad"
                              v-if="squad.starter"
                              :class="{
                                active: widgetData.togglePlayer && widgetData.togglePlayer[squad.id],
                                'has-accordion': squad.points.raid_points.total,
                              }"
                              @click.stop="togglePlayer(squad, widgetData.selectedInn, index)"
                            >
                              <div class="table-row">
                                <div class="table-data label">
                                  <span class="player-number">{{ squad.jersey }} </span>
                                  <span class="player-name">{{ squad.name }}</span>
                                </div>
                                <div class="table-data touch-points">
                                  <span>{{ squad.points.raid_points.touch }}</span>
                                </div>
                                <div class="table-data bonus-points">
                                  <span>{{ squad.points.raid_points.raid_bonus }}</span>
                                </div>
                                <div class="table-data raid-points">
                                  <span>{{ squad.points.raid_points.total }}</span>
                                </div>
                                <div class="table-data tackle-points">
                                  <span>
                                    {{ squad.points.tackle_points.total }}
                                    <em class="super-tackle" v-if="squad.points.tackle_points.capture_bonus">
                                      <em class="tackle-tooltip"> {{ squad.points.tackle_points.capture_bonus }} Super Tackle </em>
                                    </em>
                                  </span>
                                </div>
                                <div class="table-data total-points">
                                  <span>{{ squad.points.total }}</span>
                                </div>
                              </div>
                              <div class="table-content" v-if="widgetData.togglePlayer && widgetData.togglePlayer[squad.id]">
                                <div class="content-box">
                                  <div class="raid-info">
                                    <div class="raid-count total-raid">
                                      <span class="count">{{ squad.raids.total }}</span>
                                      <span class="label">Raids</span>
                                    </div>
                                    <div class="raid-count successful-raid">
                                      <span class="count" v-if="squad.raids.total">
                                        {{ Math.round((squad.raids.successful * 100) / squad.raids.total) }}%
                                      </span>
                                      <span class="count" v-else>0%</span>
                                      <span class="label">Successful Raids</span>
                                    </div>
                                  </div>
                                  <div class="raids-graph">
                                    <div class="graph-listing">
                                      <div class="graph-item successful">
                                        <div class="graph-wrap">
                                          <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                                            <circle
                                              stroke-dasharray=" 100,100"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="bottom-circle"
                                            ></circle>
                                            <circle
                                              :stroke-dasharray="squad.raids.successful + ',100'"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="top-circle"
                                            ></circle>
                                          </svg>
                                          <span class="graph-count">{{ squad.raids.successful }}</span>
                                        </div>
                                        <span class="graph-label">Successful Raids</span>
                                      </div>
                                      <div class="graph-item unsuccessful">
                                        <div class="graph-wrap">
                                          <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                                            <circle
                                              stroke-dasharray=" 100,100"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="bottom-circle"
                                            ></circle>
                                            <circle
                                              :stroke-dasharray="squad.raids.unsuccessful + ',100'"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="top-circle"
                                            ></circle>
                                          </svg>
                                          <span class="graph-count">{{ squad.raids.unsuccessful }}</span>
                                        </div>
                                        <span class="graph-label">Unsuccessful Raids</span>
                                      </div>
                                      <div class="graph-item empty">
                                        <div class="graph-wrap">
                                          <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                                            <circle
                                              stroke-dasharray=" 100,100"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="bottom-circle"
                                            ></circle>
                                            <circle
                                              :stroke-dasharray="squad.raids.Empty + ',100'"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="top-circle"
                                            ></circle>
                                          </svg>
                                          <span class="graph-count">{{ squad.raids.Empty }}</span>
                                        </div>
                                        <span class="graph-label">Empty Raids</span>
                                      </div>
                                    </div>
                                    <div class="raid-sequence" v-if="squad.events">
                                      <div class="head">
                                        <span class="title">Raid Sequence</span>
                                      </div>
                                      <div class="body">
                                        <div class="sequence-listing">
                                          <span
                                            class="sequence-item"
                                            v-for="event in squad.events"
                                            :class="{
                                              successful: event.event_id == 1,
                                              unsuccessful: event.event_id == 2,
                                              empty: event.event_id == 3,
                                            }"
                                          >
                                          </span>
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

                    <section id="" data-component="si-ads" data-template="widget_layout_01"></section>
                    <div class="player-scorecard substitute-player-scorecard">
                      <div class="table-responsive">
                        <div class="table substitute-player-table">
                          <div class="table-head">
                            <div class="table-row">
                              <div class="table-data label">
                                <span>Substitute</span>
                              </div>
                              <div class="table-data touch-points">
                                <span>Touch Points</span>
                              </div>
                              <div class="table-data bonus-points">
                                <span>Bonus Points</span>
                              </div>
                              <div class="table-data raid-points">
                                <span>Raid Points</span>
                              </div>
                              <div class="table-data tackle-points">
                                <span>Tackle Points</span>
                              </div>
                              <div class="table-data total-points">
                                <span>Points</span>
                              </div>
                            </div>
                          </div>
                          <div class="table-body">
                            <div
                              class="table-element"
                              v-for="(squad, index) in widgetData.gameData.teams.team[widgetData.selectedInn].squad"
                              v-if="!squad.starter"
                              :class="{
                                active: widgetData.togglePlayer && widgetData.togglePlayer[squad.id],
                                'has-accordion': squad.points.raid_points.total,
                              }"
                              @click.stop="togglePlayer(squad, widgetData.selectedInn, index)"
                            >
                              <div class="table-row">
                                <div class="table-data label">
                                  <span class="player-number">{{ squad.jersey }} </span>
                                  <span class="player-name">{{ squad.name }}</span>
                                </div>
                                <div class="table-data touch-points">
                                  <span>{{ squad.points.raid_points.touch }}</span>
                                </div>
                                <div class="table-data bonus-points">
                                  <span>{{ squad.points.raid_points.raid_bonus }}</span>
                                </div>
                                <div class="table-data raid-points">
                                  <span>{{ squad.points.raid_points.total }}</span>
                                </div>
                                <div class="table-data tackle-points">
                                  <span>
                                    {{ squad.points.tackle_points.total }}
                                    <em class="super-tackle" v-if="squad.points.tackle_points.capture_bonus">
                                      <em class="tackle-tooltip"> {{ squad.points.tackle_points.capture_bonus }} Super Tackle </em>
                                    </em>
                                  </span>
                                </div>
                                <div class="table-data total-points">
                                  <span>{{ squad.points.total }}</span>
                                </div>
                              </div>
                              <div class="table-content" v-if="widgetData.togglePlayer && widgetData.togglePlayer[squad.id]">
                                <div class="content-box">
                                  <div class="raid-info">
                                    <div class="raid-count total-raid">
                                      <span class="count">{{ squad.raids.total }}</span>
                                      <span class="label">Raids</span>
                                    </div>
                                    <div class="raid-count successful-raid">
                                      <span class="count" v-if="squad.raids.total">
                                        {{ Math.round((squad.raids.successful * 100) / squad.raids.total) }}%
                                      </span>
                                      <span class="count" v-else>0%</span>
                                      <span class="label">Successful Raids</span>
                                    </div>
                                  </div>
                                  <div class="raids-graph">
                                    <div class="graph-listing">
                                      <div class="graph-item successful">
                                        <div class="graph-wrap">
                                          <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                                            <circle
                                              stroke-dasharray=" 100,100"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="bottom-circle"
                                            ></circle>
                                            <circle
                                              :stroke-dasharray="squad.raids.successful + ',100'"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="top-circle"
                                            ></circle>
                                          </svg>
                                          <span class="graph-count">{{ squad.raids.successful }}</span>
                                        </div>
                                        <span class="graph-label">Successful Raids</span>
                                      </div>
                                      <div class="graph-item unsuccessful">
                                        <div class="graph-wrap">
                                          <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                                            <circle
                                              stroke-dasharray=" 100,100"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="bottom-circle"
                                            ></circle>
                                            <circle
                                              :stroke-dasharray="squad.raids.unsuccessful + ',100'"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="top-circle"
                                            ></circle>
                                          </svg>
                                          <span class="graph-count">{{ squad.raids.unsuccessful }}</span>
                                        </div>
                                        <span class="graph-label">Unsuccessful Raids</span>
                                      </div>
                                      <div class="graph-item empty">
                                        <div class="graph-wrap">
                                          <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                                            <circle
                                              stroke-dasharray=" 100,100"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="bottom-circle"
                                            ></circle>
                                            <circle
                                              :stroke-dasharray="squad.raids.Empty + ',100'"
                                              stroke-linecap="square"
                                              fill="none"
                                              cx="19.5"
                                              cy="20"
                                              r="15.91549431"
                                              class="top-circle"
                                            ></circle>
                                          </svg>
                                          <span class="graph-count">{{ squad.raids.Empty }}</span>
                                        </div>
                                        <span class="graph-label">Empty Raids</span>
                                      </div>
                                    </div>
                                    <div class="raid-sequence" v-if="squad.events">
                                      <div class="head">
                                        <span class="title">Raid Sequence</span>
                                      </div>
                                      <div class="body">
                                        <div class="sequence-listing">
                                          <span
                                            class="sequence-item"
                                            v-for="event in squad.events"
                                            :class="{
                                              successful: event.event_id == 1,
                                              unsuccessful: event.event_id == 2,
                                              empty: event.event_id == 3,
                                            }"
                                          >
                                          </span>
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
              </div>
              <div class="playbyplay-tab-container" v-if="widgetData.defaulttab === widgetData.pbpTab">
                <div class="container-wrap">
                  <div class="sub-container-wrap" v-if="widgetData.commentaryData && widgetData.commentaryData.length">
                    <div class="playbyplay-list">
                      <div
                        class="playbyplay-item"
                        v-for="comm in widgetData.commentaryData"
                        :class="{
                          time: comm.event_id == 8,
                          'green-card': comm.event_id == 9,
                          'red-card': comm.event_id == 10,
                          substitution: comm.event_id == 5,
                        }"
                        :data-event-id="comm.event_id"
                      >
                        <div class="item-wrap">
                          <div class="col-one">
                            <span>{{ comm.score[0] }}-{{ comm.score[1] }}</span>
                          </div>
                          <div class="col-two">
                            <span v-if="comm.event_id == 8 || comm.event_id == 5 || comm.event_id == 9 || comm.event_id == 10" class="icon"></span>
                            <span v-else>{{ comm.minutes }}</span>
                          </div>

                          <div class="col-three" v-if="comm.event_id == 5">
                            <span class="text">{{ comm.event }} - ({{ comm.primaryTeam.name }})</span>
                            <div class="substitution-players-info">
                              <span class="player-info player-out">{{ comm.secondaryPlayer.name }} <span class="status out">(Out)</span></span>
                              <span class="player-info player-in">{{ comm.primaryPlayer.name }} <span class="status in">(IN)</span></span>
                            </div>
                          </div>
                          <div class="col-three" v-else>
                            <span class="text" v-if="comm.event">{{ comm.event }}</span>

                            <span class="note" v-if="comm.event_id == 8 && comm.primaryTeam && comm.primaryTeam.name">
                              Timeout taken by ({{ comm.primaryTeam.name }})
                            </span>
                            <span class="note" v-else> {{ comm.event_text }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="matchstats-tab-container" v-if="widgetData.defaulttab === widgetData.statTab">
                <div class="container-wrap">
                  <div class="sub-container-wrap">
                    <div class="match-teams">
                      <div class="team team-a">
                        <img
                          :onerror="'this.onerror=null;this.src=' + getDefaultFlag()"
                          :data-src="getDefaultFlag()"
                          :src="getTeamFlag({ id: widgetData.gameData.teams.team[0].id })"
                          class="team-logo"
                          importance="low"
                        />
                      </div>
                      <span class="sub-title">Key Stats</span>
                      <div class="team team-b">
                        <img
                          :onerror="'this.onerror=null;this.src=' + getDefaultFlag()"
                          :data-src="getDefaultFlag()"
                          :src="getTeamFlag({ id: widgetData.gameData.teams.team[1].id })"
                          class="team-logo"
                          importance="low"
                        />
                      </div>
                    </div>
                    <div class="match-representation">
                      <div class="graph-listing">
                        <div class="graph-item team-a">
                          <div class="graph-wrap">
                            <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                              <circle
                                stroke-dasharray=" 100,100"
                                stroke-linecap="square"
                                fill="none"
                                cx="19.5"
                                cy="20"
                                r="15.91549431"
                                class="bottom-circle"
                              ></circle>
                              <circle
                                :stroke-dasharray="widgetData.gameData.teams.team[0].stats.points.total + ',100'"
                                stroke-linecap="square"
                                fill="none"
                                cx="19.5"
                                cy="20"
                                r="15.91549431"
                                class="top-circle"
                              ></circle>
                            </svg>
                            <span class="graph-count">{{ widgetData.gameData.teams.team[0].stats.points.total }}%</span>
                          </div>
                          <span class="graph-label">Points %</span>
                        </div>
                        <div class="graph-item team-b">
                          <div class="graph-wrap">
                            <svg viewBox="0 0 38.83098862 38.83098862" xmlns="http://www.w3.org/2000/svg" class="circle-svg">
                              <circle
                                stroke-dasharray=" 100,100"
                                stroke-linecap="square"
                                fill="none"
                                cx="19.5"
                                cy="20"
                                r="15.91549431"
                                class="bottom-circle"
                              ></circle>
                              <circle
                                :stroke-dasharray="widgetData.gameData.teams.team[1].stats.points.total + ',100'"
                                stroke-linecap="square"
                                fill="none"
                                cx="19.5"
                                cy="20"
                                r="15.91549431"
                                class="top-circle"
                              ></circle>
                            </svg>
                            <span class="graph-count">{{ widgetData.gameData.teams.team[1].stats.points.total }}%</span>
                          </div>
                          <span class="graph-label">Points %</span>
                        </div>
                      </div>
                      <div class="team-progressbar">
                        <div class="progressbar-listing">
                          <div class="progressbar-item">
                            <div class="progress-wrap">
                              <div class="label-wrap">
                                <span class="label">{{ widgetData.gameData.teams.team[0].stats.points.raid_points.total }}</span>
                                <span class="label">RAID POINTS</span>
                                <span class="label">{{ widgetData.gameData.teams.team[1].stats.points.raid_points.total }}</span>
                              </div>
                              <div class="progress-view">
                                <div class="team-bar team-a-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.raid_points.total,
                                        widgetData.gameData.teams.team[1].stats.points.raid_points.total,
                                        'a'
                                      ) +
                                      '%;'
                                    "
                                  ></span>
                                </div>
                                <div class="team-bar team-b-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.raid_points.total,
                                        widgetData.gameData.teams.team[1].stats.points.raid_points.total,
                                        'b'
                                      ) +
                                      '%;'
                                    "
                                  ></span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="progressbar-item">
                            <div class="progress-wrap">
                              <div class="label-wrap">
                                <span class="label">{{ widgetData.gameData.teams.team[0].stats.points.tackle_points.total }}</span>
                                <span class="label">TACKLE POINTS</span>
                                <span class="label">{{ widgetData.gameData.teams.team[1].stats.points.tackle_points.total }}</span>
                              </div>
                              <div class="progress-view">
                                <div class="team-bar team-a-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.tackle_points.total,
                                        widgetData.gameData.teams.team[1].stats.points.tackle_points.total,
                                        'a'
                                      ) +
                                      '%;'
                                    "
                                  ></span>
                                </div>
                                <div class="team-bar team-b-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.tackle_points.total,
                                        widgetData.gameData.teams.team[1].stats.points.tackle_points.total,
                                        'b'
                                      ) +
                                      '%;'
                                    "
                                  ></span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="progressbar-item">
                            <div class="progress-wrap">
                              <div class="label-wrap">
                                <span class="label">{{ widgetData.gameData.teams.team[0].stats.points.all_out }}</span>
                                <span class="label">ALL OUT POINTS</span>
                                <span class="label">{{ widgetData.gameData.teams.team[1].stats.points.all_out }}</span>
                              </div>
                              <div class="progress-view">
                                <div class="team-bar team-a-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.all_out,
                                        widgetData.gameData.teams.team[1].stats.points.all_out,
                                        'a'
                                      ) +
                                      '%;'
                                    "
                                  ></span>
                                </div>
                                <div class="team-bar team-b-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.all_out,
                                        widgetData.gameData.teams.team[1].stats.points.all_out,
                                        'b'
                                      ) +
                                      '%;'
                                    "
                                  ></span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="progressbar-item">
                            <div class="progress-wrap">
                              <div class="label-wrap">
                                <span class="label">{{ widgetData.gameData.teams.team[0].stats.points.extras }}</span>
                                <span class="label">EXTRA POINTS</span>
                                <span class="label">{{ widgetData.gameData.teams.team[1].stats.points.extras }}</span>
                              </div>
                              <div class="progress-view">
                                <div class="team-bar team-a-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.extras,
                                        widgetData.gameData.teams.team[1].stats.points.extras,
                                        'a'
                                      ) +
                                      '%;'
                                    "
                                  ></span>
                                </div>
                                <div class="team-bar team-b-bar">
                                  <span
                                    :style="
                                      'width: ' +
                                      getPercent(
                                        widgetData.gameData.teams.team[0].stats.points.extras,
                                        widgetData.gameData.teams.team[1].stats.points.extras,
                                        'b'
                                      ) +
                                      '%;'
                                    "
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTeamFlag, getInningsScore } from "./../../sdk/WidgetLibrary/utils";

export default {
  props: {
    widgetData: Object,
    selectedLanguage: String,
    translations: Object,
    imagePaths: Object,
    winstonLogger: Object,
  },
  methods: {
    getTeamFlag: function (participantsObj, size) {
      return getTeamFlag(this.winstonLogger, this.imagePaths, participantsObj, 3);
    },
    getDefaultFlag: function (size) {
      return getTeamFlag(this.winstonLogger, this.imagePaths, "", size, 3);
    },
    goalScorer: function (goals) {
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
    getAPScore: function (widgetData, type) {
      let score = "";
      let nodeAttr = type === "agg" ? "aggregate_score" : "shootout_score";
      if (widgetData.teams[0][nodeAttr] !== "" && widgetData.teams[1][nodeAttr] !== "") {
        score = "(" + widgetData.teams[0][nodeAttr] + " " + type.toUpperCase() + " " + widgetData.teams[1][nodeAttr] + ")";
      }
      return score;
    },
    getMatchTime: function (widgetData) {
      let matchTime = "";
      if (widgetData.match_detail.is_completed || widgetData.match_detail.status_id == 5) {
        matchTime = "FT";
      } else if (widgetData.match_detail.status_id == 8) {
        matchTime = "HT";
      } else if (widgetData.match_detail.status_id == 39 || widgetData.match_detail.status_id == 9) {
        matchTime = "vs";
      } else if (widgetData.match_detail.clock) {
        matchTime = widgetData.match_detail.clock.minutes;
        if (widgetData.match_detail.clock.seconds > 0) {
          matchTime += 1;
        }
        if (widgetData.match_detail.clock.additional_minutes) {
          matchTime += "+" + widgetData.match_detail.clock.additional_minutes;
        }
        matchTime = matchTime + "'";
      }

      if ([3, 10, 4, 12].indexOf(widgetData.match_detail.status_id) != -1) {
        matchTime = "ET - " + matchTime;
      }
      if (widgetData.match_detail.status_id == 10) {
        matchTime = "ET - HT";
      }
      return matchTime;
    },
    statsProgress: function (widgetData, team, st, type) {
      if (widgetData.teams[team].stats.hasOwnProperty(st.parentKey) && widgetData.teams[team].stats[st.parentKey].hasOwnProperty(st.key)) {
        if (type === "style") {
          let total = widgetData.teams[0].stats[st.parentKey][st.key] + widgetData.teams[1].stats[st.parentKey][st.key];

          return (widgetData.teams[0].stats[st.parentKey][st.key] * 100) / total;
        } else return widgetData.teams[team].stats[st.parentKey][st.key];
      } else return "0";
    },
    getPlayerName: (name, type) => {
      return utils.getName(name, type);
    },
    getPercent: function (aValue, bValue, team) {
      aValue = aValue || 0;
      bValue = bValue || 0;

      var total = aValue + bValue;
      var perCent = 0;
      if (team == "a") {
        perCent = (aValue / total) * 100;
      }
      if (team == "b") {
        perCent = (bValue / total) * 100;
      }
      return perCent;
    },
    getPlayer: (name) => {
      if (name.indexOf(" ") !== -1) {
        let Nm = name.split(" ");
        return '<span class="fname"' + Nm[0] + ' </span><span class="lname">' + Nm[Nm.length - 1] + "</span>";
      } else {
        return '<span class="si-lastNm">' + name + "</span>";
      }
    },
  },
};
</script>
