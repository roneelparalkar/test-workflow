<template>
  <div class="site">
    <header class="site-header">
      <!--Master Main Menu-->
      <div class="header">
        <div class="navigation-wrap">
          <div class="site-logo">
            <a href="/" class="logo">
              <span>SportsAdda</span>
            </a>
          </div>
          <nav class="site-nav">
            <!-- <div class="site-search">
              <form class="header-search">
                <input type="search" id="searchField" class="form-control" placeholder="Search" />
                <button type="button" id="searchBtn" class="btn btn-search">Search</button>
              </form>
            </div> -->
            <ul class="navigation-links">
              <li class="nav-link link-home">
                <a href="/" class="home">
                  <span>Home</span>
                </a>
              </li>
              <li class="nav-link link-cricket">
                <a href="/cricket" class="cricket" title="Cricket">
                  <span>Cricket</span>
                </a>
              </li>
              <li class="nav-link link-football">
                <a href="/football" class="football" title="Football">
                  <span>Football</span>
                </a>
              </li>
              <li class="nav-link link-kabaddi">
                <a href="/kabaddi" class="kabaddi" title="Kabaddi">
                  <span>Kabaddi</span>
                </a>
              </li>
            </ul>
            <div class="social social-share">
              <a href="https://www.facebook.com/SportsAddaOfficial/" class="facebook" target="_blank">
                <span>Follow us on Facebook</span>
              </a>
              <a href="https://twitter.com/sportsadda_" class="twitter" target="_blank">
                <span>Follow us on Twitter</span>
              </a>
              <a href="https://www.instagram.com/sportsaddaofficial/" class="instagram" target="_blank">
                <span>Follow us on Instagram</span>
              </a>
              <a href="https://www.youtube.com/channel/UCqJPjpJcnjJpGJDx5NOddQw" class="youtube" target="_blank">
                <span>Follow us on YouTube</span>
              </a>
              <a href="https://itunes.apple.com/us/app/stumped/id1465629990?mt=8" class="ios" target="_blank">
                <span>Download App iOS</span>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.stumped.app" class="android" target="_blank">
                <span>Download App Android</span>
              </a>
            </div>
            <div class="close-menu">close</div>
          </nav>
          <div class="site-login">
            <span class="login">Sign In</span>
            <div class="icon-user">
              <img src="/static-assets/images/default-profile.png" importance="low" alt="" />
            </div>
            <div class="user-action">
              <ul class="action-option">
                <li class="option username"><span></span></li>
                <li class="option profile"><span></span></li>
                <li class="option logout"><span></span></li>
              </ul>
            </div>
          </div>
          <div class="web-mode">
            <span class="mode">Dark/Light Mode</span>
          </div>
        </div>
      </div>
      <!--Master Quick Links - Mobile Only-->
      <div class="mobile-menu">
        <ul class="navigation-links">
          <li class="nav-link link-home">
            <a href="/" target="" class="home"><span>Home</span></a>
          </li>
          <li class="nav-link link-scores">
            <a href="/cricket/scores-fixtures" target="" class="scores"><span>Cricket Scores</span></a>
          </li>
          <li class="nav-link link-tips-predictions highlight-link">
            <a href="/tips-and-predictions" target="" class="tips-predictions highlight-link"><span>Tips &amp; Predictions</span></a>
          </li>
          <li class="nav-link link-football">
            <a href="/football" target="" class="football"><span>Football</span></a>
          </li>
          <li class="nav-link link-more">
            <button onclick="openMenu()" class="more"><span>More</span></button>
          </li>
        </ul>
      </div>
    </header>
    <div class="second-head-wrapper">
      <section id="" data-component="si-menu" data-template="widget_layout_03">
        <div class="waf-top-bar">
          <div class="waf-trending-article">
            <ul>
              <li class="nav-link link-">
                <a href="/cricket/indian-t20-league" target=""><span>Indian T20 League</span></a>
              </li>
              <li class="nav-link link-">
                <a href="/football/premier-league" target=""><span>Premier League</span></a>
              </li>
            </ul>
          </div>
          <div class="waf-right-elements">
            <div class="social social-share">
              <a href="https://www.facebook.com/SportsAddaOfficial/" target="_blank" class="facebook"><span>Follow us on Facebook</span></a>
              <a href="https://twitter.com/sportsadda_" target="_blank" class="twitter"><span>Follow us on Twitter</span></a>
              <a href="https://www.instagram.com/sportsaddaofficial/" target="_blank" class="instagram"><span>Follow us on Instagram</span></a>
              <a href="https://www.youtube.com/channel/UCqJPjpJcnjJpGJDx5NOddQw" target="_blank" class="youtube"><span>Follow us on YouTube</span></a>
              <a href="https://itunes.apple.com/us/app/stumped/id1465629990?mt=8" target="_blank" class="ios"><span>Download App iOS</span></a>
              <a href="https://play.google.com/store/apps/details?id=com.stumped.app" target="_blank" class="android"
                ><span>Download App Android</span></a
              >
            </div>
            <div class="site-login signInIcon">
              <span class="login userName">Sign In</span>
              <div data-default-img="/static-assets/images/users/default-profile.png" class="icon-user proImage">
                <img
                  src="/static-assets/images/default-profile.png"
                  id="profileImage"
                  importance="low"
                  alt=""
                />
              </div>          
            </div>
          </div>
        </div>
      </section>
    </div>
    <!--Server Side Rendering of On Page Components Starts-->
    <div class="section-wrap">

      <!-- error section starts -->
      <section class="waf-row">
        <div class="waf-view">
          <div class="container">
            <div class="row">
              <div class="col-lg-12">
                <section>
                  <div class="waf-component waf-error-page">
                    <div class="layout-wrapper">
                      <div class="custom-thumbnail">
                        <div class="thumbnail-wrapper">
                          <span>Oops!</span>
                          <img src="/static-assets/images/error-thumb.png" alt="" importance="low" />
                        </div>
                      </div>
                      <div class="custom-content">
                        <div class="content-wrap">
                          <h4 class="title">We’ve been Stumped.</h4>
                          <span class="sub-title">Maybe we need to go back to the nets. This is either because:</span>
                          <ul>
                            <li>
                              <p>There is an error in the URL you have entered in your browser.</p>
                              <p>Please check the spelling and try again.</p>
                            </li>
                            <li>
                              <p>The page you are looking for may have been moved, updated or deleted.</p>
                            </li>
                          </ul>
                          <div class="content-footer">
                            <span class="text">You may return to the Homepage by</span>
                            <a href="/" class="btn btn-site">Clicking Here</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!--Server Side Rendering of On Page Components Ends-->
    <footer>
      <div class="site-footer">
        <div class="footer-top">
          <span class="footer-text">&copy; Stumped entertainment FZE | All Rrights Reserved</span>
        </div>
        <div class="footer-middle">
          <span class="footer-text"
            >For more enquiries email us at <a href="mailto:info@sportsadda.com" target="_blank" class="link-text">info@sportsadda.com</a></span
          >
        </div>
        <div class="footer-bottom">
          <div class="footer-links">
            <a href="/contact-us" title="Contact Us">Contact Us</a>
            <a href="/terms-and-conditions" title="Terms & Conditions">Terms & Conditions</a>
            <a href="/privacy-policy" title="Privacy Policy">Privacy Policy</a>
            <a href="/cookie-policy" title="Cookie Policy">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
   props: {  
    isMobile:Boolean   
  },
  head() {
    let jsVersion =  this.$config.cmsConfig.content.jsversion;
    let cssVersion =  this.$config.cmsConfig.content.cssversion;  
    return {
      link: [
        { rel: "preload", as: "style", href: `/static-assets/build/css/core.css?v=${cssVersion}` },
        { rel: "stylesheet", href: `/static-assets/build/css/core.css?v=${cssVersion}`, onload: "this.media='all'", media: "print" },
        { rel: "preload", as: "style", href: `/static-assets/build/css/main.css?v=${cssVersion}` },
        { rel: "stylesheet", href: `/static-assets/build/css/main.css?v=${cssVersion}`, onload: "this.media='all'", media: "print" },
        { rel: "preload", as: "style", href: `/static-assets/build/css/error.css?v=${cssVersion}` },
        { rel: "stylesheet", href: `/static-assets/build/css/error.css?v=${cssVersion}`, onload: "this.media='all'", media: "print" },
      ],
      script: [
        {
          script: `/static-assets/build/js/main.js?v=${jsVersion}`,
          body: true,
          async: true
        }
      ]
    };
  },
  data() {
    return {
      text: ""
    };
  },
  async fetch() {
    try {
      this.text = "Error Template";
    } catch (e) {
      console.log(e);
    }
  }
};
</script>

<style></style>
