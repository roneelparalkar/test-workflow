
import {  getJsonData, commonReplacer } from "../../../sdk/WidgetLibrary/utils";

let parentElement =  document.getElementById("related-video-wrapper");
function initVideo(){
  loadYTScript();
  getRelatedVideos();
}
function loadYTScript(){
  var tag = document.createElement('script');
  tag.id = 'iframe-demo';
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  };
let ytPlayer;
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('video-detail-player', {
    playerVars: { 'autoplay': 1, 'playsinline': 1 },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
  });
}
function onPlayerReady(event) {
  console.log("onPlayerREady");
  event.target.mute();
  event.target.playVideo();
  document.getElementById('video-detail-player').style.borderColor = '#FF6D00';
}
function changeState(playerStatus) {
  var color;
  if (playerStatus == -1) {
     // unstarted 
     console.log("Not started Yet");
  } else if (playerStatus == 0) {
    // ended
    console.log("Video Ended");
  } else if (playerStatus == 1) {
    // playing 
    console.log("Playing");
  } else if (playerStatus == 2) {
    // paused 
    console.log("Paused");
  } else if (playerStatus == 3) {
    // buffering 
     console.log("Buffering");
  } else if (playerStatus == 5) {
    // video cued 
    console.log("video cued");
  }
  if (color) {
    document.getElementById('video-detail-player').style.borderColor = color;
  }
}
function onPlayerStateChange(event) {
  console.log("onStateChange");
  changeState(event.data);
}

async function getRelatedVideos(){
  
  let entities = parentElement.getAttribute("data-entities");
  let otherEnt =  parentElement.getAttribute("data-otherent");
  let valuesToReplace = {
    ENTITIES: entities,
    OTHER_ENT: otherEnt,
    PAGENUM: 1,
    INUM: 1,
    PAGESIZE:10    
  };

  let api = window.webConfig.videoDetail.getRelatedVideos;
    api = commonReplacer({ urlObj: api, valuesToReplace });
    console.log(api);
   let response = await getJsonData(api);
   setRelatedVideos(response);
}

function setRelatedVideos(data){
  // console.log(data);
  parentElement.innerHTML = "";
  let htmlString = ""
  for(obj in data.items){
    let canonical = `https://stg-sportsadda.sportz.io/cricket/videos/brett-lees-take-on-india-vs-england-odi-series`
    let markup = `<div><a href="${canonical}">${obj.asset_title}</a></div>`
    htmlString +=markup;

  }
  parentElement.innerHTML = htmlString;
  
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
  initVideo();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initVideo();
  });
}