const sharingModule = class {
  constructor() {
    this.loadFbLib();
    this.bindShareButtons();
    if (navigator.share) {
      let navigationUrl = window.shareClickBtn.getAttribute("data-url");
      let postText = window.shareClickBtn.getAttribute("data-desc");
      let postTitle = window.shareClickBtn.getAttribute("data-title");  
      if (!navigationUrl) {
        navigationUrl = this.getMetaContent("og:url");
      }
      if (!postText) {
        postText = this.getMetaContent("og:decscription");
      }
      if (!postTitle) {
        postTitle = this.getMetaContent("og:title");
      }
      this.nativeShare({ title: postTitle, text: postText, url: navigationUrl });
    } else {
      this.openSharePopup();
    }
  }
  loadFbLib() {
    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.async = true;
      js.src = webConfig.modules.shareModule.fbShareSdk + window.fbAppId;
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }
  bindShareButtons() {
    const sharingElements = Array.from(document.querySelectorAll(".social-share"));
    for (let i = 0; i < sharingElements.length; i++) {
      sharingElements[i].classList.remove("share-loading");
      let navigationUrl = sharingElements[i].getAttribute("data-url");
      let postText = sharingElements[i].getAttribute("data-desc");
      let postTitle = sharingElements[i].getAttribute("data-title");
      let postImg = sharingElements[i].getAttribute("data-img");
      if (!navigationUrl) {
        navigationUrl = this.getMetaContent("og:url");
      }
      if (!postText) {
        postText = this.getMetaContent("og:description");
      }
      if (!postTitle) {
        postTitle = this.getMetaContent("og:title");
      }
      if (navigator.share) {
        sharingElements[i].addEventListener("click", async () => {        
         await this.nativeShare({ title: postTitle, text: postText, url: navigationUrl });
        });
      } else {
        const twitterElement = sharingElements[i].querySelector(".icon-twitter");
        const facebookElement = sharingElements[i].querySelector(".icon-facebook");
        const whatsAppElement = sharingElements[i].querySelector(".icon-whatsapp");
        const copyToClipBoardElement = sharingElements[i].querySelector(".icon-copylink");
        const closeShareElement = sharingElements[i].querySelector(".close");

        let options = {
          postText,
          postTitle,
          url: navigationUrl,
          img: postImg
        };  
        if (twitterElement) {
          twitterElement.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            this.shareInfo("twitter", options);
          });
        }

        if (facebookElement) {
          facebookElement.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            this.shareInfo("facebook", options);
          });
        }

        if (whatsAppElement) {
          whatsAppElement.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            this.shareInfo("whatsApp", options);
          });
        }

        if (copyToClipBoardElement) {
          copyToClipBoardElement.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            this.copyText(options);
          });
        }
        if (closeShareElement) {
          closeShareElement.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            this.closeSharePopup();
          });
        }
        sharingElements[i].addEventListener("click", () => {
          this.openSharePopup();
        });
      }
    }
  }

  getMetaContent(metaName) {
    let metas = document.getElementsByTagName("meta");
    let re = new RegExp("\\b" + metaName + "\\b", "i");

    for (let meta of metas) {
      if (re.test(meta.getAttribute("name")) || re.test(meta.getAttribute("property"))) {
        return meta.getAttribute("content");
      }
    }
    return "";
  }
  shareInfo(platform, options) {
    switch (platform) {
      case "facebook":
        this.shareOnFb(options);
        break;
      case "whatsApp":
        this.shareOnWhatsApp(options);
        break;
      case "twitter":
        this.shareOnTwitter(options);
        break;
    }
  }
  shareOnFb(options) {
    if (typeof FB != "undefined") {
      FB.ui({
        method: "feed",
        display: "popup",
        name: options.postTitle,
        link: options.url,
        picture: options.img,
        description: options.postText
      });
    } else {
      window.open("//www.facebook.com/sharer/sharer.php?u=" + options.url + "&picture=", "pop", "width=600, height=400, scrollbars=no");
    }
  }
  shareOnWhatsApp(options) {
    window.location = "https://wa.me/?text=" + encodeURIComponent(options.url);
  }
  shareOnTwitter(options) {
    const twtUrl = "https://twitter.com/intent/tweet?text=" + options.postTitle + " " + options.url;
    window.open(twtUrl, "Share_Page", "width=600,height=400, scrollbars=no, resizable=no, top=250, left=250", false);
  }
  copyText(options) {
    let textArea;
    function isOS() {
      return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
      textArea = document.createElement("textArea");
      textArea.readOnly = true;
      textArea.contentEditable = "true";
      textArea.value = text;
      document.body.appendChild(textArea);
    }
    function selectText() {
      var range, selection;
      if (isOS()) {
        range = document.createRange();
        range.selectNodeContents(textArea);
        selection = window.getSelection();
        if (selection != null) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }
    }
    function copyTo() {
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    createTextArea(options.url);
    selectText();
    copyTo();
  }
  nativeShare({ title, text, url }) {   
    navigator
      .share({
        title: title,
        text: text,
        url: url
      })
      .then(() => console.log("Successful Native  share"))
      .catch(error => console.log("Error sharing", error));
  }
  openSharePopup() {
    if (window.shareClickBtn) {
      window.shareClickBtn.classList.add("active");
    }
  }
  closeSharePopup() {
    if (window.shareClickBtn) {
      window.shareClickBtn.classList.remove("active");
    }
  }
};

new sharingModule();

// window.sharingModule = sharingModule;
