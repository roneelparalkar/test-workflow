import VeeValidate from "vee-validate";
import { VueReCaptcha } from "vue-recaptcha-v3";
import { getQueryStringValue, isNull } from "../../../sdk/WidgetLibrary/utils";
import { getUnsubscribedInfo,submitUnsubscribe } from "./loginregister.service";
let mrkup = "";
let container = "";
function init() {
  initCaptcha();
  initValidator();
  hydration();
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
    el: "#unsubscribe-component",
    data() {
      return {
        reason_to_unsubscribe_id: "",
        reason_to_unsubscribe: "",
        reason_id: "",
        buttonEnabled: true,
        globalErrorMsg: "",
        reCaptchaResponse: "",
        captchaError: "",
        showForm: false,
        showButton: false
      };
    },
    methods: {
        onChange(e) {
            this.reason_to_unsubscribe = ''
            let currentElement = e.target;
            this.reason_id = currentElement.id
          },
          async submit(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.$validator.validate().then(async () => {
              if (this.errors.items.length == 0) {
                await this.$recaptchaLoaded()
                // Execute reCAPTCHA with action "login".
                this.reCaptchaResponse = await this.$recaptcha('homepage')
                if (this.reCaptchaResponse == "") {
                  this.captchaError = "Please fill captcha."
                  return false;
                }
                let reason_text = ((this.reason_id == '5') ? this.reason_to_unsubscribe : this.reason_to_unsubscribe_id)
                let guid = getQueryStringValue('q').toString();
                if (!isNull(guid)) {
                  let payloadData = {
                    guid: guid,
                    subject: "General Query",
                    reason_to_unsubscribe_id: this.reason_id,
                    reason_to_unsubscribe: reason_text
                  }
                  let payload = {
                    grcaptcha: this.reCaptchaResponse,
                    page_flag: "3",
                    send_mail: "0",
                    is_subscribe: "0",
                    user_type: "0",
                    data: payloadData
                  }
                  this.buttonEnabled = false;
                  let responseData = await submitUnsubscribe(payload);
                  if (!isNull(responseData) && responseData == "1") {
                    this.showForm = false
                    this.showButton = true;
                    this.globalErrorMsg = "You have successfully unsubscribed.";
                  } else {
                    this.showForm = false
                    this.showButton = true;
                    this.globalErrorMsg = "Something went wrong, please try again!"
                    setTimeout(() => {
                      window.location.href = "/"
                    }, 5000);
  
                  }
  
                }
              }
            })
          },
    },
    async mounted() {
      let guid = getQueryStringValue("q").toString();
      let res = await getUnsubscribedInfo(guid);
          if (res.status == "0") {
            this.showButton = true;
            this.showForm = false;
            this.globalErrorMsg = "You have successfully unsubscribed from this mailing list.";
          } else {
            this.showButton = false;
            this.showForm = true;
          }
        // });
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
