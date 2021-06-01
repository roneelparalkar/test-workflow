//import render from "./../../../components/si-profile/widget-layout-01.vue";
//import Vue from "vue";
import VeeValidate from "vee-validate";
import { VueReCaptcha } from "vue-recaptcha-v3";
import { isNull, getCookieJSON, getDateTime, getTeamFlag } from "../../../sdk/WidgetLibrary/utils";
import { checkUserExist, getProfileUser, updateProfileUser, getSportsData, uploadProfile, sendOTP, verifyOTP } from "./loginregister.service";
import { Datetime } from "vue-datetime";
import "vue-datetime/dist/vue-datetime.min.css";

let mrkup = "";
let container = "";
function init() {
  initCaptcha();
  initValidator();
  hydration();
}

function hydration() {
  if (window.selector && window.markup) {
    // container = document.getElementById(window.selector);
    // container.innerHTML = ""
    mrkup = window.markup.replace(/\|\|\|/g, "'");
    initVue();
  }
}

function initVue() {
  let context = this;
  let vueInstance = new Vue({
    template: mrkup,
    el: "#profile-component",
    components: {
      datetime: Datetime
    },
    data() {
      return {
        gender: "",
        userFirstName: "",
        userLastName: "",
        name: "",
        email: "",
        userGuid: "",
        epoch_timestamp: "",
        token: "",
        dob: "",
        selectedSports: [],
        sports: [],
        disableEmail: true,
        userImage: "",
        reCaptchaResponse: "",
        captchaError: false,
        captchaErrorMsg:"",
        ifFormSubmitButtonDisable: false,
        termsAndConditions: true,
        subscribeForEmail: false,
        globalMsgDiv: "",
        isSubmitDisabled: false,
        disabled: false,
        isProfileImgLoader: false,
        image_path_for_update: "",
        maxDatetime: "",
        additional_user_data: {
          sports: []
        },
        otp: "",
        isEmailUsed: false,
        emailUsedError: "Email is already in use",
        showOTPField: false,
        isOtpSent: false,
        disabledOTPfield: false,
        isInvalidOtp: false,
        isOtpVerified: false,
        invalidOtpError: "",
        otpVerifiedMsg: "",
        isGlobalSuccesMsg: false,
        is_custom_image: "0",
        infoMsg: false,
        sportsbet_username: "",
        disableVerifyEmailButton: false,
        disableVerifyButton: false,
        emailVerifiedMsg: "",
        otpSentMsg: "",
        attemptExceeded: false,
        attemptExceededMsg: "",
        verifyOtpFirst:false,
        verifyOtpFirstMsg:""
      };
    },
    methods: {
      handleBlur(e){
        let ele = e.target.closest("div.form-group");        
        if(ele.classList.contains("input-highlight")){
          ele.classList.remove("input-highlight");
        }
      },
      getUserCookie() {
        return getCookieJSON("_URC");
      },
      getProfileData: async function() {
        let userCookie = this.getUserCookie();
        this.userGuid = userCookie.user_guid;
        let payLoad = {
          token: this.userGuid
        };
        let responseData = await getProfileUser(payLoad);
        if (!isNull(responseData) && !isNull(responseData.data) && !isNull(responseData.data.user)) {
          let { epoch_timestamp, token, email_id } = responseData.data;

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
          this.epoch_timestamp = epoch_timestamp;
          this.token = token;
          this.userFirstName = first_name;
          this.userLastName = last_name;
          this.email = email_id;
          if (isNull(this.email) || this.email.trim() == "") {
            this.disableEmail = false;
            this.isOtpVerified = false;
          } else {
            this.disableEmail = true;
            this.isOtpVerified = true;
          }
          // isNull(this.email) || this.email.trim() == "" ? (this.disableEmail = false) : (this.disableEmail = true);
          this.gender = gender;
          this.dob = dob;
          this.userImage = social_user_image == "" ? this.defaulImg : social_user_image;
          this.subscribeForEmail = subscribe_for_email;
          this.sportsbet_username = sportsbet_username;
          if (additional_user_data.sports != null) this.updateSelectedSports(additional_user_data.sports);
        } else if (responseData.data.status == "403" || responseData.data.status == "401" || responseData.data.status == "500") {
          location.href = "/";
        }
      },
      focusInput(field) {
        if (field == "email") {
          this.emailUsedError = "";
          this.verifyOtpFirstMsg="";
        }
      },
      getSportsData: async function() {
        let data = await getSportsData();
        if (data) this.sports = data.sports;
        this.getProfileData();
      },
      profileImageUpdate: function(e) {
        var reader = new FileReader();
        const fileType = e.target.files[0]["type"];
        const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
        if (!validImageTypes.includes(fileType)) {
          // invalid file type code goes here.
          console.log("Invalid Image File Type");
          return false;
        }
        this.isProfileImgLoader = true;
        let userCookie = this.getUserCookie();
        reader.onload = async event => {
          var objecttosend = {
            imageName: e.target.files[0].name,
            imageUrl: event.target.result,
            imageJson: "1",
            userguid: userCookie.user_guid
          };
          let islogin = "0";
          let res = await uploadProfile(objecttosend, islogin);
          if (!isNull(res)) {
            let imageName = res[0].imageName;
            let imagePath = res[0].imagePath;
            let imageDomain = res[0].imgdomain;
            if (!isNull(imageName) && !isNull(imagePath) && !isNull(imageDomain)) {
              this.userImage = imageDomain + imagePath + imageName;
              this.image_path_for_update = imagePath + imageName;
              // this.isImage = true
              this.is_custom_image = "1";
              this.imageDropdownAutoClose();
            }
            this.isProfileImgLoader = false;
          }
        };
        reader.readAsDataURL(e.target.files[0]);
      },
      imageActiveDropdown() {
        let ele = document.getElementById("user-photo");
        ele.classList.toggle("active");
      },
      imageDropdownAutoClose() {
        let ele = document.getElementById("user-photo");
        if (ele.classList.contains("active")) ele.classList.remove("active");
      },
      removePic() {
        this.userImage = window.defaultImg;
        this.image_path_for_update = "";
        this.is_custom_image = "1";
        this.imageDropdownAutoClose();
        // $(".upload input[type='file']").val("");
        document.getElementById("profileImage").value = "";
      },
      chkBoxChange: function(evt) {
        let curEle = evt.currentTarget;
        let entityId = curEle.getAttribute("data-sport-id");
        let isChecked = curEle.checked;
        //document.getElementsByClassName("checkbox-container").classList.add("active")
        this.handleCheckbox(entityId, isChecked);
      },
      async verifyEmailAddress(e) {
        // called on blur
        let valid = true;
        if (!this.disableEmail) {
          this.$validator.validateAll().then(async () => {
            const _errors = this.errors.items.filter(item => item.field === "loginEmail");

            if (_errors.length > 0) {
              valid = false;
            }
            if (valid) {
              this.disableVerifyEmailButton = true;
              let matchOptions = {
                id: "loginEmail", // if you have the id, otherwise its optional
                name: "loginEmail" // optional
              };

              let field = this.$validator.fields.find(matchOptions);
              if (field != undefined) {
                !field.reset();
                this.$validator.errors.remove(field.name, field.scope);
              }
              let queryParam = {
                email_id: this.email
              };
              let verifiedResponse = await checkUserExist(queryParam);
              if (!isNull(verifiedResponse) && !isNull(verifiedResponse.data)) {
                if (verifiedResponse.data.status == "1" && this.email != "") {
                  this.isEmailUsed = false;
                  this.showOTPField = true;
                  this.sendOtp();
                } else if (verifiedResponse.data.status == "0" && this.email != "") {
                  this.isEmailUsed = true;
                  this.emailUsedError= "Email is already in use"
                }
              }
              this.disableVerifyEmailButton = false;
            }
          });
        }
      },
      async sendOtp() {
        // called on blur
        let valid = true;
        if (!this.disableEmail && !this.isEmailUsed) {
          this.$validator.validateAll().then(async () => {
            const _errors = this.errors.items.filter(item => item.field === "loginEmail");

            if (_errors.length > 0) {
              valid = false;
            }
            if (valid) {
              let matchOptions = {
                id: "loginEmail", // if you have the id, otherwise its optional
                name: "loginEmail" // optional
              };

              let field = this.$validator.fields.find(matchOptions);
              if (field != undefined) {
                !field.reset();
                this.$validator.errors.remove(field.name, field.scope);
              }
              let postData = {
                data: {
                  type: 3,
                  email_id: this.email
                }
              };
              let verifiedResponse = await sendOTP(postData);
              if (!isNull(verifiedResponse) && !isNull(verifiedResponse.data)) {
                if (verifiedResponse.data.status == "1") {
                  this.isOtpSent = true;
                  this.otpSentMsg = "OTP is sent to your registered email address";
                  this.isInvalidOtp = false;
                } else {
                  this.isOtpSent = false;
                  this.isInvalidOtp = true;
                  this.invalidOtpError = verifiedResponse.data.message;
                }
              } else {
                this.isOtpSent = false;
                this.isInvalidOtp = true;
                this.invalidOtpError = verifiedResponse.data.message ? verifiedResponse.data.message : "OTP sent failed";
              }
            }
          });
        }
      },
      async verifyOtp(e) {
        // called on blur
        let valid = true;

        this.$validator.validateAll().then(async () => {
          const _errors = this.errors.items.filter(item => item.field === "otp");

          if (_errors.length > 0) {
            valid = false;
          }
          if (valid) {
            this.disableVerifyButton = true;
            let matchOptions = {
              id: "otp", // if you have the id, otherwise its optional
              name: "otp" // optional
            };

            let field = this.$validator.fields.find(matchOptions);
            if (field != undefined) {
              !field.reset();
              this.$validator.errors.remove(field.name, field.scope);
            }
            if (this.isOtpSent) {
              let postData = {
                data: {
                  type: 3,
                  email_id: this.email,
                  otp: this.otp
                }
              };
              let verifiedResponse = await verifyOTP(postData);
              if (!isNull(verifiedResponse) && !isNull(verifiedResponse.data)) {
                if (verifiedResponse.data.status == "1") {
                  this.isInvalidOtp = false;
                  this.isOtpVerified = true;
                  this.showOTPField = false;
                  this.otpSentMsg = "";
                  this.emailVerifiedMsg = "Email is verified";
                  this.disableEmail = true;
                  // this.otpVerifiedMsg = verifiedResponse.data.message
                  this.otpVerifiedMsg = "OTP is verified";
                } else {
                  if (verifiedResponse.data.status == "2") {
                    this.attemptExceeded = true;
                    this.disableEmail = true;
                    this.showOTPField = false;
                    this.otpSentMsg = "";
                    this.attemptExceededMsg = "Attempt exceeded";
                  }
                  this.isOtpVerified = false;
                  this.isInvalidOtp = true;
                  this.invalidOtpError = verifiedResponse.data.message;
                }
              }
            } else {
              this.isOtpVerified = false;
              this.isInvalidOtp = true;
              this.invalidOtpError = "OTP Sent Failed";
            }
            this.disableVerifyButton = false;
          }
        });
      },
      isNumber: function(evt) {
        var iKeyCode = evt.which ? evt.which : evt.keyCode;
        if (iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57)) {
          evt.preventDefault();
        } else {
          return true;
        }
      },
      handleCheckbox(entityId, isChecked) {
        let a = document.querySelector(".checkbox-container #chb_" + entityId).parentElement;
        if (entityId) {
          // console.log("Entity Id "+entityId);
          if (isChecked) {
            a.classList.add("active");
            let dataObj = this.sports.filter(o => o.entity_id == entityId);
            dataObj[0].leagues.map(o => o.teams.map(a => (a.isSelected = false)));
            this.selectedSports.push(dataObj[0]);
          } else {
            if (a.getElementsByClassName("active")) {
              a.classList.remove("active");
            }
            this.selectedSports = this.selectedSports.filter(o => o.entity_id != entityId);
          }
        }
      },
      getSelectedSport(id) {
        return this.selectedSports.filter(o => o.entity_id == id);
      },
      selectTeam(entId, leagueCode, teamId) {
        let selectedSportIndex = this.selectedSports.findIndex(x => x.entity_id == entId);
        let selectedLeague = this.selectedSports[selectedSportIndex].leagues.filter(o => o.league_code == leagueCode);
        selectedLeague[0].teams.map(o => {
          if (o.team_id == teamId)
            if (o.isSelected == false) {
              o.isSelected = true;
            } else {
              o.isSelected = false;
            }
        });
        // for making reactive use set method of vue
        this.$set(this.selectedSports, selectedSportIndex, this.selectedSports[selectedSportIndex]);
      },
      flagPath(entId, teamId) {
        if (entId && teamId) {
          let getselectedSport = this.getSelectedSport(entId);
          let sports = getselectedSport[0].sport_id;
          let flagUrlPath = getTeamFlag(false, window.webConfig.imagePaths, false, sports, teamId);
          // flagUrlPath = flagUrlPath.replace("{{team_id}}", teamId);
          // flagUrlPath = flagUrlPath.replace("{{img_ver}}", getselectedSport[0].img_ver);
          return flagUrlPath;
        } else {
          return "";
        }
      },
      updateProfile(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.globalMsgDiv="";
        this.$validator.validate().then(async () => {
          if (this.errors.items.length == 0) {
            await this.$recaptchaLoaded();
            // Execute reCAPTCHA with action "login".
            this.reCaptchaResponse = await this.$recaptcha("homepage");
            if (this.reCaptchaResponse == "") {
              this.captchaError = true
              this.captchaErrorMsg = "Captcha is required.";
              return;
            }
            if (!this.isOtpVerified) {
              //this.invalidOtpError = "OTP verification pending";
              this.verifyOtpFirst=true
              this.verifyOtpFirstMsg="OTP verification pending"
              return false;
            }
            this.isSubmitDisabled = true;
            if (!isNull(this.dob)) {
              this.dob = getDateTime(this.dob, "yyyy-mm-dd");
            }
            let additionalData = this.createAdditionUserData();
            this.additional_user_data = {
              sports: additionalData
            };

            let payLoad = {
              data: {
                otp: this.otp,
                user_guid: this.userGuid,
                token: this.token,
                epoch_timestamp: this.epoch_timestamp,
                email_id: this.email,
                user: {
                  social_user_image: this.image_path_for_update,
                  first_name: this.userFirstName,
                  last_name: this.userLastName,
                  dob: this.dob,
                  gender: this.gender,
                  additional_user_data: this.additional_user_data,
                  subscribe_for_email: this.subscribeForEmail,
                  sportsbet_username: this.sportsbet_username
                },
                is_custom_image: this.is_custom_image,
                captcha: this.reCaptchaResponse
              }
            };
            let responseData = await updateProfileUser(payLoad);
            if (!isNull(responseData) && !isNull(responseData.data)) {
              if (responseData.data.status === "1") {
                this.globalMsgDiv = "Your Profile has been updated Successfully.";
                this.isSubmitDisabled = false;
                this.isGlobalSuccesMsg = true;
              } else {
                this.globalMsgDiv = responseData.data.message;
                this.isSubmitDisabled = false;
              }
            }
          }
        });
      },
      fillSpanOutSelect(e) {
        let selectElement = e.target;
        selectElement.parentElement.querySelector(".select-title").innerHTML = selectElement.options[selectElement.selectedIndex].text;
      },
      createAdditionUserData() {
        let sports = [];
        this.selectedSports.map(o => {
          let sports_name = o.name;
          let sports_id = o.entity_id;
          let sports_entity_id = o.entity_id;
          let teams = [];
          let league_code = "";
          o.leagues.map(i => {
            league_code = i.league_code;
            i.teams.map(j => {
              if (j.isSelected == true) {
                let team_name = j.name;
                let team_id = j.team_id;
                let entity_id = j.entity_id;
                teams.push({
                  league_code,
                  team_id,
                  team_name,
                  entity_id
                });
              }
            });
          });
          if (teams.length > 0) {
            sports.push({
              sports_id,
              sports_entity_id,
              sports_name,
              teams
            });
          }
        });
        return sports;
      },
      updateSelectedSports(additionalData) {
        if (additionalData.length > 0) {
          additionalData.map(o => {
            // $(`#chb_${o.sports_entity_id}`).prop("checked", true);
            let cbox = document.getElementById("chb_" + o.sports_entity_id);
            cbox.checked = true;
            this.handleCheckbox(o.sports_entity_id, true);
            o.teams.map(i => {
              let league_code = i.league_code;
              let team_code = i.team_id;
              this.selectTeam(o.sports_entity_id, league_code, team_code);
            });
          });
        }
      },
      slideEle(leagueCode, direction) {
        //let eleId = `temaList-${leagueCode}`;
        let eleId = document.getElementById("temaList-" + leagueCode);
        let scroller = eleId.scrollLeft;
        let scrollOffset = direction == "left" ? -100 : +100;
        scroller = scroller + scrollOffset;
        eleId.scroll({
          left: scroller,
          behavior: "smooth"
        });
      },
    
    },
    mounted() {
      this.getSportsData();
      let userCookie = this.getUserCookie();
      if (userCookie && userCookie.status == "2") {
        this.infoMsg = true;
        this.focusInput('email');
      }
      if (!userCookie) {
        window.location.href = "/";
      }
    }
  });
}

// let el = document.querySelector("#profile-component");
// // el.innerHTML=""
// let vueInstance = new Vue(render);
// vueInstance.$mount(el);

//render instance mount
function initValidator() {
  const dictionary = {
    en: {
      messages: {
        required(fieldName) {
          return "Field is required";
        },
        email() {
          return "Invalid email";
        },
        is_not() {
          return "Field is required";
        },
        confirmed: function() {
          return "Confirmed password does not match";
        }
      }
    }
  };

  VeeValidate.Validator.localize(dictionary);
  Vue.use(VeeValidate);
}

function initCaptcha() {
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

window.onload = () => {
  window.loadJS(window.webConfig.vue, () => {
    init();
  });
};
