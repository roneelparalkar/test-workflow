//import render from "./../../../components/si-login/widget-layout-01.vue";
//import Vue from "vue";
import VeeValidate from "vee-validate";
import { VueReCaptcha } from "vue-recaptcha-v3";
import { isNull, getQueryStringValue, getCookieJSON, deleteCookie, getCookie } from "../../../sdk/WidgetLibrary/utils";
import { signInUser, resetPwdUser, forgotPwdUser } from "./loginregister.service";
let mrkup = "";
let container = "";
function init() {
  initValidator();
  hydration();
  checkUserAlreadyExist();
  initCaptcha();
}
function checkUserAlreadyExist(){
  let emailExist = getCookieJSON("loginmessageinfo");
  if(emailExist && emailExist.status == 0){
    let ele = document.querySelector(".login-form .globalMsg");
    if(ele)
    ele.innerHTML = emailExist.message;
  }
}
function hydration() {
  if (window.selector && window.markup) {
    mrkup = window.markup.replace(/\|\|\|/g, "'");
    initVue();
  }
}

function initVue() {
  let context = this;
  let vueInstance = new Vue({
    template: mrkup,
    el: "#login-component",
    data() {
      return {
        typeLoginPassword: true,
        fpclicked: false,
        email_id: "",
        login: false,
        fpEmailSent: false,
        fpSetNewPassword: false,
        fpResetMessage: false,
        loginEmail: "",
        confirm_password: "",
        password: "",
        typeConfirmResetPassword: true,
        typeResetPassword: true,
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
        captchaError: false,
        captchaErrorMsg: ""
      };
    },
    methods: {
      socialLogin(loginType) {
        let params = new URLSearchParams(window.location.search);
        let path = params.has("cbkurl") ? params.get("cbkurl") : "/";
        window.location.href = "/socialapi/auth/" + loginType + "?cbkurl=" + path;
      },
      redirectTo(a) {
        if (a) window.location.href = a;
      },
      showLogin() {
        let userCookie = getCookieJSON("_URC");
        let resetPass = this.isResetPage();
        if (!isNull(userCookie) && !isNull(userCookie.user_guid)) {
          window.location.href = "/";
        } else if (resetPass) {
          this.resetKey = resetPass;
          this.changePage("reset-password");
        } else {
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
      changeInputType(type) {
        if (type == "typeLoginPassword") {
          this.typeLoginPassword = this.typeLoginPassword == true ? false : true;
        } else if (type == "typeResetPassword") {
          this.typeResetPassword = this.typeResetPassword == true ? false : true;
        } else if (type == "typeConfirmResetPassword") {
          this.typeConfirmResetPassword = this.typeConfirmResetPassword == true ? false : true;
        }
      },
      changePage(type) {
        this.login = false;
        this.fpclicked = false;
        this.fpEmailSent = false;
        this.fpSetNewPassword = false;
        this.fpSetNewPassword = false;
        this.globalMsgDiv = "";

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
        this.globalMsgDiv = "";
        this.$validator.validateAll(scope).then(async () => {
          const _errors = this.errors.items.filter(item => item.scope === scope);
          await this.$recaptchaLoaded();
          // Execute reCAPTCHA with action "login".
          this.reCaptchaResponse = await this.$recaptcha("login");
          //if (this.errors.items.length === 0) {
          if (_errors.length === 0) {
            this.currentScope = scope;
            if (isNull(this.reCaptchaResponse)) {
              this.captchaError = true;
              this.captchaErrorMsg = "Captcha is required.";
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
                  this.globalMsgDiv = responseData.data.message;
                  setTimeout(function() {
                    let path = getQueryStringValue("cbkurl");
                    if (path != "") {
                      window.location.href = `${path}`;
                    } else {
                      window.location.href = "/";
                    }
                  }, 1500);
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
     
      this.showLogin();
      let loginMsgInfo = getCookieJSON("loginmessageinfo");
      if (loginMsgInfo && loginMsgInfo.message) {
        this.globalMsgDiv = loginMsgInfo.message;
        // clear cooiokie
        deleteCookie("loginmessageinfo");
      }
    }
  });
}
// let el = document.querySelector("#login-component");
// //el.innerHTML=""
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
  VeeValidate.Validator.extend("strong_password", {
    getMessage: () => {
      return `Please match the case.`;
    },
    validate: value => {
      var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
      return strongRegex.test(value);
    }
  });
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
