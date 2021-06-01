<template>
  <div class="waf-component waf-login waf-custom-section" id="login-component">
    <div class="layout-wrapper">
      <section v-if="login" class="login-form">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <form action="" class="custom-form login-form" data-vv-scope="signin">
              <div class="form-group flex100">
                <div class="form-element">
                  <label for="loginEmail" class="control-label">Email*</label>
                  <input
                    type="email"
                    id="loginEmail"
                    name="loginEmail"
                    required="required"
                    class="form-control"
                    placeholder="Enter your email address"
                    v-model="loginEmail"
                    v-validate="'required|email'"
                  />
                  <!-- <span class="errordiv"></span> -->

                  <span class="errordiv" v-for="error in errors" :key="error.field">
                    <span v-if="error.field === 'loginEmail'">{{ error.msg }}</span></span
                  >
                </div>
                <div class="form-group flex100">
                  <div class="form-element">
                    <label for="loginPassword" class="control-label">Password *</label>
                    <input
                      type="password"
                      id="loginPassword"
                      ref="password"
                      name="loginPassword"
                      required="required"
                      class="form-control"
                      placeholder="Enter your password"
                      v-model="loginPassword"
                      v-validate="'required|strong_password'"
                    />
                    <span class="password-sign"></span>
                    <span class="errordiv"></span>
                    <span class="errordiv" v-for="error in errors" :key="error.field">
                      <span v-if="error.field === 'loginPassword'">{{ error.msg }}</span></span
                    >
                    <div class="tooltip">
                      <span class="tooltip-icon"></span>
                      <span class="tooltip-text"
                        >Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ &amp;
                        ? etc)</span
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group validate-group flex100">
                  <div class="forgot-pwd">
                    <a href="javascript:void(0)" @click="changePage('forgot-password')" id="forgot-pwd" class="forgot-pwd-text">Forgot password?</a>
                  </div>
                </div>
                <div class="form-group flex100">
                  <span class="errordiv" v-if="captchaError">{{ captchaError }}</span>
                  <h5 class="globalMsg" :class="[isGlobalSuccesMsg ? 'success' : '']">{{ globalMsgDiv }}</h5>
                </div>
                <div :class="{ 'disable-btn': !buttonEnabled }" :disabled="!buttonEnabled" class="form-group form-group-btn flex100">
                  <button
                    @click="submit('signin')"
                    type="button"
                    class="btn btn-action
                                    loading"
                  >
                    <span class="load">Login</span>
                  </button>
                </div>
              </div>
            </form>
            <div class="socail-login-section">
              <p class="or-text">Or</p>
              <h4 class="title">Sign In with</h4>
              <div class="social-list">
                <a class="social-item facebook">
                  <span @click="socialLogin('facebook')">Login with facebook</span>
                </a>
                <a class="social-item gmail">
                  <span @click="socialLogin('google')">Login with gmail</span>
                </a>
                <a class="social-item apple">
                  <span @click="socialLogin('applelogin')">Login with apple</span>
                </a>
              </div>
            </div>
            <div class="signup-section">
              <p class="signup-text">Don’t have an account?<a href="/signup" class="signup-link">Sign Up</a></p>
            </div>
          </div>
        </div>
      </section>
      <section v-if="fpclicked" class="forgot-password">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <h4 class="sub-title">Forgot your password?</h4>
              <p class="info-text">
                Don’t worry, we are here to help you to recover your password. Enter you’re registered the email below to receive instruction
              </p>
              <form action="" class="custom-form forgot-pwd-form" data-vv-scope="forgotpassword">
                <div class="form-group flex100">
                  <div class="form-element">
                    <label for="fploginEmail" class="control-label">Email Address *</label>
                    <input
                      type="email"
                      id="fploginEmail"
                      name="fploginEmail"
                      v-validate="'required|email'"
                      v-model="email_id"
                      required="required"
                      class="form-control"
                    />
                    <span class="errordiv"></span>
                    <span class="errordiv" v-for="error in errors" :key="error.field">
                      <span v-if="error.field === 'fploginEmail'">{{ error.msg }}</span></span
                    >
                  </div>
                </div>
                <div class="form-group flex100">
                  <span class="errordiv" v-if="captchaError">{{ captchaError }}</span>
                  <h5 class="globalMsg">{{ globalMsgDiv }}</h5>
                </div>
                <div class="form-group form-group-btn flex100">
                  <button type="button" @click="changePage('login-form')" class="btn btn-action">Cancel</button>
                  <button type="button" @click="submit('forgotpassword')" class="btn btn-filled">submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section v-if="fpEmailSent" class="forgot-password-mail">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <h4 class="sub-title">Check your mail</h4>
              <p class="info-text">We have sent a password recovery instruction to your email</p>
              <button type="button" @click="redirectTo('/')" class="btn btn-filled">Ok</button>
            </div>
          </div>
        </div>
      </section>
      <section v-if="fpSetNewPassword" class="reset-password">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <h4 class="sub-title">Set your password</h4>
              <p class="info-text">
                Enter your new password, your password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special
                character (E.g. , . _ & ? etc)
              </p>
              <form action="" class="custom-form reset-pwd-form" data-vv-scope="resetpassword">
                <div class="form-group flex100">
                  <div class="form-element">
                    <label for="resetPassword" class="control-label">Password *</label>
                    <input
                      v-validate="'required|strong_password'"
                      v-model="password"
                      ref="resetpassword"
                      type="password"
                      id="resetPassword"
                      name="resetPassword"
                      required="required"
                      class="form-control"
                      placeholder="Enter your password"
                    />
                    <span class="errordiv" v-for="error in errors" :key="error.field">
                      <span v-if="error.field === 'resetPassword'">{{ error.msg }}</span></span
                    >
                    <div class="tooltip">
                      <span class="tooltip-icon"></span>
                      <span class="tooltip-text"
                        >Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ &amp;
                        ? etc)</span
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group flex100">
                  <div class="form-element">
                    <label for="cPassword" class="control-label">Confirm Password *</label>
                    <input
                      v-model="confirm_password"
                      v-validate="'required|confirmed:resetpassword'"
                      type="password"
                      id="cPassword"
                      name="cPassword"
                      required="required"
                      class="form-control"
                      placeholder="Confirm password"
                    />
                    <span class="errordiv" v-for="error in errors" :key="error.field">
                      <span v-if="error.field === 'cPassword'">{{ error.msg }}</span></span
                    >
                    <div class="tooltip">
                      <span class="tooltip-icon"></span>
                      <span class="tooltip-text"
                        >Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ &amp;
                        ? etc)</span
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group flex100">
                  <span class="errordiv" v-if="captchaError">{{ captchaError }}</span>
                  <h5 class="globalMsg">{{ globalMsgDiv }}</h5>
                </div>
                <div class="form-group form-group-btn flex100">
                  <button type="button" @click="changePage('login-form')" class="btn btn-action">Cancel</button>
                  <button
                    type="button"
                    @click="submit('resetpassword')"
                    v-bind:class="['btn', 'btn-filled', !buttonEnabled ? 'disabled loading' : '']"
                    class="btn btn-filled"
                    :disabled="!buttonEnabled"
                  >
                    Submit<span class="load" v-if="!buttonEnabled"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section v-if="fpResetMessage" class="reset-message">
        <div class="content-wrap">
          <div class="custom-thumbnail">
            <div class="img-wrap">
              <img src="" class="custom-img" alt="" />
            </div>
          </div>
          <div class="custom-content">
            <div class="custom-wrap">
              <h4 class="sub-title">Your password has been successfully reset</h4>
              <p class="info-text">We have sent a password recovery instruction to your email</p>
              <button type="button" @click="redirectTo('/login')" class="btn btn-filled">Ok</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { isNull, getQueryStringValue, getCookieJSON, deleteCookie, getCookie } from "../../sdk/WidgetLibrary/utils";
import { signInUser, resetPwdUser, forgotPwdUser } from "../../clients/sportsadda/js/loginregister.service";
export default {
  props: {
    isServer: Boolean
  },
  data() {
    return {
      fpclicked: false,
      email_id: "",
      login: false,
      fpEmailSent: false,
      fpSetNewPassword: false,
      fpResetMessage: false,
      loginEmail: "",
      loginPassword: "",
      globalMsgDiv: "",
      globalMsgDiv: "",
      isGlobalSuccesMsg: false,
      condition: true,
      signin: {},
      buttonEnabled: true,
      captha: "",
      resetKey: "",
      reset_key: "",
      captchaError: ""
    };
  },
  methods: {
    socialLogin(loginType) {
      //let loginType;
      let psth = encodeURIComponent(window.location.pathname + window.location.search);
      // let type = e.currentTarget!.getAttribute('data-type');
      // if (type == "fb") {
      //   loginType = 'facebook';
      // } else if (type == "google") {
      //   loginType = 'google';
      // }
      // else if (type == "apple") {
      //   loginType = "applelogin"
      // }
      window.location.href = "/socialapi/auth/" + loginType + "?cbkurl=" + psth;
    },
    redirectTo(a){
      if(a)window.location.href=a;
    },
    showLogin() {
      let userCookie = getCookieJSON("_URC");
       let resetPass = this.isResetPage();
      if (!isNull(userCookie) && !isNull(userCookie.user_guid)) {
        window.location.href = "/";
      } else if(resetPass){
        this.resetKey = resetPass;
      this.changePage("reset-password");
      }else{
        this.changePage("login-form");
      }

      let acceptCookie = getCookie("allowCookie");
      if (isNull(acceptCookie)) {
        //show cookie pop up
      }
    },
    isResetPage() {
      return getQueryStringValue("reset");
    },

    changePage(type) {
      this.login = false;
      this.fpclicked = false;
      this.fpEmailSent = false;
      this.fpSetNewPassword = false;
      this.fpSetNewPassword = false;

      if (type == "login-form") {
        this.login = true;
      } else if (type == "forgot-password") {
        this.fpclicked = true;
      } else if (type == "forgot-password-mail") {
        this.fpEmailSent = true;
      } else if (type == "reset-password") {
        this.fpSetNewPassword = true;
      } else if (type == "reset-message") {
        this.fpResetMessage = true;
      }
    },
    isCustomVerification() {
      return getQueryStringValue("verify");
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
          if (this.currentScope === "signin") {
            this.buttonEnabled = false;
            let formData = {
              email_id: this.loginEmail,
              password: this.loginPassword,
              captcha: this.reCaptchaResponse
            };
            let payloadData = {
              data: formData
            };
            let responseData = await signInUser(payloadData);
            if (!isNull(responseData) && !isNull(responseData.data)) {
              if (responseData.data.status == "1") {
                setTimeout(function() {
                  window.location.href = "/";
                }, 2000);
              } else if (responseData.data.status == "3") {
                //context.goToPopupByType("verification");
                this.globalMsgDiv = responseData.data.message;
              } else {
                // any other errors
                //eg: User doesn't exist'
                this.globalMsgDiv = responseData.data.message;
              }
            }
            this.buttonEnabled = true;
          } else if (this.currentScope === "resetpassword") {
            this.buttonEnabled = false;
            this.reset_key = this.resetKey;
            let userData = {
              reset_key: this.reset_key,
              password: this.password,
              confirm_password: this.confirm_password,
              captcha: this.reCaptchaResponse
            };
            let payloadData = {
              data: userData
            };

            // this.buttonEnabled = true;
             let responseData = await resetPwdUser(payloadData);
            if (!isNull(responseData) && !isNull(responseData.data)) {
              if (responseData.data.status == "1") {
                this.changePage("reset-message");
              } else {
                this.globalMsgDiv = responseData.data.message;
              }
            }
            this.buttonEnabled = true;
          } else if (this.currentScope === "forgotpassword") {
            this.buttonEnabled = false;
            let userData = {
              email_id: this.email_id,
              captcha: this.reCaptchaResponse
            };
            let payloadData = {
              data: userData
            };

            let responseData = await forgotPwdUser(payloadData);
            if (!isNull(responseData) && !isNull(responseData.data)) {
              if (responseData.data.status == "4") {
                //context.goToPopupByType("forgotpassmsg");
                this.changePage("forgot-password-mail");
              } else if (responseData.data.status == "3") {
                //context.goToPopupByType("verification");
                this.globalMsgDiv = "User Registered.But Verification Email Not Sent";
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
    let loginMsgInfo = getCookieJSON("loginmessageinfo");
    if (loginMsgInfo && loginMsgInfo.message) {
      this.globalMsgDiv = loginMsgInfo.message;
      // clear cooiokie
      deleteCookie("loginmessageinfo");
    }
    this.showLogin();
  }
};
</script>
