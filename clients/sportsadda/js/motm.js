import { getCookieJSON, isNull, getJsonData, postJsonData, commonReplacer, getQueryStringValue } from "../../../sdk/WidgetLibrary/utils";
const { motmDataParser } = require("./../../../sdk/WidgetLibrary/clientServerCommon.js");
import { getTeamFlag } from "./../../../sdk/WidgetLibrary/utils";
import { VueReCaptcha } from "vue-recaptcha-v3";
import VeeValidate from "vee-validate";

const motmModule = class {
  constructor() {
    this.widgetData = {};
    this.container = "";
    this.mrkup = "";
    this.entityId = "";
    this.imagePaths = window.webConfig.imagePaths;
    this.apis = window.webConfig ? window.webConfig.motm : {};
  }
  loadCaptcha() {
    Vue.use(VueReCaptcha, {
      siteKey: window.webConfig.captchaKey,
      loaderOptions: {
        useRecaptchaNet: true,
        explicitRenderParameters: {
          badge: "bottomleft"
        }
      }
    });
  }
  loadValidator() {
    const dictionary = {
      en: {
        messages: {
          required: function (fieldName) {
            return "Field is required";
          },
          email: function () {
            return "Invalid email";
          },
          is_not: function () {
            return "Field is required";
          }
        }
      }
    };
    VeeValidate.Validator.localize(dictionary);
    Vue.use(VeeValidate);
  }

  init() {
    window.checkIncompleteProfile();
    this.loadCaptcha();
    this.loadValidator();
    this.hydration();

  }
 
  hydration() {
    if (window.selector && window.markup) {
      this.container = document.getElementById(window.selector);
      this.mrkup = window.markup.replace(/\|\|\|/g, "'");
      this.getMotmData()
        .then(parsedData => {
          this.widgetData = parsedData;
          this.widgetData.isWinnerDeclared = false;         
          this.initVue();
        })
        .catch(function (err) {
          console.log("Error while getwidgetdata", err);
        });
    }
  }
  getUserCookie() {
    let user = getCookieJSON("_URC");
    if (!isNull(user) && !isNull(user.user_guid)) {
      return user.user_guid;
    }
    return "";
  }
  getMotmData() {
    this.entityId = document.getElementById("man_of_the_match").getAttribute("data-poll-id");
    let valuesToReplace = {
      ENTITY_ID: this.entityId,
      SPGNNUM: "1",
      SITEM: "1",
      USER_GUID: this.getUserCookie()
    };

    let api = this.apis.poll;
    api = commonReplacer({ urlObj: api, valuesToReplace });

    return new Promise(async (resolve, reject) => {
      let response = await getJsonData(api);
      response.is_motm = true;
      response = motmDataParser(response, { isServer: false, imgVersion: window.imgVersion });
      resolve(response);
    });
  }

  initVue() {
    let context = this;
    let vueInstance = new Vue({
      template: this.mrkup,
      el: "#man_of_the_match",
      data: this.widgetData,
      mounted() {
        let user = getCookieJSON("_URC");
        if (!isNull(user) && !isNull(user.user_guid)) {
          this.userGuid = user.user_guid;
          this.isLogined = true;
          this.displayLogin = false;
        } else {
          this.userGuid = "";
          this.displayLogin = true;
          this.isblinker = true;
          setTimeout(() => {
            this.isblinker = false;
          }, 1500);
        }
        this.entityId = context.entityId;
        this.setAllPageData();
        let webview = getQueryStringValue("webview");
        if (webview == "true") {
          document.querySelector(".share-options").style.display = "none";
        }
      },
      methods: {
        getTeamName(key) {
          return this.pollData[0].pollDescParsed[key];
        },
        getUserCookie() {
          return getCookieJSON("_URC");
        },
        getTeamFlag: function (teamId, size) {
          return getTeamFlag(false, context.imagePaths, {}, 1, teamId);
        },
        getProfileData: async function () {
          let userCookie = this.getUserCookie();
          if (this.isLogined) {
            this.isLeaderBoardLoader = true;
            this.userGuid = userCookie.user_guid;

            let payLoad = {
              token: this.userGuid
            };
            let responseData = await getJsonData(window.location.origin + "/" + window.webConfig.profile.getProfileUser, payLoad);
            if (!isNull(responseData) && !isNull(responseData.data)) {
              let { epoch_timestamp, token, email_id, is_custom_image } = responseData.data;
              let {
                first_name,
                last_name,
                gender,
                dob,
                social_user_image,
                subscribe_for_email,
                additional_user_data,
                sportsbet_username
              } = responseData.data.user;
              this.profileData.epoch_timestamp = epoch_timestamp;
              this.profileData.token = token;
              this.profileData.userFirstName = first_name;
              this.profileData.userLastName = last_name;
              this.profileData.email = email_id;
              this.profileData.is_custom_image = is_custom_image;

              this.profileData.gender = gender;
              this.profileData.dob = dob;
              this.profileData.userImage = social_user_image == "" ? context.defaulImg : social_user_image;
              this.profileData.subscribeForEmail = subscribe_for_email;
              this.profileData.additional_user_data = additional_user_data;
              this.profileData.sportsbet_username = sportsbet_username;

              isNull(this.profileData.sportsbet_username) || this.profileData.sportsbet_username.trim() == ""
                ? (this.sbUsernameExists = false)
                : (this.sbUsernameExists = true);
            } else if (responseData.data.status == "403" || responseData.data.status == "401" || responseData.data.status == "500") {
              location.href = "/";
            }

            this.isLeaderBoardLoader = false;
          }
        },
        async updateProfile(e) {
          let userCookie = this.getUserCookie();
          if (this.isLogined) {
            this.isLeaderBoardLoader = true;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            this.$validator.validate().then(async () => {
              if (this.errors.items.length == 0) {
                await this.$recaptchaLoaded();
                // Execute reCAPTCHA with action "login".
                let reCaptchaResponse = await this.$recaptcha("homepage");
                if (reCaptchaResponse == "") {
                  this.profileData.captchaError = "Please fill captcha.";
                  return;
                }
                let payLoad = {
                  data: {
                    // otp: this.profileData.otp,
                    user_guid: this.userGuid,
                    token: this.profileData.token,
                    epoch_timestamp: this.profileData.epoch_timestamp,
                    email_id: this.profileData.email,
                    user: {
                      social_user_image: this.profileData.image_path_for_update,
                      first_name: this.profileData.userFirstName,
                      last_name: this.profileData.userLastName,
                      dob: this.profileData.dob,
                      gender: this.profileData.gender,
                      additional_user_data: this.profileData.additional_user_data, //
                      subscribe_for_email: this.profileData.subscribeForEmail,
                      sportsbet_username: this.profileData.sportsbet_username
                    },
                    is_custom_image: this.profileData.is_custom_image,
                    captcha: reCaptchaResponse
                  }
                };

                let responseData = await postJsonData(window.webConfig.profile.updateProfileUser, payLoad);

                if (!isNull(responseData) && !isNull(responseData.data)) {
                  if (responseData.data.status === "1") {
                    this.profileData.globalMsgDiv = "Your Profile has been updated Successfully.";
                    this.sbUsernameExists = true;
                  } else {
                    this.profileData.globalMsgDiv = responseData.data.message;
                    this.profileData.isSubmitDisabled = false;
                  }
                }
              }
            });
            this.isLeaderBoardLoader = false;
          }
        },
        focususername() {
          if (this.profileData.sportsbet_username == "") {
            this.disableBtn = true;
          } else {
            this.disableBtn = false;
          }
        },

        getOption() {
          return this.pollData.map(el => {
            return {
              value: el.pollid,
              text: el.pollDesParsed.optionName
            };
          });
        },
        setAllPageData() {
          let activePollData = this.pollData.filter(el => el.pollDesParsed.is_active == "1");
          this.selectedOption = {};
          if (activePollData.length > 0) {
            this.selectedOption.id = activePollData[0].pollid;
            this.selectedOption.text = activePollData[0].pollDesParsed.optionName;
            this.isEventActive = true;
          } else {
            this.selectedOption.id = this.pollData[0].pollid;
            this.selectedOption.text = this.pollData[0].pollDesParsed.optionName;
          }
          let selectedPollId = this.selectedOption.id;
          let pollData = this.pollData.filter(el => el.pollid == selectedPollId);
          let activePoll = pollData[0].pollDesParsed.is_active;

          if (activePoll == "1") {
            this.isEventActive = true;
            this.isDisablePlayerInfo = false;
          } else {
            this.isEventActive = false;
            this.isDisablePlayerInfo = true;
          }
          let currentPollData = pollData[0].poll_option;

          // this.availableCoins = parseInt(pollData[0].pollDesParsed.total_coins)
          // this.coins_multiple_of = parseInt(pollData[0].pollDesParsed.coins_multiple_of)

          // let hid = pollData[0].pollDesParsed.Matchdetail.Team_Home
          // let aid = pollData[0].pollDesParsed.Matchdetail.Team_Away
          // this.home_team_img_path = `/static-assets/wl-dev/cricket/flags/${hid}.png?v=${window.teamImg}`
          // this.away_team_img_path = `/static-assets/wl-dev/cricket/flags/${aid}.png?v=${window.teamImg}`
          // this.total_earned_points = pollData[0].earned_points
          // this.is_poll_submitted = pollData[0].is_poll_submitted
          this.homeTeam = currentPollData.filter(el => el.option.team_id == this.hid);
          this.awayTeam = currentPollData.filter(el => el.option.team_id == this.aid);
          // this.start_date = pollData[0].pollDesParsed.start_date
          // this.end_date = pollData[0].pollDesParsed.end_date
          let totalSubCoins = 0;
          this.homeTeam.forEach(el => {
            el.score = el.coins > 0 ? el.coins / this.coins_multiple_of : 0;
            if (el.is_ans > 0) {
              this.winnerTeam = "team1";
              this.isWinnerDeclared = true;
            }
            totalSubCoins = totalSubCoins + el.coins;
            this.isPlayerActive(el);
            this.isInputActive(el);
          });
          this.awayTeam.forEach(el => {
            el.score = el.coins > 0 ? el.coins / this.coins_multiple_of : 0;
            if (el.is_ans > 0) {
              this.winnerTeam = "team2";
              this.isWinnerDeclared = true;
            }
            totalSubCoins = totalSubCoins + el.coins;
            this.isPlayerActive(el);
            this.isInputActive(el);
          });

          this.toshowSubmitbutton = false;
          if (this.isEventActive) {
            this.availableCoins = this.availableCoins - totalSubCoins;

            this.timerEvent();
          } else {
            this.availableCoins = 0;
            this.postInterval();
          }
          if (this.winnerTeam == "") {
            this.winnerTeam = "team1";
          }
          this.activeTab(this.winnerTeam);
          // if (this.winnerTeam == "team1") {
          //   this.homeTeam.sort((a, b) => b.is_ans - a.is_ans);
          // } else {
          //   this.awayTeam.sort((a, b) => b.is_ans - a.is_ans);
          // }
          this.winnerTeam = "";
          // this.activeTab('team1')
        },
        isPlayerActive(el) {
          if (this.isEventActive == true) {
            if (this.is_poll_submitted == 1) {

              if (el.score > 0) {
                el.playerActive = true;
                el.disabledPlayer = false;
              } else {
                el.playerActive = false;
                el.disabledPlayer = true
              }
            } else if (this.is_poll_submitted == 0) {
              el.disabledPlayer = false;
              if (el.score > 0) {
                el.playerActive = true;
              } else {
                el.playerActive = false;
              }
            }
          } else if (this.isEventActive == false) {
            if (this.isWinnerDeclared) {
              if (el.is_ans == 0) {
                el.disabledPlayer = true;
                el.playerActive = false;
                el.is_winner = false;
              } else {
                el.disabledPlayer = false;
                el.playerActive = true;
                el.is_winner = true;
              }
            } else {
              el.is_winner = false;
              if (this.is_poll_submitted == 1) {
                if (el.score > 0) {
                  el.disabledPlayer = false;
                  el.playerActive = true;
                }
                else {
                  el.disabledPlayer = true;
                  el.playerActive = false;
                }
              }
              else if (this.is_poll_submitted == 0) {
                el.disabledPlayer = true;
                el.playerActive = false;
              }
            }
          }
        },
        isSubmitActive() {
          if (this.isLogined == false || this.isEventActive == false) {
            this.toshowSubmitbutton = false;
          } else if (this.isEventActive == true && this.isLogined == true) {
            if (this.is_poll_submitted == 1) {
              this.toshowSubmitbutton = false;
            } else if (this.is_poll_submitted == 0) {
              if (this.availableCoins < 100) {
                this.toshowSubmitbutton = true;
              } else {
                this.toshowSubmitbutton = false;
              }
            }
          }
        },
        isInputActive(el) {
          if (this.isLogined == false || this.isEventActive == false) {
            el.btnDisabledAdd = true;
            el.btnDisabledSub = true;
          } else if (this.isLogined == true && this.isEventActive == true && this.is_poll_submitted == 1) {
            el.btnDisabledAdd = true;
            el.btnDisabledSub = true;
          } else if (this.isLogined == true && this.isEventActive == true && this.is_poll_submitted == 0) {
            el.btnDisabledAdd = false;
            el.btnDisabledSub = false;
          }
        },
        updateAddPayload(item) {
          const i = this.submitPollOption.findIndex(el => el.option_id === item.option_id);

          if (i > -1) this.submitPollOption[i] = item;
          else this.submitPollOption.push(item);
        },
        updateSubPayload(item) {
          const i = this.submitPollOption.findIndex(el => el.option_id === item.option_id);
          if (i > -1) this.submitPollOption[i] = item;
          const j = this.submitPollOption.findIndex(el => el.coins === 0);
          if (j > -1) this.submitPollOption.splice(j, 1);
        },
        onAdd(e) {
          let currentTarget = e.currentTarget;
          let pollOptionid = currentTarget.getAttribute("data-playerid");
          let teamType = currentTarget.getAttribute("data-teamtype");
          if (teamType == "home") {
            this.homeTeam.map(el => {
              if (el.poll_option_id == pollOptionid && el.score < this.coins_multiple_of && this.availableCoins != 0) {
                el.score = el.score + 1;
                this.isPlayerActive(el);
                this.availableCoins = this.availableCoins - this.coins_multiple_of;
                this.updateAddPayload({ option_id: pollOptionid, coins: el.score * this.coins_multiple_of });
              }
            });
          } else if (teamType == "away") {
            this.awayTeam.map(el => {
              if (el.poll_option_id == pollOptionid && el.score < this.coins_multiple_of && this.availableCoins != 0) {
                el.score = el.score + 1;
                this.availableCoins = this.availableCoins - this.coins_multiple_of;
                this.isPlayerActive(el);
                this.updateAddPayload({ option_id: pollOptionid, coins: el.score * this.coins_multiple_of });
              }
            });
          }
          if (typeof this.submitPollOption !== "undefined" && this.submitPollOption.length > 0) {
            this.toshowSubmitbutton = true;
          } else {
            this.toshowSubmitbutton = false;
          }
        },
        onSub(e) {
          let currentTarget = e.currentTarget;
          let pollOptionid = currentTarget.getAttribute("data-playerid");
          let teamType = currentTarget.getAttribute("data-teamtype");
          if (teamType == "home") {
            this.homeTeam.map(el => {
              if (el.poll_option_id == pollOptionid && el.score > 0) {
                el.score = el.score - 1;
                this.isPlayerActive(el);
                this.availableCoins = this.availableCoins + this.coins_multiple_of;
                this.updateSubPayload({ option_id: pollOptionid, coins: el.score * this.coins_multiple_of });
              }
            });
          } else if (teamType == "away") {
            this.awayTeam.map(el => {
              if (el.poll_option_id == pollOptionid && el.score > 0) {
                el.score = el.score - 1;
                this.isPlayerActive(el);
                this.availableCoins = this.availableCoins + this.coins_multiple_of;
                this.updateSubPayload({ option_id: pollOptionid, coins: el.score * this.coins_multiple_of });
              }
            });
          }
          if (typeof this.submitPollOption !== "undefined" && this.submitPollOption.length > 0) {
            this.toshowSubmitbutton = true;
          } else {
            this.toshowSubmitbutton = false;
          }
        },
        openLogin() {
          let webview = getQueryStringValue("webview");
          let apploginredirect = getQueryStringValue("apploginredirect");
          if (webview == "true" && apploginredirect == "true") {
            location.href = "/applogin?webview=true";
          } else {
            document.querySelectorAll(".signInIcon")[0].click();
          }
        },
        async submitPoll() {
          if (this.sbUsernameExists) {

            if (this.is_poll_submitted == 0 && this.submitPollOption.length > 0 && this.isEventActive == true) {
              this.isLeaderBoardLoader = true;
              let polloptionData = this.submitPollOption;
              let payLoad = {
                data: {
                  poll_id: this.selectedOption.id,
                  polloption: polloptionData,
                  user_guid: this.userGuid
                }
              };

              this.isloading = true;
              let responseData = await postJsonData(context.apis.submitPoll, payLoad);

              if (!isNull(responseData.content)) {
                this.isloading = false;
                this.toshowSubmitbutton = false;
                this.is_poll_submitted = 1;
                this.generateImage();

                context
                  .getMotmData()
                  .then(parsedData => {
                    context.widgetData = parsedData;
                    context.widgetData.isWinnerDeclared = false;
                    Object.keys(context.widgetData.pollData).forEach(key => {
                      vueInstance._data[key] = context.widgetData.pollData[key];
                    });
                  })
                  .catch(function (err) {
                    console.log("Error while initpoll after submit", err);
                  });

                this.homeTeam.forEach(el => {
                  this.isPlayerActive(el);
                  this.isInputActive(el);
                });
                this.awayTeam.forEach(el => {
                  this.isPlayerActive(el);
                  this.isInputActive(el);
                });

              }
            }
            // this.isLeaderBoardLoader = false;

          }
        },
        closePopup() {
          if (this.toShowSubmitPopup) {
            document.getElementsByTagName("body")[0].classList.remove("no-scroll");

            this.toShowSubmitPopup = !this.toShowSubmitPopup;
          } else {
            this.generateImage();
          }
        },
        async closeRedeemPopup() {
          if (this.toShowRedeemPopup) {
            document.getElementsByTagName("body")[0].classList.remove("no-scroll");
            this.toShowRedeemPopup = false;
          } else {
            await this.getProfileData();
            document.getElementsByTagName("body")[0].classList.add("no-scroll");
            this.toShowRedeemPopup = true;
          }
        },
        proceedToSubmitPoll() {
          if (!this.sbUsernameExists) {
            this.isSportsBetFieldBlink = true;
            setTimeout(function () {
              this.isSportsBetFieldBlink = false;
            }, 1000);
          } else if (this.hitSubmitApi) {
            this.hitSubmitApi = false;
            this.toShowRedeemPopup = false;
            this.submitPoll();
          }
        },
        async submitPollBtnClick() {
          // await context
          //   .getMotmData()
          //   .then(parsedData => {
          //     context.widgetData = parsedData;
          //     Object.keys(context.widgetData.pollData).forEach(key => {
          //       vueInstance._data[key] = context.widgetData.pollData[key];
          //     });
          //   })
          //   .catch(function(err) {
          //     console.log("Error while initpoll after submit", err);
          //   });
          this.closeRedeemPopup();
          this.hitSubmitApi = true;
        },
        timerEvent() {
          const countdownTimer = new window.SIWidget.SIClass.CountDown(
            new Date(this.start_date),
            new Date(this.end_date),
            this.onCountDownRender,
            this.postInterval
          );
          if (countdownTimer.setEventActiveState(new Date(this.start_date), new Date(this.end_date))) {
            this.isEventActive = true;
            this.is_timerlock = false;
          }
          else {
            this.postInterval();
          }
        },
        onCountDownRender({ days, hours, minutes, seconds }) {
          let day = days;
          this.eventHour = hours;
          this.eventMin = minutes;
          this.eventSec = seconds;
        },
        postInterval() {
          this.isEventActive = false;
          this.toshowSubmitbutton = false;
          this.is_timerlock = true;
          this.eventHour = "--";
          this.eventMin = "--";
          this.eventSec = "--";
          this.homeTeam.forEach(el => {
            this.isInputActive(el);
            this.isPlayerActive(el);
          });
          this.awayTeam.forEach(el => {
            this.isInputActive(el);
            this.isPlayerActive(el);
          });
        },
        async initLeaderboard(isLoadmore, type) {
          this.isLeaderBoardLoader = true;
          if (isLoadmore == true) {
            this.page_count = (parseInt(this.page_count) + 1).toString();
          } else {
            this.page_count = "1";
            this.leader_board = [];
            this.user_leader_board = {};
            this.is_user_leader_board = false;
          }
          this.isLoadmoreDisable = true;
          let queryParam = {
            user_guid: this.userGuid,
            page_count: this.page_count,
            page_size: this.page_size,
            entity_id: context.entityId
          };
          if (type === 'daily') {
            queryParam.date = this.start_date.split("T")[0];
          }
          let leaderboardResp = await getJsonData(context.apis.leaderBoard, queryParam);

          if (!isNull(leaderboardResp.leader_board)) {
            let lb = leaderboardResp.leader_board;
            lb.forEach(el => {
              if (el.rank == 0) {
                el.rank = "-";
              }
            });
            if (isLoadmore == true) {
              this.leader_board = [...this.leader_board, ...lb];
            } else {
              this.leader_board = lb;
            }            
          }
          if (!isNull(leaderboardResp.user_leader_board)) {
            this.is_user_leader_board = true;
            let Ulb = leaderboardResp.user_leader_board;
            if (Ulb.rank == 0) {
              Ulb.rank = "-";
            }
            this.user_leader_board = Ulb;
          }
          // let totalCount = parseInt(leaderboardResp.total_page)

          if (this.page_count.toString() == leaderboardResp.page_count) {
            this.isLoadmoreDisable = true;
          } else {
            this.isLoadmoreDisable = false;
          }
          if (isNull(leaderboardResp.page_count)) {
            this.isLoadmoreDisable = true;
          }
          this.isLeaderBoardLoader = false;
        },
        toggleLeaderBoardType() {         
          if (this.leaderboardType) {
            this.leaderboardName = "Daily"
            this.toggleLeaderBoard("daily")
            this.toShowMatchLeaderBoard = true;
          }
          else {
            this.leaderboardName = "Overall"
            this.toggleLeaderBoard("overall")
            this.toShowMatchLeaderBoard = false;
          }
        },
        showLeaderBoard() {
          this.toShowLeaderBoard = !this.toShowLeaderBoard;
          this.buttonName = this.toShowLeaderBoard ? "Back to predictor" : "View leaderboard";
          if (this.toShowLeaderBoard) {
            this.leaderboardType = false;
            this.toggleLeaderBoardType();
          }
        },
        toggleLeaderBoard(type) {
          if (this.toShowLeaderBoard) {
            this.isLoadmoreDisable = false;
            this.initLeaderboard(false, type);
            let ele = document.querySelector(".match-details");
            let offset = ele.offsetTop;
            scroll({ top: offset, behavior: "smooth" });
            document.querySelector(".login-note") ? document.querySelector(".login-note").style.display = "none" : "";
          } else {
            document.querySelector(".login-note") ? document.querySelector(".login-note").style.display = "block" : "";
          }
        },
        activeTab(team) {
          this.currentActiveTab = team;
          if (window.isMobile) {
            if (this.currentActiveTab == "team1") {
              document.querySelector(".player-section1").style.display = "block";
              document.querySelector(".player-section2").style.display = "none";
            } else {
              document.querySelector(".player-section2").style.display = "block";
              document.querySelector(".player-section1").style.display = "none";
            }
          }
        },
        scrollUp() {
          if (!this.isLogined) {
            let ele = document.querySelector(".login-note");
            let offset = ele.offsetTop;
            scroll({ top: offset, behavior: "smooth" });
            this.isblinker = true;
            setTimeout(() => {
              this.isblinker = false;
            }, 1500);
          }
        },
        async generateImage() {
          if (this.userGuid) {
            let environment = window.location.host === "stg-sportsadda.sportz.io" ? "beta" : "prod";
            let valuesToReplace = {
              USER_GUID: context.getUserCookie(),
              OPTION_ID: this.selectedOption.id,
              TIMESTAMP: new Date().getTime(),
              BASE_URL: window.location.origin,
              ENV: environment
            };

            // const imageKey = commonReplacer({ urlObj: context.apis.imageKey, valuesToReplace });
            const imageKey = commonReplacer({ urlObj: context.apis.imageKey, valuesToReplace });
            const imgPath = commonReplacer({ urlObj: context.apis.imagePath, valuesToReplace });
            const templateUrl = context.apis.templateUrl.replace("{{BASE_URL}}", window.location.origin);

            let payloadData = {
              templateUrl,
              templateData: {
                homeTeam: this.pollData[0].pollDesParsed.homeTeam,
                awayTeam: this.pollData[0].pollDesParsed.awayTeam,
                homeTeamImg: window.location.origin + getTeamFlag(false, context.imagePaths, {}, 1, this.hid),
                awayTeamImg: window.location.origin + getTeamFlag(false, context.imagePaths, {}, 1, this.aid)
              }
            };
            let imagePayload = {
              url: context.apis.getHtmlUrl,
              format: "png",
              opType: "POST",
              postData: JSON.stringify(payloadData),
              bucket: "assets-sportsadda",
              key: imageKey,
              width: "200",
              height: "200"
            };

            try {
              this.isLeaderBoardLoader = true;
              // image generation
              const res = await fetch(context.apis.imgGeneratorPath, {
                method: "POST",
                mode: "no-cors",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(imagePayload)
              });
              if (res) {
                this.generatedImgPath = imgPath;
                if (!window.webConfig.modules.shareModule.moduleLoaded) {
                  window.loadJS("/static-assets/build/js/sharingModule.js", () => {
                    this.showSubmitPopup();
                  });
                }
              } else {
                console.log("error", res);
                this.generatedImgPath = "";

              }
              this.isLeaderBoardLoader = false;
            } catch (e) {
              console.log(e);
              this.generatedImgPath = "";
              this.isLeaderBoardLoader = false;
            }
            this.isLeaderBoardLoader = false;
          }
        },
        showSubmitPopup() {
          window.webConfig.modules.shareModule.moduleLoaded;
          this.toShowSubmitPopup = true;
          document.getElementsByTagName("body")[0].classList.add("no-scroll");
        },
        shareIt(e) {
          // e.preventDefault()
          // e.stopImmediatePropagation()
          let shareType = e.target.getAttribute("data-sharetype").toString();
          let shareObj = {
            url: getMetaContent("twitter:url"),
            title: getMetaContent("twitter:title"),
            description: getMetaContent("twitter:description"),
            imgPath: this.generatedImgPath
          };
          ShareUtil.share(shareType, shareObj);
        }
      }
    });
  }
};
window.onload = () => {
  let motmInstance = new motmModule();
  window.loadJS(motmInstance.apis.counterTimer);
  window.loadJS(window.webConfig.vue, () => {
    motmInstance.init();
  });
};
