<template>
  <div class="waf-component waf-profile waf-custom-section" id="profile-component">
    <div class="layout-wrapper">
      <section class="user-info">
        <div class="create-content">
          <div class="content">
            <h5 class="title">My profile</h5>
            <span class="info-text">Edit your profile</span>
          </div>
          <div class="user-photo" id="user-photo">
            <div class="photo-upload" :class="isProfileImgLoader ? 'loading' : ''">
              <div class="img-box" :class="isProfileImgLoader ? 'load' : ''">
                <img :src="userImage" alt="" class="lazy" importance="low" />
              </div>
              <div class="edit-image" @click="imageActiveDropdown()"></div>
            </div>
            <div class="upload-options">
              <ul class="option-list">
                <li class="upload">
                  Upload Photo
                  <input id="profileImage" type="file" data-update-type="custom-image" accept="image/*" v-on:change="profileImageUpdate" />
                </li>
                <li class="remove" @click="removePic()">Remove Profile Photo</li>
              </ul>
            </div>
          </div>
        </div>
        <form action="" class="custom-form registration-form">
          <div class="form-group flex50">
            <div class="form-element">
              <label for="firstName" class="control-label">First Name *</label>
              <input
                v-validate="'required'"
                v-model="userFirstName"
                type="text"
                id="fname"
                name="firstName"
                required="required"
                class="form-control"
                placeholder="Enter your first name"
              />
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'firstName'">{{ error.msg }}</span></span
              >
            </div>
          </div>
          <div class="form-group flex50">
            <div class="form-element">
              <label for="lname" class="control-label">Last Name *</label>
              <input
                v-model="userLastName"
                v-validate="'required'"
                type="text"
                id="lname"
                name="lastName"
                required="required"
                placeholder="Enter your last name"
              />
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'lastName'">{{ error.msg }}</span></span
              >
            </div>
          </div>
          <div class="form-group flex50">
            <div class="form-element">
              <label for="loginEmail" class="control-label">Email Address *</label>
              <input
                v-model="email"
                :readonly="disableEmail ? true : false"
                @blur="verifyEmailAddress()"
                v-validate="'required|email'"
                type="email"
                id="loginEmail"
                name="loginEmail"
                required="required"
                class="form-control"
                placeholder="Enter your email address"
              />
              <span class="errordiv" v-if="isEmailUsed">{{ emailUsedError }}</span>
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'loginEmail'">{{ error.msg }}</span></span
              >
              <span v-if="isOtpSent" class="info-msg" :class="[isOtpSent ? 'success' : '']">OTP is sent to your registered email address</span>
              <span class="info-msg" v-if="infoMsg"
                >The Fantasy game requires us to reach out to you in case you are one of the winners as outlined in the terms of the game. For this a
                valid email address is required where we can contact you. We may also reach out to you for any new contests that we may run and to
                provide the latest news, updates and scores.</span
              >
            </div>
          </div>
          <div class="form-group flex100" v-if="showOTPField">
            <div class="form-element">
              <label for="otp" class="control-label">OTP *</label>
              <input
                type="text"
                id="otp"
                name="otp"
                v-model="otp"
                class="form-control"
                @blur="verifyOtp"
                :minlength="6"
                :maxlength="6"
                @keypress="isNumber"
                v-validate="'required'"
                required
              />
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'otp'">{{ error.msg }}</span></span
              >
              <span class="errordiv" v-if="isInvalidOtp">{{ invalidOtpError }}</span>
              <span class="" v-if="!isInvalidOtp">{{ otpVerifiedMsg }}</span>
            </div>
          </div>
          <div class="form-group flex50">
            <div class="form-element">
              <img src="" class="sportsbet-logo" alt="" />
              <label for="lname" class="control-label">Sportsbet.io Username</label>
              <input v-model="sportsbet_username" type="text" name="lastName" required="required" placeholder="Enter your Sportsbet.io username" />
              <p class="note">enter your username <a href="" class="note-link">Link</a></p>
              <span class="errordiv"></span>
            </div>
          </div>
          <div class="form-group flex50">
            <label for="gender" class="control-label">Gender</label>
            <div class="radio-box-wrap">
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input v-model="gender" type="radio" value="male" id="male" name="gender" class="form-check-input" />
                  <span class="checkmark"></span> Male
                </label>
                <span class="errordiv"></span>
              </div>
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input v-model="gender" type="radio" value="female" id="female" name="gender" class="form-check-input" />
                  <span class="checkmark"></span> Female
                </label>
                <span class="errordiv"></span>
              </div>
              <div class="radio-box form-element">
                <label class="radio-container"
                  ><input v-model="gender" type="radio" value="other" id="other" name="gender" class="form-check-input" />
                  <span class="checkmark"></span> Other
                </label>
                <span class="errordiv" v-for="error in errors" :key="error.field">
                  <span v-if="error.field === 'gender'">{{ error.msg }}</span></span
                >
              </div>
            </div>
          </div>
          <div class="form-group flex50">
            <div class="form-element">
              <label for="dob" class="control-label">Date of birth </label>
              <datetime v-model="dob" name="dob" :max-datetime="maxDatetime" input-id="dob"></datetime>
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'dob'">{{ error.msg }}</span></span
              >
            </div>
          </div>
          <div class="form-group flex50 align-radio">
            <label for="newsletter" class="control-label">Subscribe to Newsletter</label>
            <div class="radio-box-wrap">
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input type="radio" v-model="subscribeForEmail" value="true" id="yes" name="newsletter" class="form-check-input" />
                  <span class="checkmark"></span> yes
                </label>
                <span class="errordiv"></span>
              </div>
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input type="radio" v-model="subscribeForEmail" value="false" id="no" name="newsletter" class="form-check-input" />
                  <span class="checkmark"></span> no
                </label>
                <span class="errordiv" v-for="error in errors" :key="error.field">
                  <span v-if="error.field === 'newsletter'">{{ error.msg }}</span></span
                >
              </div>
            </div>
          </div>
        </form>
      </section>
      <section class="fav-sport-selection">
        <div class="content-wrap">
          <div class="custom-head">
            <h4 class="sub-title">Select your favourite sport(s)</h4>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <div class="sports-detail">
                <div class="sports-list">
                  <div class="sports-item" :class="[sport.name.toLowerCase()]" :key="sport.entity_id" v-for="sport in sports">
                    <div class="item-wrap">
                      <div class="sports-image">
                        <img :src="sport.web_icon_url" alt="" class="lazy" importance="low" />
                      </div>
                      <div class="sports-select">
                        <form>
                          <label class="checkbox-container"
                            >{{ sport.name }}
                            <input type="checkbox" :id="'chb_' + sport.entity_id" :data-sport-id="sport.entity_id" @change="chkBoxChange($event)" />
                            <span class="checkmark"></span>
                          </label>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <div class="btn-section">
                  <button type="button" class="btn btn-action">Continue</button>
                </div> -->
              </div>
              <div class="league-section" v-if="selectedSports.length > 0">
                <div class="league-wrapper">
                  <h5 class="sub-title">Select favourite teams</h5>
                  <div class="sport-specific-team" :key="selectedSport.entity_id" v-for="selectedSport in selectedSports">
                    <div class="sport-category">
                      <h4 class="category-name">{{ selectedSport.name }}</h4>
                    </div>
                    <div class="league-listing">
                      <div class="league-wrap">
                        <div class="league-item" :key="selectedLeague.league_code" v-for="selectedLeague in selectedSport.leagues">
                          <h4 class="league-name">{{ selectedLeague.name }}</h4>
                          <div class="league-teams">
                            <ul class="team-list" :id="'temaList-' + selectedLeague.league_code">
                              <li
                                :class="['team', selectedTeam.isSelected ? 'active' : '']"
                                :key="selectedTeam.team_id"
                                @click="selectTeam(selectedSport.entity_id, selectedLeague.league_code, selectedTeam.team_id)"
                                v-for="selectedTeam in selectedLeague.teams"
                              >
                                <div class="team-wrap">
                                  <img :src="flagPath(selectedSport.entity_id, selectedTeam.team_id)" alt="" importance="low" class="lazy" />
                                  <span class="team-name">{{ selectedTeam.short_name }}</span>
                                  <span class="team-active" :data-team-id="selectedTeam.team_id" :data-entity="selectedTeam.entity_id"></span>
                                </div>
                              </li>
                            </ul>
                            <span class="nav nav-left" @click="slideEle(selectedLeague.league_code, 'left')"></span>
                            <span class="nav nav-right" @click="slideEle(selectedLeague.league_code, 'right')"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="update-section">
                <div class="update-wrapper">
                  <div class="tnc">
                    <label class="checkbox-container"
                      >I agree with terms and conditions <input type="checkbox" v-validate="'required'" name="terms" :checked="termsAndConditions" />
                      <span class="errordiv" v-for="error in errors" :key="error.field">
                        <span v-if="error.field === 'terms'">{{ error.msg }}</span></span
                      >
                      <span class="checkmark"></span>
                    </label>
                  </div>
                </div>
                <div class="btn-section">
                  <button
                    type="button"
                    v-bind:class="['btn', 'btn-action', isSubmitDisabled ? 'disabled loading' : '']"
                    class="btn btn-action"
                    v-on:click="updateProfile($event)"
                    :disabled="isSubmitDisabled"
                  >
                    Update profile
                    <span class="load" v-if="isSubmitDisabled"></span>
                  </button>
                </div>
                <span class="errordiv" v-if="captchaError">{{ captchaError }}</span>
                <h5 class="globalMsg" :class="[isGlobalSuccesMsg ? 'success' : '']">{{ globalMsgDiv }}</h5>
              </div>
              <h5 class="globalMsg"></h5>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { isNull, getCookieJSON, getDateTime, getTeamFlag } from "../../sdk/WidgetLibrary/utils";
import {
  checkUserExist,
  getProfileUser,
  updateProfileUser,
  getSportsData,
  uploadProfile,
  sendOTP,
  verifyOTP
} from "../../clients/sportsadda/js/loginregister.service";
import { Datetime } from "vue-datetime";
import "vue-datetime/dist/vue-datetime.min.css";

export default {
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
      disableEmail: false,
      userImage: "",
      reCaptchaResponse: "",
      captchaError: "",
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
      isOtpVerified: true,
      invalidOtpError: "",
      otpVerifiedMsg: "",
      isGlobalSuccesMsg: false,
      is_custom_image: "0",
      infoMsg: false,
      sportsbet_username: ""
    };
  },
  methods: {
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
        isNull(this.email) || this.email.trim() == "" ? (this.disableEmail = false) : (this.disableEmail = true);
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
      this.userImage = this.defaulImg;
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
              }
            }
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
                // this.otpVerifiedMsg = verifiedResponse.data.message
                this.otpVerifiedMsg = "OTP is verified";
              } else {
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
      if (entityId) {
        // console.log("Entity Id "+entityId);
        if (isChecked) {
          let dataObj = this.sports.filter(o => o.entity_id == entityId);
          dataObj[0].leagues.map(o => o.teams.map(a => (a.isSelected = false)));
          this.selectedSports.push(dataObj[0]);
        } else {
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
      this.$validator.validate().then(async () => {
        if (this.errors.items.length == 0) {
          await this.$recaptchaLoaded();
          // Execute reCAPTCHA with action "login".
          this.reCaptchaResponse = await this.$recaptcha("homepage");
          if (this.reCaptchaResponse == "") {
            this.captchaError = "Please fill captcha.";
            return;
          }
          if (!this.isOtpVerified) {
            this.invalidOtpError = "OTP verification pending";
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
      let eleId = `temaList-${leagueCode}`;
      let scrollOffset = direction == "left" ? "-=100" : "+=100";
      // $(`#${eleId}`).animate(
      //   {
      //     scrollLeft: scrollOffset
      //   },
      //   200,
      //   "linear"
      // );
    }
  },
  mounted() {
    this.getSportsData();
    let userCookie = this.getUserCookie();
    if (userCookie && userCookie.status == "2") {
      this.infoMsg = true;
    }
    if (!userCookie) {
      window.location.href = "/";
    }
  }
};
</script>
