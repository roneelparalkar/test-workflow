<template>
  <div
    widget-id="si-tracker-widget-layout-01"
    :class="[widgetData.extraClass]"
    class="waf-component widget-layout-01 si-waf-widget"
    v-if="!widgetData.err"
    :data-series="widgetData.seriesId"
    :extra-class="widgetData.extraClass"
  >
    <div class="layout-wrapper">
      <div class="waf-head">
        <div class="head-wrap">
          <h3 class="title">Cricket Tracker</h3>
          <ul class="head-tab">
            <li>
              <a href="">More</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="waf-body">
        <h4 class="tracker-header">
          <span>{{ getTourCustomName(widgetData.series, "full", widgetData.seriesName, "tours") + " Tracker" }}</span>
        </h4>
        <div class="tracker-body">
          <div class="tracker-row first-row">
            <div class="tracker-column left-column">
              <span class="column-label">Top Performers</span>
              <div class="content-list">
                <div class="content-item mostrun-block">
                  <div class="content-wrap">
                    <span class="label">Most runs</span>
                    <div class="content-block">
                      <span class="number">{{ widgetData.runs_off_the_bat.extra_info_obj.players.table_contents[0].value }}</span>
                      <div class="name-wrap">
                        <span class="first-name">{{
                          getName(widgetData.runs_off_the_bat.extra_info_obj.players.table_contents[0].name, "first")
                        }}</span>
                        <span class="last-name">
                          {{ getName(widgetData.runs_off_the_bat.extra_info_obj.players.table_contents[0].name, "last") }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="image-block">
                    <img
                      :src="getTeamFlag(widgetData.runs_off_the_bat.extra_info_obj.players.table_contents[0].team_id)"
                      alt=""
                      class="team-flag"
                      importance="low"
                    />
                  </div>
                </div>
                <div class="content-item mostwicket-block">
                  <div class="content-wrap">
                    <span class="label">Most wickets</span>
                    <div class="content-block">
                      <span class="number">{{ widgetData.wickets.extra_info_obj.players.table_contents[0].value }}</span>
                      <div class="name-wrap">
                        <span class="first-name">{{ getName(widgetData.wickets.extra_info_obj.players.table_contents[0].name, "first") }}</span>
                        <span class="last-name">{{ getName(widgetData.wickets.extra_info_obj.players.table_contents[0].name, "last") }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="image-block">
                    <img
                      :src="getTeamFlag(widgetData.wickets.extra_info_obj.players.table_contents[0].team_id)"
                      alt=""
                      class="team-flag"
                      importance="low"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="tracker-column middle-column">
              <div class="content-item totalrun-block">
                <div class="content-wrap">
                  <span class="column-label">Total Runs Scored</span>
                  <span class="number">{{ widgetData.runs_off_the_bat.title_value }}</span>
                </div>
                <div class="svg-block" id="wagon_wheel_container">
                  <div class="percent-text">
                    <span class="percent-item tt1">{{ widgetData.zone.fine_leg.table_contents[0].value }}</span>
                    <span class="percent-item tt2">{{ widgetData.zone.square_leg.table_contents[0].value }}</span>
                    <span class="percent-item tt3">{{ widgetData.zone.mid_wicket.table_contents[0].value }}</span>
                    <span class="percent-item tt4">{{ widgetData.zone.mid_on.table_contents[0].value }}</span>
                    <span class="percent-item tt5">{{ widgetData.zone.mid_off.table_contents[0].value }}</span>
                    <span class="percent-item tt6">{{ widgetData.zone.cover.table_contents[0].value }}</span>
                    <span class="percent-item tt7">{{ widgetData.zone.point.table_contents[0].value }}</span>
                    <span class="percent-item tt8">{{ widgetData.zone.third_man.table_contents[0].value }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="tracker-column right-column">
              <span class="column-label">Runs Of The Bat</span>
              <div class="content-item run-block graph-block">
                <div class="progressbar-list">
                  <div class="progressbar-item">
                    <div class="progress-wrap" :style="{ height: widgetData.scores_by_number['1s'].percent + '%' }">
                      <span class="progress-value">{{ widgetData.scores_by_number["1s"].value }}</span>
                      <span class="notation">1s</span>
                    </div>
                  </div>
                  <div class="progressbar-item">
                    <div class="progress-wrap" :style="{ height: widgetData.scores_by_number['2s'].percent + '%' }">
                      <span class="progress-value">{{ widgetData.scores_by_number["2s"].value }}</span>
                      <span class="notation">2s</span>
                    </div>
                  </div>
                  <div class="progressbar-item">
                    <div class="progress-wrap" :style="{ height: widgetData.scores_by_number['4s'].percent + '%' }">
                      <span class="progress-value">{{ widgetData.scores_by_number["4s"].value }}</span>
                      <span class="notation">4s</span>
                    </div>
                  </div>
                  <div class="progressbar-item">
                    <div class="progress-wrap" :style="{ height: widgetData.scores_by_number['6s'].percent + '%' }">
                      <span class="progress-value">{{ widgetData.scores_by_number["6s"].value }}</span>
                      <span class="notation">6s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div class="tracker-row second-row">
            <div class="content-block total-wickets">
              <span class="column-label">Total Wickets</span>
              <span class="number">{{ widgetData.wickets.title_value }}</span>
            </div>
            <div class="boundary-block content-block">
              <span class="column-label">Runs In Boundaries</span>
              <span class="number">{{ widgetData.runs_in_boundaries.title_value }}</span>
              <div class="circle-listing">
                <div class="circle-item circle-one">
                  <div class="circle-wrap">
                    <span class="top-text">4s</span>
                    <div class="small-circle"></div>
                    <span class="bottom-text">{{ widgetData.fours.title_value }}</span>
                  </div>
                </div>
                <div class="circle-item circle-two">
                  <div class="circle-wrap">
                    <span class="top-text">6s</span>
                    <div class="small-circle"></div>
                    <span class="bottom-text">{{ widgetData.sixes.title_value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div class="tracker-row third-row">
            <div class="points-listing">
              <div
                class="points-item caught-section"
                :class="[
                  {
                    'runOut-section': outType.title === 'run out',
                    'stumped-section': outType.title === 'stumped',
                    'lbw-section': outType.title === 'lbw',
                    'caught-section': outType.title === 'caught',
                    'bowled-section': outType.title === 'bowled',
                    'hit-wicket-section': outType.title === 'it wicket',
                    'obstructing-the-field-section': outType.title === 'obstructing the field'
                  }
                ]"
                :key="'pointsSection' + index"
                v-for="(outType, index) in widgetData.mode_of_dismissal.extra_info_obj.tournament.table_contents[0].info_table"
              >
                <div class="points-wrapper">
                  <svg viewBox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg" class="">
                    <circle
                      stroke-dasharray=" 100,100"
                      stroke-linecap="square"
                      fill="none"
                      cx="16.91549431"
                      cy="16.91549431"
                      r="15.91549431"
                      class="circle main"
                    ></circle>
                    <circle
                      :stroke-dasharray="outType.table_contents[2].value + ',100'"
                      stroke-linecap="square"
                      fill="none"
                      cx="16.91549431"
                      cy="16.91549431"
                      r="15.91549431"
                      class="circle highlight"
                    ></circle>
                  </svg>
                  <span class="svg-text">{{ outType.table_contents[0].value }}</span>
                </div>
                <span class="svg-label">{{ getCapitalizedLabel(outType.title) }}</span>
              </div>
            </div>
          </div>
          <hr />
          <div class="tracker-row fourth-row">
            <div class="data-points data-points-one">
              <div class="points-listing">
                <div class="points-item item-one">
                  <div class="tracker-container glider-contain">
                    <div class="tracker-wrapper glider-outs">
                      <div class="tracker-slide">
                        <div class="content-block">
                          <span class="number">{{ widgetData.run_outs.title_value }}</span>
                          <span class="points-label">Run Outs</span>
                        </div>
                      </div>
                      <div class="tracker-slide">
                        <div class="content-block">
                          <span class="number">{{ widgetData.stumpings.title_value }}</span>
                          <span class="points-label">Stumpings</span>
                        </div>
                      </div>
                      <div class="tracker-slide">
                        <div class="content-block">
                          <span class="number">{{ widgetData.direct_hits.title_value }}</span>
                          <span class="points-label">Direct Hits </span>
                        </div>
                      </div>
                    </div>
                    <div role="tablist" class="dots-outs"></div>
                  </div>
                </div>
                <div class="points-item item-two">
                  <div class="content-block">
                    <span class="number">{{ widgetData.duck_dismissals.title_value }}</span>
                    <span class="points-label">Duck Dismissals</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="data-points data-points-two">
              <div class="points-item">
                <div class="data-points-head">
                  <span class="points-label">Total Catches</span>
                  <span class="number">{{ widgetData.total_catches }}</span>
                </div>
                <div class="data-points-body">
                  <div class="catch-details">
                    <div class="catch-info taken-section">
                      <div class="catch-wrap">
                        <div class="catch-progressbar">
                          <span
                            :style="{
                              width: widgetData.catches.extra_info.info_table[0].table_contents[2].value + '%',
                              'background-color': '#0059C7'
                            }"
                          ></span>
                        </div>
                        <div class="label-section">
                          <span class="catch-rate">{{ widgetData.catches.extra_info.info_table[0].table_contents[2].value }}%</span>
                          <span class="catch-label">Taken</span>
                        </div>
                      </div>
                    </div>

                    <div class="catch-info dropped-section">
                      <div class="catch-wrap">
                        <div class="catch-progressbar">
                          <span
                            :style="{
                              width: widgetData.catches.extra_info.info_table[0].table_contents[3].value + '%',
                              'background-color': '#F27B34'
                            }"
                          ></span>
                        </div>
                        <div class="label-section">
                          <span class="catch-label">Dropped</span>
                          <span class="catch-rate">{{ widgetData.catches.extra_info.info_table[0].table_contents[3].value }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="data-points data-points-three">
              <div class="points-listing">
                <div class="points-item item-one">
                  <div class="content-block">
                    <span class="number">{{ widgetData.maiden_over.title_value }}</span>
                    <span class="points-label">Maiden Overs</span>
                  </div>
                </div>
                <div class="points-item item-two">
                  <div class="tracker-container glider-contain">
                    <div class="tracker-wrapper glider-extras">
                      <div class="tracker-slide">
                        <div class="content-block">
                          <span class="points-label">Extras</span>
                          <span class="number">{{ widgetData.wides.title_value }}</span>
                          <span class="points-label">Wides</span>
                        </div>
                      </div>
                      <div class="tracker-slide">
                        <div class="content-block">
                          <span class="points-label">Extras</span>
                          <span class="number">{{ widgetData.no_balls.title_value }}</span>
                          <span class="points-label">No balls</span>
                        </div>
                      </div>
                    </div>
                    <div role="tablist" class="dots-extras"></div>
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
export default {
  props: {
    widgetData: Object,
    winstonLogger: Object,
    imagePaths: Object
  },
  methods: {
    getTeamFlag(teamId, size) {
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
    },
    getTourCustomName(name, val) {
      return "";
    },
    getCapitalizedLabel(value) {
      return value
        .split(" ")
        .map(value => value.charAt(0).toUpperCase() + value.slice(1))
        .join(" ");
    }
  }
};
</script>

<style></style>
