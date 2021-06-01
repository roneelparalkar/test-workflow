// import render from "./../../../components/si-signup/widget-layout-01.vue";
import VeeValidate from "vee-validate";
import { VueReCaptcha } from "vue-recaptcha-v3";
import { isNull, getQueryStringValue, getDateTime, getCookieJSON } from "../../../sdk/WidgetLibrary/utils";
import { checkUserExist, verifyUserAfterRegister, registerUser } from "./loginregister.service";
import { Datetime } from "vue-datetime";
import "vue-datetime/dist/vue-datetime.min.css";

let mrkup = "";
let container = "";
function init() {
  initCaptcha();
  initValidator();
  hydration();
}

// let el = document.querySelector("#signup-component");
// //el.innerHTML=""
// let vueInstance = new Vue(render);
// vueInstance.$mount(el);

function hydration() {
  if (window.selector && window.markup) {
    // container = document.getElementById(window.selector);
    // container.innerHTML = ""
    // console.log(window.markup);
    mrkup = window.markup.replace(/\|\|\|/g, "'");
    initVue();
  }
}

function initVue() {
  let context = this;
  let vueInstance = new Vue({
    template: mrkup,
    el: "#signup-component",
    components: {
      datetime: Datetime
    },
    data() {
      return {
        firstName: "",
        lastName: "",
        typeSignupResetPassword: true,
        typeSignupConfirmResetPassword: true,
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
        captchaError: false,
        captchaErrorMsg:"",
        maxDatetime: "",
        sportsbet_username: ""
      };
    },
    methods: {
      socialLogin(loginType) {
        let psth = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = "/socialapi/auth/" + loginType + "?cbkurl=" + psth;
      },
      changeInputType(type) {
        if (type == "typeSignupResetPassword") {
          this.typeSignupResetPassword = this.typeSignupResetPassword == true ? false : true;
        } else if (type == "typeSignupConfirmResetPassword") {
          this.typeSignupConfirmResetPassword = this.typeSignupConfirmResetPassword == true ? false : true;
        }
      },
      focusInput(field) {
        if (field == "email") {
          this.emailUsedError = "";
        }
      },
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
                  this.emailUsedError = "Email is already in use";
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
      redirectTo(a) {
        if (a) window.location.href = a;
      },
      isCustomVerification() {
        return getQueryStringValue("verify");
      },
      showpage(divClass) {
        this.register = false;
        this.globalMsgDiv = "";
        this.emailVerification = false;
        this.registrationCompletion = false;
        this.favSportSelection = false;
        this.completedRegistration = false;
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
              this.captchaError=true;
              this.captchaErrorMsg = "Captcha is required.";
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
                subscribe_for_email: this.subscribe_for_email,
                sportsbet_username: this.sportsbet_username
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
  });
}
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
