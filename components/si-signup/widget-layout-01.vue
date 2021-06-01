<template>
  <div class="waf-component waf-registration waf-custom-section" id="signup-component">
    <div class="layout-wrapper">
      <section v-if="register" class="registration-details">
        <!-- <div class="create-content">
          <div class="content">
            <h5 class="title">Create account,</h5>
            <span class="info-text">Please put your
              information below</span>
          </div>
          <div class="user-photo">
            <div class="photo-upload">
              <div class="img-box">
                <img src="" alt="" class="lazy" importance="low">
              </div>
              <div class="edit-image">
              </div>
            </div>
            <div class="upload-options">
              <ul class="option-list">
                <li class="upload"> Upload Photo <form action=""> <input type="file" data-update-type="custom-image"
                      accept="image/*">
                  </form>
                </li>
                <li class="remove">Remove Profile Photo
                </li>
              </ul>
            </div>
          </div>
        </div> -->
        <form action="" class="custom-form registration-form" data-vv-scope="signup">
          <div class="name-section">
            <div class="form-group flex50">
              <div class="form-element">
                <label for="fname" class="control-label">First Name *</label>
                <input
                  v-validate="'required'"
                  type="text"
                  id="fname"
                  v-model="firstName"
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
                  v-model="lastName"
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
          </div>
          <div class="form-group flex33">
            <div class="form-element">
              <label for="signupEmail" class="control-label">Email Address *</label>
              <input
                type="email"
                v-validate="'required|email'"
                v-model="email"
                id="signupEmail"
                @blur="verifyEmailAddress()"
                name="signupEmail"
                required="required"
                class="form-control"
                placeholder="Enter your email address"
              />
              <span class="errordiv" v-if="isEmailUsed">{{ emailUsedError }}</span>
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'signupEmail'">{{ error.msg }}</span></span
              >
            </div>
          </div>
          <div class="form-group flex33">
            <div class="form-element">
              <label for="regiPassword" class="control-label">Password *</label>
              <input
                type="password"
                v-model="password"
                v-validate="'required|strong_password'"
                ref="password"
                id="regiPassword"
                name="regiPassword"
                required="required"
                class="form-control"
                placeholder="Enter your password"
              />
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'regiPassword'">{{ error.msg }}</span></span
              >
              <div class="tooltip">
                <span class="tooltip-icon"></span>
                <span class="tooltip-text"
                  >Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ &amp; ?
                  etc)</span
                >
              </div>
            </div>
          </div>
          <div class="form-group flex33">
            <div class="form-element">
              <label for="regicPassword" class="control-label">Confirm Password *</label>
              <input
                type="password"
                v-validate="'required|confirmed:password'"
                v-model="cpassword"
                id="regicPassword"
                name="regicPassword"
                required="required"
                class="form-control"
                placeholder="Confirm Password"
              />
              <span class="errordiv" v-for="error in errors" :key="error.field">
                <span v-if="error.field === 'regicPassword'">{{ error.msg }}</span></span
              >
              <div class="tooltip">
                <span class="tooltip-icon"></span>
                <span class="tooltip-text"
                  >Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ &amp; ?
                  etc)</span
                >
              </div>
            </div>
          </div>
          <!-- <div class="form-group flex50">
            <div class="form-element">
              <img src="" class="sportsbet-logo" alt="">
              <label for="lname" class="control-label">Username</label>
              <input type="text" id="lname" name="lastName" required="required"
                placeholder="Enter your Sportsbet.io username">
              <p class="note">enter your username <a href="" class="note-link">Link</a> </p>
              <span class="errordiv"></span>
            </div>
          </div> -->
          <div class="form-group flex33 gender-input">
            <label for="gender" class="control-label">Gender</label>
            <div class="radio-box-wrap">
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input v-model="gender" type="radio" value="male" id="male" name="gender" class="form-check-input" />
                  <span class="checkmark">Male</span>
                </label>
                <span class="errordiv"></span>
              </div>
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input v-model="gender" type="radio" value="female" id="female" name="gender" class="form-check-input" />
                  <span class="checkmark">Female</span>
                </label>
                <span class="errordiv"></span>
              </div>
              <div class="radio-box form-element">
                <label class="radio-container"
                  ><input v-model="gender" type="radio" value="other" id="other" name="gender" class="form-check-input" />
                  <span class="checkmark">Other</span>
                </label>
                <span class="errordiv" v-for="error in errors" :key="error.field">
                  <span v-if="error.field === 'gender'">{{ error.msg }}</span></span
                >
              </div>
            </div>
          </div>
          <div class="form-group flex33">
            <div class="form-element">
              <label for="dob" class="control-label">Date of birth </label>
              <datetime v-model="dob" :max-datetime="maxDatetime" input-id="dob"></datetime>
              <span class="errordiv"></span>
            </div>
          </div>
          <div class="form-group flex100 align-radio newsletter-input">
            <label for="newsletter" class="control-label">Subscribe to Newsletter</label>
            <div class="radio-box-wrap">
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input type="radio" value="true" id="yes" name="newsletter" class="form-check-input" v-model="subscribe_for_email" />
                  <span class="checkmark"></span> yes
                </label>
                <span class="errordiv" v-for="error in errors" :key="error.field">
                  <span v-if="error.field === 'dob'">{{ error.msg }}</span></span
                >
              </div>
              <div class="radio-box form-element">
                <label class="radio-container">
                  <input type="radio" value="false" id="no" name="newsletter" class="form-check-input" v-model="subscribe_for_email" />
                  <span class="checkmark"></span> no
                </label>
                <span class="errordiv" v-for="error in errors" :key="error.field">
                  <span v-if="error.field === 'newsletter'">{{ error.msg }}</span></span
                >
              </div>
            </div>
          </div>
          <div class="form-group flex100">
            <p class="note">
              By signing up, you agree to SportsAdda using your personal data in accordance with our <a href="">Privacy Policy</a>. We use your data
              to personalise and improve your experience on our digital platforms, provide products and services you request from us, and carry out
              consumer profiling and market research.
            </p>
          </div>
          <div class="form-group flex100">
            <span class="errordiv" v-if="captchaError">{{ captchaError }}</span>
            <h5 class="globalMsg">{{ globalMsgDiv }}</h5>
          </div>
          <div class="form-group flex100 form-group-btn form-footer">
            <div class="left-group">
              <!-- :disabled='!buttonEnabled' -->
              <button type="button" @click="submit('signup')" class="btn btn-action">Sign up<span class="load" v-if="!buttonEnabled"></span></button>
              <div class="socail-login-section">
                <p class="or-text">Or</p>
                <h4 class="title">Sign In with</h4>
                <div class="social-list">
                  <a class="social-item facebook">
                    <span>Login with facebook</span>
                  </a>
                  <a class="social-item gmail">
                    <span>Login with gmail</span>
                  </a>
                  <a class="social-item apple">
                    <span>Login with apple</span>
                  </a>
                </div>
              </div>
            </div>
            <div class="signup-section">
              <p class="signup-text">Don’t have an account?<a href="/login" class="signup-link">Login</a></p>
            </div>
          </div>
        </form>
      </section>
      <section v-if="emailVerification" class="email-verification">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <h4 class="sub-title">A verification link has been sent to your email account</h4>
              <p class="info-text">
                Please click on the link that has just been sent to your email account to verify your email and continue the registration process.
              </p>
              <button type="button" @click="redirectTo('/')" class="btn btn-filled">ok</button>
            </div>
          </div>
        </div>
      </section>
      <section v-if="registrationCompletion" class="registration-completion">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <h4 class="sub-title">Registration Completed Successfully</h4>
            </div>
          </div>
        </div>
      </section>
      <section v-if="favSportSelection" class="fav-sport-selection">
        <div class="content-wrap">
          <div class="custom-head">
            <h4 class="sub-title">Select your favourite sport(s)</h4>
            <span class="skip">Skip</span>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <div class="sports-detail">
                <div class="sports-list">
                  <div class="sports-item cricket">
                    <div class="item-wrap">
                      <div class="sports-image">
                        <img src="/static-assets/images/cricket-icon.png" alt="" class="lazy" importance="low" />
                      </div>
                      <div class="sports-select">
                        <form action="">
                          <label class="checkbox-container"
                            >Cricket <input type="checkbox" />
                            <span class="checkmark"></span>
                          </label>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div class="sports-item football">
                    <div class="item-wrap">
                      <div class="sports-image">
                        <img src="/static-assets/images/football-icon.png" alt="" class="lazy" importance="low" />
                      </div>
                      <div class="sports-select">
                        <form action="">
                          <label class="checkbox-container"
                            >football
                            <input type="checkbox" />
                            <span class="checkmark"></span>
                          </label>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div class="sports-item kabaddi">
                    <div class="item-wrap">
                      <div class="sports-image">
                        <img src="/static-assets/images/kabaddi-icon.png" alt="" class="lazy" importance="low" />
                      </div>
                      <div class="sports-select">
                        <form action="">
                          <label class="checkbox-container"
                            >Kabaddi <input type="checkbox" />
                            <span class="checkmark"></span>
                          </label>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="btn-section">
                  <button type="button" class="btn btn-action">Continue</button>
                </div>
              </div>
              <div class="league-section">
                <div class="league-wrapper">
                  <h5 class="sub-title">Select favourite teams</h5>
                  <div class="sport-specific-team">
                    <div class="sport-category">
                      <h4 class="category-name">Cricket</h4>
                    </div>
                    <div class="league-listing">
                      <div class="league-wrap">
                        <div class="league-item">
                          <h4 class="league-name">International teams</h4>
                          <div class="league-teams">
                            <ul class="team-list">
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                            </ul>
                            <span class="nav nav-left"></span>
                            <span class="nav nav-right"></span>
                          </div>
                        </div>
                        <div class="league-item">
                          <h4 class="league-name">Indian premier league teams</h4>
                          <div class="league-teams">
                            <ul class="team-list">
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                              <li class="team">
                                <div class="team-wrap">
                                  <img src="/static-assets/images/league.png" alt="" importance="low" class="lazy" />
                                  <span class="team-name">IND</span>
                                  <span class="team-active"></span>
                                </div>
                              </li>
                            </ul>
                            <span class="nav nav-left"></span>
                            <span class="nav nav-right"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="btn-section">
                    <button type="button" class="btn btn-action">Done</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section v-if="completedRegistration" class="completed-registration">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <h4 class="sub-title">Thank you</h4>
              <p class="info-text">Thank you for creating new account on SportsAdda website</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { isNull, getQueryStringValue, getDateTime, getCookieJSON } from "../../sdk/WidgetLibrary/utils";
import { checkUserExist, verifyUserAfterRegister, registerUser } from "../../clients/sportsadda/js/loginregister.service";
import { Datetime } from "vue-datetime";
import 'vue-datetime/dist/vue-datetime.min.css'

export default {
  components: {
    datetime: Datetime
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      //typePassword: true,
      //typeCnfrmPassword: true,
      isProfileImgLoader: false,
      image_path_for_update: "",
      email: "",
      gender: "",
      dob: "",
      password: "",
      cpassword: "",
      social_user_image: "",
      isEmailUsed: false,
      emailUsedError: "Email is already in use",
      subscribe_for_email: true,
      showError: false,
      errorMsg: "",
      globalMsgDiv: "",
      buttonEnabled: true,
      isGlobalSuccesMsg: false,
      maxDatetime: "",
      register: false,
      emailVerification: false,
      registrationCompletion: false,
      favSportSelection: false,
      completedRegistration: false,
      captchaError: "",
      maxDatetime: ""
    };
  },
  methods: {
    async verifyEmailAddress(e) {
      // called on blur
      let valid = true;
      if (!this.isReadonlyEmail) {
        this.$validator.validateAll("signUpEmail").then(async () => {
          const _errors = this.errors.items.filter(item => item.field === "signUpEmail");
          // this.errors.items.forEach((el) => {
          //   if (el.field == "email") {
          //     valid = false
          //   }
          // });
          if (_errors.length > 0) {
            valid = false;
          }
          if (valid) {
            let matchOptions = {
              id: "signUpEmail", // if you have the id, otherwise its optional
              name: "signUpEmail" // optional
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
              } else if (verifiedResponse.data.status == "0" && this.email != "") {
                this.isEmailUsed = true;
              }
            }
          }
        });
      }
    },
    async verifyUser(val) {
      if (val) {
        let postData = {
          data: {
            verification_key: val
          }
        };
        let response = await verifyUserAfterRegister(postData);
        if (response && (response.data.status == "1" || response.data.status == "2")) {
          //context.loginRegisterPopupTarget.style.display = "block";
          //document.getElementsByTagName('body')[0].classList.add('no-scroll');
          //context.goToPopupByType("registersuccess");
          this.showpage("registration-completion");
          setTimeout(function() {
            location.href = "/";
          }, 1500);
        } else {
          this.globalMsgDiv = response.data.message;
          this.showpage("registration-details");
          //context.loginRegisterPopupTarget.style.display = "block";
          //document.getElementsByTagName('body')[0].classList.add('no-scroll');
          setTimeout(function() {
            location.href = "/login";
          }, 1500);
        }
      }
    },
    redirectTo(a){
      if(a) window.location.href=a
      
    },
    isCustomVerification() {
      return getQueryStringValue("verify");
    },
    showpage(divClass) {
      this.register = false;
      (this.emailVerification = false), (this.registrationCompletion = false), (this.favSportSelection = false), (this.completedRegistration = false);
      if (divClass == "registration-details") {
        this.register = true;
      } else if (divClass == "email-verification") {
        this.emailVerification = true;
      } else if (divClass == "registration-completion") {
        this.registrationCompletion = true;
      } else if (divClass == "fav-sport-selection") {
        this.favSportSelection = true;
      } else if (divClass == "completed-registration") {
        this.completedRegistration = true;
      }
    },
    async submit(scope) {
      this.$validator.validateAll(scope).then(async () => {
        const _errors = this.errors.items.filter(item => item.scope === scope);
        await this.$recaptchaLoaded();
        // Execute reCAPTCHA with action "login".
        this.reCaptchaResponse = await this.$recaptcha("login");
        //if (this.errors.items.length === 0) {
        if (_errors.length === 0) {
          this.currentScope = scope;

          if (isNull(this.reCaptchaResponse)) {
            this.captchaError = "Please fill captcha.";
            return;
          }
          if (this.currentScope === "signup") {
            if (this.isEmailUsed == true) {
              return;
            }
            this.buttonEnabled = false;
            if (!isNull(this.dob)) {
              this.dob = getDateTime(this.dob, "yyyy-mm-dd");
            }

            let user = {
              first_name: this.firstName,
              last_name: this.lastName,
              social_user_image: this.social_user_image,
              gender: this.gender,
              dob: this.dob,
              subscribe_for_email: this.subscribe_for_email
            };
            let payLoad = {
              data: {
                user: user,
                email_id: this.email,
                password: this.password,
                confirm_password: this.cpassword,
                captcha: this.reCaptchaResponse
              }
            };
            let responseData = await registerUser(payLoad);
            if (!isNull(responseData) && !isNull(responseData.data)) {
              if (responseData.data.status === "3" || responseData.data.status === "1") {
                //context.goToPopupByType("verification");
                this.showpage("email-verification");
              } else {
                this.globalMsgDiv = responseData.data.message;
              }
            }
            this.buttonEnabled = true;
          }
          // this.$recaptchaInstance.reset();
          // this.reCaptchaResponse= ""
        }
      });
    }
  },
  mounted() {
    let userCookie = getCookieJSON("_URC");
    if (!isNull(userCookie) && !isNull(userCookie.user_guid)) {
      window.location.href = "/";
    }
    let val = this.isCustomVerification();
    if (val) {
      this.verifyUser(val);
    } else {
      this.showpage("registration-details");
    }
  }
};
</script>
