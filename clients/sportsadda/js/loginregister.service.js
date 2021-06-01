import { postJsonData, getJsonData } from "../../../sdk/WidgetLibrary/utils";
// import { ApiResponse } from '../models/social-api-model';

export async function registerUser(registerData) {
  return postJsonData(window.webConfig.signUp.registerUser, registerData);
}

export async function signInUser(signInData) {
  return postJsonData(window.webConfig.login.login, signInData);
}

export async function forgotPwdUser(forgotPwdData) {
  return postJsonData(window.webConfig.login.forgotPwd, forgotPwdData);
}

export async function verifyOTP(verifyData) {
  return postJsonData(window.webConfig.profile.verifyOtp, verifyData);
}

export async function sendOTP(verifyData) {
  return postJsonData(window.webConfig.profile.sendOtp, verifyData);
}

export async function resetPwdUser(resetPwdData) {
  return postJsonData(window.webConfig.login.resetPwd, resetPwdData);
}

export async function verifyUserAfterRegister(queryParams) {
  return postJsonData(window.webConfig.signUp.verifyAfterRegister, queryParams);
}

export async function checkUserExist(queryParams) {
  return getJsonData(window.webConfig.signUp.checkUserExist, queryParams);
}
export async function uploadProfile(uploadProfileData, isLogin) {
  let url;
  if (isLogin) {
    url = window.webConfig.profile.uploadProfileLogin.replace("{{ISLOGIN}}",isLogin);
  } else {
    url = window.webConfig.profile.uploadProfile;
  }
  return postJsonData(url, uploadProfileData);
}

export async function getRandomToken() {
  return getJsonData(window.webConfig.login.getRandomToken);
}

export async function getProfileUser(queryParam) {
  return getJsonData(window.webConfig.profile.getProfileUser, queryParam);
}

export async function updateProfileUser(updateProfileData) {
  return postJsonData(window.webConfig.profile.updateProfileUser, updateProfileData);
}

export async function getSportsData() {
  return getJsonData(window.webConfig.profile.getSportsData);
}

export async function logOutUser(logOutData) {
  return postJsonData(window.webConfig.login.logout, logOutData);
}

export async function acceptCookies(cookiePayload)  {
  return postJsonData(window.webConfig.login.acceptCookies, cookiePayload);
}

export async function getUnsubscribedInfo(guid) {
  return getJsonData(window.webConfig.login.getUnsubscribedInfo.replace("{{GUID}}",guid));
}

export async function submitUnsubscribe(UnsubscribeRequestData) {
  return postJsonData(window.webConfig.login.submitUnsubscribe, UnsubscribeRequestData);
}