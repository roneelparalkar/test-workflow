function adModule(typeObj) {
  let timeStamp = Math.floor(Date.now() / 1000);

  const adConfig = {
    configurations: [
      {
        minWrapperWidth: 1600,
        leaderCode: 39862910,
        leaderWidth: 1280,
        leaderHeight: 100,
        contentTopCode: 39862911,
        contentTopWidth: 728,
        contentTopHeight: 90,
        contentBottomCode: 39862911,
        contentBottomWidth: 728,
        contentBottomHeight: 90,
        mrecCode: 39862909,
        mrecWidth: 300,
        mrecHeight: 250,
        rectangleCode: 45159680,
        rectangleWidth: 300,
        rectangleHeight: 100,
        halfPageCode: 39862907,
        halfPageWidth: 300,
        halfPageHeight: 600
      },
      {
        minWrapperWidth: 1366,
        leaderCode: 39862910,
        leaderWidth: 1280,
        leaderHeight: 100,
        contentTopCode: 39862911,
        contentTopWidth: 728,
        contentTopHeight: 90,
        contentBottomCode: 39862911,
        contentBottomWidth: 728,
        contentBottomHeight: 90,
        mrecCode: 39862909,
        mrecWidth: 300,
        mrecHeight: 250,
        rectangleCode: 45159680,
        rectangleWidth: 300,
        rectangleHeight: 100,
        halfPageCode: 39862907,
        halfPageWidth: 300,
        halfPageHeight: 600
      },
      {
        minWrapperWidth: 1280,
        leaderCode: 39862906,
        leaderWidth: 970,
        leaderHeight: 90,
        contentTopCode: 45159681,
        contentTopWidth: 468,
        contentTopHeight: 60,
        contentBottomCode: 45159681,
        contentBottomWidth: 468,
        contentBottomHeight: 60,
        mrecCode: 39862909,
        mrecWidth: 300,
        mrecHeight: 250,
        rectangleCode: 45159680,
        rectangleWidth: 300,
        rectangleHeight: 100,
        halfPageCode: 39862907,
        halfPageWidth: 300,
        halfPageHeight: 600
      },
      {
        minWrapperWidth: 1024,
        leaderCode: 39862911,
        leaderWidth: 728,
        leaderHeight: 90,
        contentTopCode: 40004118,
        contentTopWidth: 320,
        contentTopHeight: 50,
        contentBottomCode: 39862909,
        contentBottomWidth: 300,
        contentBottomHeight: 250,
        mrecCode: 39862911,
        mrecWidth: 728,
        mrecHeight: 90,
        rectangleCode: 45159680,
        rectangleWidth: 300,
        rectangleHeight: 100,
        halfPageCode: 39862907,
        halfPageWidth: 300,
        halfPageHeight: 600
      },
      {
        minWrapperWidth: 768,
        leaderCode: 39862911,
        leaderWidth: 728,
        leaderHeight: 90,
        contentTopCode: 40004118,
        contentTopWidth: 320,
        contentTopHeight: 50,
        contentBottomCode: 39862909,
        contentBottomWidth: 300,
        contentBottomHeight: 250,
        mrecCode: 39862911,
        mrecWidth: 728,
        mrecHeight: 90,
        rectangleCode: 45159680,
        rectangleWidth: 300,
        rectangleHeight: 100,
        halfPageCode: 39862907,
        halfPageWidth: 300,
        halfPageHeight: 600
      },
      {
        minWrapperWidth: 1,
        leaderCode: 40004118,
        leaderWidth: 320,
        leaderHeight: 50,
        contentTopCode: 40004118,
        contentTopWidth: 320,
        contentTopHeight: 50,
        contentBottomCode: 39862909,
        contentBottomWidth: 300,
        contentBottomHeight: 250,
        mrecCode: 39862909,
        mrecWidth: 300,
        mrecHeight: 250,
        rectangleCode: 45159680,
        rectangleWidth: 300,
        rectangleHeight: 100,
        halfPageCode: 39862907,
        halfPageWidth: 300,
        halfPageHeight: 600
      }
    ]
  };
  let leaderboardAdElementArray = document.getElementsByClassName("waf-ad waf-ad-leader");
  let mrecAdElementArray = document.getElementsByClassName("waf-ad waf-ad-mrec");
  let halfPageAdElementArray = document.getElementsByClassName("waf-ad waf-ad-halfpage");
  let contentTopAdElementArray = document.getElementsByClassName("waf-ad waf-ad-content-top");
  let contentBottomAdElementArray = document.getElementsByClassName("waf-ad waf-ad-content-bottom");
  let rectangleElementArray = document.getElementsByClassName("waf-ad waf-ad-rectangle");
  let type = typeObj && typeObj.type ? typeObj.type : "";

  const calculateWrapperWidth = (elem,type) => {
    let width = window.outerWidth;
    if (type=="leaderboard" && elem && elem.querySelector(".waf-ad-wrapper")) width = elem.querySelector(".waf-ad-wrapper").clientWidth;
    return width;
  };
  const getIframeSizes = (selectedAdConfig, type) => {
    let {
      leaderCode,
      leaderWidth,
      leaderHeight,
      mrecCode,
      mrecWidth,
      mrecHeight,
      contentTopCode,
      contentTopWidth,
      contentTopHeight,
      contentBottomCode,
      contentBottomWidth,
      contentBottomHeight,
      rectangleCode,
      rectangleWidth,
      rectangleHeight,
      halfPageCode,
      halfPageWidth,
      halfPageHeight
    } = selectedAdConfig;
    let iframeObj = {
      leaderboard: `<iframe name="CPbanner${leaderCode}" src="https://asia.adform.net/adfscript/?bn=${leaderCode};cpjs=2;ord=${timeStamp}" width="${leaderWidth}" height="${leaderHeight}" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>`,
      mrecAd: `<iframe name="CPbanner${mrecCode}" src="https://asia.adform.net/adfscript/?bn=${mrecCode};cpjs=2;ord=${timeStamp}" width="${mrecWidth}" height="${mrecHeight}" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>`,
      halfPageAd: `<iframe name="CPbanner${halfPageCode}" src="https://asia.adform.net/adfscript/?bn=${halfPageCode};cpjs=2;ord=${timeStamp}" width="${halfPageWidth}" height="${halfPageHeight}" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>`,
      contentTopAd: `<iframe name="CPbanner${contentTopCode}" src="https://asia.adform.net/adfscript/?bn=${contentTopCode};cpjs=2;ord=${timeStamp}" width="${contentTopWidth}" height="${contentTopHeight}" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>`,
      contentBottomAd: `<iframe name="CPbanner${contentBottomCode}" src="https://asia.adform.net/adfscript/?bn=${contentBottomCode};cpjs=2;ord=${timeStamp}" width="${contentBottomWidth}" height="${contentBottomHeight}" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>`,
      rectangleAd: `<iframe name="CPbanner${rectangleCode}" src="https://asia.adform.net/adfscript/?bn=${rectangleCode};cpjs=2;ord=${timeStamp}" width="${rectangleWidth}" height="${rectangleHeight}" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>`
    };
    if (iframeObj[type]) selectedAdConfig[type] = iframeObj[type];
    //   return selectedAdConfig
  };
  const getAdConfig = (wrapperWidth, type) => {
    let adConfigMain = adConfig.configurations.find(configData => wrapperWidth >= configData.minWrapperWidth);
    let adConfiguration;
    if (adConfigMain) {
      adConfiguration = JSON.parse(JSON.stringify(adConfigMain));
      getIframeSizes(adConfiguration, type);
    }
    return adConfiguration;
  };
  if (leaderboardAdElementArray) {
    for (let index = 0; index < leaderboardAdElementArray.length; index++) {
      if (!alreadyLoaded(leaderboardAdElementArray[index]) && parentIsShown(type, leaderboardAdElementArray[index])) {
        let adWrapperWidth = calculateWrapperWidth(leaderboardAdElementArray[index],'leaderboard');
        if (adWrapperWidth) {
          let adConfiguration = getAdConfig(adWrapperWidth, "leaderboard");
          if (adConfiguration && adConfiguration.leaderboard) {
            leaderboardAdElementArray[index].querySelector(".waf-ad-wrapper")
              ? (leaderboardAdElementArray[index].querySelector(".waf-ad-wrapper").innerHTML = `${adConfiguration.leaderboard}`)
              : "";
          }
        }
      }
    }
  }
  if (mrecAdElementArray) {
    for (let index = 0; index < mrecAdElementArray.length; index++) {
      if (!alreadyLoaded(mrecAdElementArray[index]) && parentIsShown(type, mrecAdElementArray[index])) {
        let adWrapperWidth = calculateWrapperWidth(mrecAdElementArray[index]);
        if (adWrapperWidth) {
          let adConfiguration = getAdConfig(adWrapperWidth, "mrecAd");
          if (adConfiguration && adConfiguration.mrecAd) {
            mrecAdElementArray[index].querySelector(".waf-ad-wrapper")
              ? (mrecAdElementArray[index].querySelector(".waf-ad-wrapper").innerHTML = `${adConfiguration.mrecAd}`)
              : "";
          }
        }
      }
    }
  }
  if (contentTopAdElementArray) {
    for (let index = 0; index < contentTopAdElementArray.length; index++) {
      if (!alreadyLoaded(contentTopAdElementArray[index]) && parentIsShown(type, contentTopAdElementArray[index])) {
        let adWrapperWidth = calculateWrapperWidth(contentTopAdElementArray[index]);
        if (adWrapperWidth) {
          let adConfiguration = getAdConfig(adWrapperWidth, "contentTopAd");
          if (adConfiguration && adConfiguration.contentTopAd) {
            contentTopAdElementArray[index].querySelector(".waf-ad-wrapper")
              ? (contentTopAdElementArray[index].querySelector(".waf-ad-wrapper").innerHTML = `${adConfiguration.contentTopAd}`)
              : "";
          }
        }
      }
    }
  }
  if (contentBottomAdElementArray) {
    for (let index = 0; index < contentBottomAdElementArray.length; index++) {
      if (!alreadyLoaded(contentBottomAdElementArray[index]) && parentIsShown(type, contentBottomAdElementArray[index])) {
        let adWrapperWidth = calculateWrapperWidth(contentBottomAdElementArray[index]);
        if (adWrapperWidth) {
          let adConfiguration = getAdConfig(adWrapperWidth, "contentBottomAd");
          if (adConfiguration && adConfiguration.contentBottomAd) {
            contentBottomAdElementArray[index].querySelector(".waf-ad-wrapper")
              ? (contentBottomAdElementArray[index].querySelector(".waf-ad-wrapper").innerHTML = `${adConfiguration.contentBottomAd}`)
              : "";
          }
        }
      }
    }
  }
  if (halfPageAdElementArray) {
    for (let index = 0; index < halfPageAdElementArray.length; index++) {
      if (!alreadyLoaded(halfPageAdElementArray[index]) && parentIsShown(type, halfPageAdElementArray[index])) {
        let adWrapperWidth = calculateWrapperWidth(halfPageAdElementArray[index]);
        if (adWrapperWidth) {
          let adConfiguration = getAdConfig(adWrapperWidth, "halfPageAd");
          if (adConfiguration && adConfiguration.halfPageAd) {
            halfPageAdElementArray[index].querySelector(".waf-ad-wrapper")
              ? (halfPageAdElementArray[index].querySelector(".waf-ad-wrapper").innerHTML = `${adConfiguration.halfPageAd}`)
              : "";
          }
        }
      }
    }
  }
  if (rectangleElementArray) {
    for (let index = 0; index < rectangleElementArray.length; index++) {
      if (!alreadyLoaded(rectangleElementArray[index]) && parentIsShown(type, rectangleElementArray[index])) {
        let adWrapperWidth = calculateWrapperWidth(rectangleElementArray[index]);
        if (adWrapperWidth) {
          let adConfiguration = getAdConfig(adWrapperWidth, "rectangleAd");
          if (adConfiguration && adConfiguration.rectangleAd) {
            rectangleElementArray[index].querySelector(".waf-ad-wrapper")
              ? (rectangleElementArray[index].querySelector(".waf-ad-wrapper").innerHTML = `${adConfiguration.rectangleAd}`)
              : "";
          }
        }
      }
    }
  }
}

function alreadyLoaded(adElement) {
  return adElement && adElement.querySelector("iframe");
}

function parentIsShown(type, adElement) {
  if (type !== "fixturesPage") return true;
  let cardListElem = adElement.parentElement.parentElement.parentElement;
  if (cardListElem) {
    if (cardListElem.style.display === "none") return false;
    return true;
  }
  return false;
}
export default adModule;
