const searchFilter = document.querySelector("#searchFilter");
const searchInput = document.querySelector("#searchFieldPage");
const searchBtn = document.querySelector("#searchBtnPage");
import { getQueryStringValue } from "../../../sdk/WidgetLibrary/utils";


function toggleFilter() {
  if (searchFilter) {
    searchFilter.addEventListener("click", function(e) {
      e.stopPropagation();
      this.classList.toggle("active");
    });
  }
}

function searchBtnClick() {
  if (searchBtn) {
    searchBtn.addEventListener("click", function(e) {
      e.preventDefault();
      let val = searchInput.value;
      if (val) {
        window.location.href = window.location.origin + "/search?q=" + val;
      }
    });
  }
}

function searchInputEvent() {
  if (searchInput) {
    searchInput.value = getQueryStringValue("q");
    searchInput.addEventListener("keypress", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        searchBtn.click();
      }
    });
  }
}


if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
  toggleFilter();
  searchInputEvent();
  searchBtnClick();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    toggleFilter();
    searchInputEvent();
    searchBtnClick();
  });
}
