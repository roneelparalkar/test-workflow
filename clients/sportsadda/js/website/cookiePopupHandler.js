import { getCookie, isNull } from "./../../../../sdk/WidgetLibrary/utils";

function cookiePopupHandler() {
  let acceptCookie = getCookie("allowCookie");
  if (isNull(acceptCookie)) {
    //show cookie pop up
    return true
  } else {
    //hide pop up  
    return false
  }
}

export default cookiePopupHandler;