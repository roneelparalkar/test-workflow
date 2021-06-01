(function initBettingAccordion() {
  let toggleBtn = document.querySelectorAll(".bettingsites-item .btn-toggle");
  toggleBtn.forEach((el) => {
    el.addEventListener("click", toggleBettingInfo);
  })
})();

function toggleBettingInfo(e) {
  this.parentElement.classList.toggle("active");
}

(function initFaqAccordion() {
  let toggleBtn = document.querySelectorAll(".faq-item .head");
  toggleBtn.forEach((el) => {
    el.addEventListener("click", toggleFaq);
  })
})();

function toggleFaq(e) {
  this.closest(".faq-item").classList.toggle("active");
}


let footerTarget = document.getElementsByTagName("footer")[0];
let bodyTarget = document.getElementsByTagName("body")[0];
let footerOffset = footerTarget.offsetTop;
let windowHeight = window.outerHeight;
window.onscroll = () => {
let scrollOffest = window.scrollY;
  if (footerTarget) {
    if (scrollOffest >= (footerOffset - windowHeight + 80)) {
      bodyTarget.classList.add("betting-scroll");
    }
    else{
      bodyTarget.classList.remove("betting-scroll");
    }
  }
}

(function initTabClick(){
  let allTabs = document.querySelectorAll("li.tab-name");
  allTabs.forEach((el) => {
    el.addEventListener("click", topMenuClick);
  })
})();
function topMenuClick(e) {
  var idToGoTo = e.target.parentElement.getAttribute("data-id");
  if (idToGoTo) {
    let targetEle = document.querySelector(`div.tab-item[data-id='${idToGoTo}']`);
    if(targetEle){
      let offsetTop = targetEle.offsetTop + 150;
      scroll({ top: offsetTop, behavior: "smooth" });
    }
  }
}

