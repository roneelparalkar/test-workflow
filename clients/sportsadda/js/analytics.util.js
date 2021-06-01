
export default function trackAnalytics() {
  let {event,type,url,title,extra,category,label,value} = window.analyticsObj;
  //  GTM = 1 & GTAG = 2
  if(type === 1){
    let gtmObj = {
      event: event,
      customGtmElementUrl: url,
      customGtmOriginalEvent: title,
      customGtmElement: extra
    }
    if(window.dataLayer){
      window.dataLayer.push(gtmObj);
    }
  }
  else if(type === 2){
    gtag('event', action, {
      'event_category': category,
      'event_label': label,
      'value': value
    });
  }
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
  
}
