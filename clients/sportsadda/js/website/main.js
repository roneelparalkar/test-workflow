import config from "./webConfig.json";
import adModule from "./adModule";
import cookiePopupHandler from "./cookiePopupHandler";
import { getCookieJSON, isNull, setCookie } from "./../../../../sdk/WidgetLibrary/utils";
import { getProfileUser, logOutUser, acceptCookies } from "./../loginregister.service";
import trackAnalytics from "../../js/analytics.util";
import lazySizes from "lazysizes";
let UAParser = require("ua-parser-js");
// window.MobileDetect = require("mobile-detect");
let pageDetailScriptsLoaded = false;
lazySizes.cfg.lazyClass = "lazy";
window.adModule = adModule;
window.webConfig = config;
/* GTM = 1 & GTAG = 2 
 event : eventName , 
 category : campaign name , 
 label : action details ,
 url : url,
 extra: extra,
 title :title
 */
window.analyticsObj = {
  type: "",
  event: "",
  action: "",
  category: "",
  label: "",
  value: "",
  url: "",
  title: "",
  extra: ""
};

window.webConfig = JSON.parse(
  JSON.stringify(window.webConfig)
    .replaceAll("{{IMGVERSION}}", window.imgVersion)
    .replaceAll("{{JSVERSION}}", window.jsVersion)
    .replaceAll("{{FEEDVERSION}}", window.feedVersion)
);
window.isMobile = false;
const topArrowTarget = document.querySelector(".scroll-top");
const cookieButton = document.querySelector(".cookie-block .btn-site");
const cookieBlock = document.querySelector(".cookie-block");
const addClassForIOS = () => {
  let deviceInfo = UAParser();
  if (deviceInfo.os.name === "iOS") {
    document.body.classList.add("ios");
  }
  document.body.classList.add(deviceInfo.device.model ? deviceInfo.device.model.replace(" ", "-") : "-");
};

const checkDetailPageScripts = () => {
  if (pageDetailScriptsLoaded) return;
  pageDetailScriptsLoaded = true;
  if (window.detailScriptsToLoad) {
    window.detailScriptsToLoad.split("|||").forEach(url => {
      if (url) {
        window.loadJS(url);
      }
    });
  }
};

const getProfileData = async guid => {
  let payLoad = {
    token: guid
  };
  let responseData = await getProfileUser(payLoad);
  if (!isNull(responseData) && !isNull(responseData.data)) {
    let proImageTarget = document.querySelectorAll(".proImage");
    let userNameTarget = document.querySelectorAll(".userName");
    let userNameMobTarget = document.querySelectorAll(".userNameMob");
    let { first_name, last_name, social_user_image } = responseData.data.user;
    let imageUrl;
    proImageTarget.forEach(el => {
      imageUrl = social_user_image != "" ? social_user_image : el.getAttribute("data-default-img");
      if (el.querySelector("img")) el.querySelector("img").setAttribute("src", imageUrl);
      //el.classList.add("active");
    });

    //let imageUrl = social_user_image != "" ? social_user_image : proImageTarget.getAttribute("data-default-img");
    //document.getElementById("profileImage").setAttribute("src", imageUrl);
    // let imgEle = `<img src="${imageUrl}" id="profileImage" alt="">`;

    //proImageTarget.innerHTML = imgEle;
    userNameTarget.forEach(el => {
      el.innerText = `${first_name}`;
    });
    //userNameTarget.innerText =
    userNameMobTarget.forEach(el => {
      //el.classList.add("active");
      el.innerText = `${first_name} ${last_name}`;
    });
    userNameMobTarget.innerText = `${first_name} ${last_name}`;
  }
};

const showLoggedInUser = () => {
  let userCookie = getCookieJSON("_URC");
  //let logoutBtn = document.getElementById("logout");
  let logoutBtn = document.querySelectorAll(".logout");
  //let myProfile = document.getElementById("myProfile");
  let myProfile = document.querySelectorAll(".profile");
  // let userBlockTarget = document.getElementById("user-action");
  let userBlockTarget = document.querySelectorAll(".user-action");
  // let signInIconTarget = document.getElementById("signInIcon");
  let signInIconTarget = document.querySelectorAll(".signInIcon"); //.forEach(el => {
  // el.addEventListener("click", function(e) {
  if (!isNull(userCookie) && !isNull(userCookie.user_guid)) {
    //incomplete profile
    if (userBlockTarget) {
      //userBlockTarget.classList.remove("d-none");
      userBlockTarget.forEach(el => {
        el.classList.add("active");
      });
    }
    if (signInIconTarget) {
      signInIconTarget.forEach(el => {
        el.classList.add("active");
      });
      //signInIconTarget.classList.add("active");
    }
    if (myProfile) {
      // myProfile.addEventListener("click", function() {
      //   window.location.href = "/profile";
      // });
      myProfile.forEach(el => {
        el.addEventListener("click", function() {
          window.location.href = "/profile";
        });
      });
    }
    if (logoutBtn) {
      // logoutBtn.addEventListener("click", function() {
      //   logout();
      // });
      logoutBtn.forEach(el => {
        el.addEventListener("click", function() {
          logout();
        });
      });
    }
    let isFirstLogin = userCookie.is_first_login ? parseInt(userCookie.is_first_login) : userCookie.is_first_login;
    let loginType = userCookie.client_id ? parseInt(userCookie.client_id) : userCookie.client_id;
    userCookie.status = userCookie.status ? parseInt(userCookie.status) : userCookie.status;
    // if (userCookie.status === 2) {
    //   let currentPage = window.location.pathname;
    //   if (currentPage != "/profile") {
    //     window.location.href = window.location.origin + "/profile";
    //   }
    // }
    if (isFirstLogin === 1) {
      let type = loginType === 2 ? "Facebook" : loginType === 4 ? "Google" : loginType === 5 ? "Custom" : loginType === 9 ? "Apple" : "";

      window.analyticsObj.type = 1;
      window.analyticsObj.event = "NewRegistration";
      window.analyticsObj.title = type;
      window.analyticsObj.extra = "0";
      trackAnalytics();
      userCookie.is_first_login = "0";
      let currentPage = window.location.pathname;
      if (currentPage != "/profile") {
        window.location.href = window.location.origin + "/profile";
      }
      setCookie("_URC", JSON.stringify(userCookie));
    }
    getProfileData(userCookie.user_guid);
  } else {
    if (signInIconTarget)
      signInIconTarget.forEach(el => {
        el.addEventListener("click", function() {
          let path = window.location.pathname + window.location.search;
          path = encodeURIComponent(path);
          window.location.href = `/login?cbkurl=${path}`;
        });
      });
    // signInIconTarget.addEventListener("click", function() {
    //   window.location.href = "/login";
    // });
    if (window.location.pathname == "/profile") {
      window.location.href = window.location.origin;
    }
  }
};

const logout = async e => {
  // if (e) {
  //   let liEle = e.currentTarget;
  //   console.log(liEle);
  //   liEle.classList.add("loading");
  //   liEle.querySelector("span").classList.add("load");
  // }
  let logoutBtn = document.querySelectorAll(".logout");
  if (logoutBtn) {
    logoutBtn.forEach(el => {
      el.classList.add("loading");
    });
  }
  let userCookie = getCookieJSON("_URC");
  let payLoad = {
    data: {
      user_guid: userCookie.user_guid
    }
  };
  let responseData = await logOutUser(payLoad);
  if (responseData.data.status === "1") {
    location.href = "/";
    // userBlockTarget.classList.add("d-none");
    if (userBlockTarget) {
      userBlockTarget.forEach(el => {
        el.classList.add("d-none");
      });
    }
  }
  if (logoutBtn) {
    logoutBtn.forEach(el => {
      el.classList.remove("loading");
    });
  }
};

const searchListeners = () => {
  if (document.getElementById("searchBtn")) {
    document.getElementById("searchBtn").addEventListener("click", function() {
      let searchVal = document.getElementById("searchField").value;

      if (searchVal != "") {
        //searchVal = encodeURIComponent(searchVal);
        window.location.href = "/search?q=" + searchVal;
      }
    });
  }

  if (document.getElementById("searchField")) {
    document.getElementById("searchField").addEventListener("keydown", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("searchBtn").click();
      }
    });
  }
};

const scrollEvent = () => {
  let scrollStep = -window.scrollY / (225 / 15);
  let scrollInterval = setInterval(function() {
    if (window.scrollY != 0) {
      window.scrollBy(0, scrollStep);
    } else {
      clearInterval(scrollInterval);
    }
  }, 15);
};
const scrollToTop = () => {
  if (topArrowTarget) {
    topArrowTarget.addEventListener("click", () => {
      scrollEvent();
    });
  }
};
const addClassForScroll = () => {
  window.onscroll = () => {
    if (window.scrollY > 200) {
      document.body.classList.add("scroll");
      if (topArrowTarget) topArrowTarget.style.display = "block";
      checkDetailPageScripts();
    } else {
      document.body.classList.remove("scroll");
      if (topArrowTarget) topArrowTarget.style.display = "none";
    }

    if (cookieBlock && window.scrollY > 200) {
      if (showCookiePopup) {
        cookieBlock.style.display = "block";
      } else {
        cookieBlock.style.display = "none";
      }
    }
  };
};

let showCookiePopup = false;

const acceptCookie = () => {
  if (cookieButton)
    cookieButton.addEventListener("click", async function() {
      cookieButton.classList.add("loading");
      // if (cookieButtonSpan.length > 0) {
      //   cookieButtonSpan[0].classList.add("load");
      // }
      let gdprData = {
        data: {
          ipaddress: "1",
          privacy_version: "1",
          terms_conditions_version: "1",
          cookies_policy_version: "1"
        }
      };
      let response = await acceptCookies(gdprData);
      if (response === "1" || (typeof response === "object" && response.data && response.data.status == "1")) {
        cookieBlock.style.display = "none";
        window.analyticsObj.type = 1;
        window.analyticsObj.event = "accepted";
        window.analyticsObj.title = "GDPR Cookie";
        trackAnalytics();
      }
      if (cookieButton) {
        cookieButton.classList.remove("loading");
      }
      showCookiePopup = false;
      // if (cookieButtonSpan.length > 0) {
      //   cookieButtonSpan.classList.remove("load");
      // }
    });
};

const toggleMenu = () => {
  let elem = document.querySelector("header");
  if (elem.classList.contains("active")) {
    elem.classList.remove("active");
  } else {
    elem.classList.add("active");
  }
};
window.openMenu = toggleMenu;

const menuManager = () => {
  document.querySelectorAll(".navigation-links .submenu").forEach(el => {
    el.addEventListener("click", function(e) {
      e.stopPropagation();
      if (el.classList.contains("active")) {
        el.classList.remove("active");
      } else {
        el.classList.add("active");
      }
    });
  });

  document.querySelectorAll(".navigation-links .sub-submenu").forEach(el => {
    el.addEventListener("click", function(e) {
      e.stopPropagation();
      if (el.classList.contains("active")) {
        el.classList.remove("active");
      } else {
        el.classList.add("active");
      }
    });
  });

  if (document.querySelector("header .close-menu"))
    document.querySelector("header .close-menu").addEventListener("click", function(e) {
      e.stopPropagation();
      toggleMenu();
    });
};

const throttle = (fn, wait = config.throttleTime) => {
  let time = Date.now();
  return function() {
    if (time + wait - Date.now() < 0) {
      fn();
      time = Date.now();
    }
  };
};

const gambitGalleryIsInView = el => {
  let offset = config.scrollOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const elementBounds = el.getBoundingClientRect();
  const boundsTop = elementBounds.top + scrollY;
  const viewport = { top: scrollY, bottom: scrollY + window.innerHeight };
  const bounds = { top: boundsTop, bottom: boundsTop + el.clientHeight };
  return (
    (bounds.bottom >= viewport.top - offset && bounds.bottom <= viewport.bottom + offset) ||
    (bounds.top <= viewport.bottom + offset && bounds.top >= viewport.top - offset)
  );
};
window.elementInView = gambitGalleryIsInView;

const loadJS = (file, cb) => {
  var jsElm = document.createElement("script");
  jsElm.type = "application/javascript";
  jsElm.src = file;
  document.body.appendChild(jsElm);
  jsElm.onload = () => {
    if (cb) cb();
  };
};
window.loadJS = loadJS;

const loadDependencyFiles = () => {
  let pathName = location.pathname;
  if (pathName.indexOf("/search") === 0) {
    pathName = "/search";
  } else if (pathName.indexOf("/tips-and-predictions") === 0 || pathName.indexOf("/hi/tips-and-predictions") === 0) {
    pathName = "/tips-and-predictions";
  }
  else if (pathName.indexOf("/videos") != -1 && pathName.split("/").length > 3 && pathName.split("/")[2] === "videos") {
    pathName = "/videos";
  }
  // gtm script config
  // loadJS(window.webConfig.common.analytics, () => {});

  if (window.webConfig && window.webConfig.index[pathName]) {
    loadJS(window.webConfig.index[pathName] + "?v=" + window.jsVersion, () => {});
  }
};

const eventForShareIcon = () => {
  const shareIconsNodeList = document.querySelectorAll(".social-share");
  const shareIconsArray = Array.from(shareIconsNodeList);
  for (let i = 0; i < shareIconsArray.length; i++) {
    shareIconsArray[i].addEventListener("click", function() {
      if (!webConfig.modules.shareModule.moduleLoaded) {
        loadJS("/static-assets/build/js/sharingModule.js?v=" + window.jsVersion, () => {});
        shareIconsArray[i].classList.add("share-loading");
        webConfig.modules.shareModule.moduleLoaded = true;
      }
      window.shareClickBtn = this;
    });
  }
};

// const bindingForInteraction = () => {
//   window.addEventListener("mousemove", throttle(userInteraction));
//   window.addEventListener("scroll", throttle(userInteraction));
// };

const setIsMobileParam = () => {
  window.isMobile = /iphone|ipod|android|nokia|blackberry|BB10|bada|tizen|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase());
};

const loadWidgetJS = () => {
  if (document.querySelector(".si-waf-widget")) {
    window.loadJS("/static-assets/build/js/init.js?v=" + window.jsVersion);
  }
};

const handleSticky = () => {
  return;
  const stickyRequired = document.querySelector(".sticky-container") && document.querySelector(".sticky-container .sticky-left");
  if (!window.isMobile && stickyRequired) {
    window.loadJS("/static-assets/build/js/float-sidebar.min.js", () => {
      let stickyLeftInnerElements = document.querySelectorAll(".sticky-left section");
      let stickyLeftInnerElementsHeight = 0,
        stickyRightInnerElementsHeight = 0;
      if (stickyLeftInnerElements && stickyLeftInnerElements.length) {
        stickyLeftInnerElementsHeight = Array.from(stickyLeftInnerElements).reduce((total, el) => {
          if (typeof total === "object") {
            return total.getBoundingClientRect().height + el.getBoundingClientRect().height;
          } else {
            return total + el.getBoundingClientRect().height;
          }
        });
      }

      let stickyRightInnerElements = document.querySelectorAll(".sticky-right section");
      if (stickyRightInnerElements && stickyRightInnerElements.length) {
        stickyRightInnerElementsHeight = Array.from(stickyRightInnerElements).reduce((total, el) => {
          if (typeof total === "object") {
            return total.getBoundingClientRect().height + el.getBoundingClientRect().height;
          } else {
            return total + el.getBoundingClientRect().height;
          }
        });
      }

      let classForSticky = stickyLeftInnerElementsHeight > stickyRightInnerElementsHeight ? ".sticky-right" : ".sticky-left";

      new StickySidebar(classForSticky, {
        containerSelector: ".sticky-container",
        topSpacing: 60,
        bottomSpacing: 20
      });
    });
  }
};
window.checkIncompleteProfile = function(){
  let userCookie = getCookieJSON("_URC");
  if(userCookie && userCookie.status === "2"){
    window.location.href = "/profile"
  }
}

const initializeWebJs = () => {
  setIsMobileParam();
  addClassForIOS();
  loadDependencyFiles();
  showLoggedInUser();
  menuManager();
  addClassForScroll();
  scrollToTop();
  handleSticky();
  searchListeners();
  showCookiePopup = cookiePopupHandler();
  acceptCookie();
  eventForShareIcon();
};

setTimeout(() => {
  if (!window.location.pathname.includes("/scores-fixtures")) {
    adModule();
    // setTimeout(() => {
    loadWidgetJS();
    // }, 500);
  }
}, 2000);

if (window.location.pathname.includes("/scores-fixtures")) {
  // setTimeout(() => {
  loadWidgetJS();
  // }, 1000);
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
  initializeWebJs();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initializeWebJs();
  });
}
