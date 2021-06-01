const localInfoString = localStorage.getItem("wafSSG");
const localInfo = JSON.parse(localInfoString);
window.TOKEN = "token";

const menus = [
  {
    id: "perMin",
    menuName: "Per Min Routes",
    title: "Dashboard",
    icon: "pe-7s-rocket",
    href: "/generate-per-min.html"
  },
  {
    id: "dynamicRoutes",
    menuName: "One Time Routes",
    title: "Services",
    icon: "pe-7s-refresh-cloud",
    href: "/generate-once.html"
  },
  {
    id: "settings",
    menuName: "Settings",
    title: "Date Wise Games",
    icon: "pe-7s-server",
    href: "/settings.html",
    isAdminMenu: true
  }
];

const checkLogin = () => {
  if (window.location.pathname === "/index.html") {
    if (localInfo && localInfo.isLogin) {
      window.location.href = "/generate-per-min.html";
    }
  } else {
    if (!localInfo || !localInfo.isLogin) {
      
      window.location.href = "/index.html";
    }
    let helloContainer = document.querySelector("#helloUsername");
    helloContainer.innerText = "Hello, " + localInfo.username;

    showAdminTabs(localInfo.isAdmin);
  }
};

const showAdminTabs = isAdmin => {
  const menuMarkupTemplate = `
    <a href="{{HREF}}" class="mm-active">
        <i class="metismenu-icon {{ICON}}"></i>
        {{MENU_NAME}}
    </a>`;
  let menuMarkup = "";
  menus.forEach(menuData => {
    if (menuData.isAdminMenu && !isAdmin) return;
    menuMarkup += menuMarkupTemplate
      .replace("{{MENU_NAME}}", menuData.menuName)
      .replace("{{HREF}}", menuData.href)
      .replace("{{ICON}}", menuData.icon);
  });
  let menuContainerElem = document.querySelector(".menu-container");
  menuContainerElem.innerHTML = menuMarkup;
};

const resetLogin = () => {
  document.querySelector("#username").value = "";
  document.querySelector("#password").value = "";
  let loginForm = document.querySelector("#loginForm");
  loginForm.classList.remove("was-validated");
};

const removeSpaces = input => {
  return input.replace(/ /g, "");
};

const showToastMessage = toastContent => {
  document.querySelector("#toast-message").innerText = toastContent;
  document.querySelector("#toasterMessage").style.display = "block";
  setTimeout(() => {
    document.querySelector("#toasterMessage").style.display = "none";
  }, 1000);
};

const loginUser = (username, password) => {
  fetch(`/api/login?username=${username}&password=${password}`, {
    headers: {
      entity: window.TOKEN
    }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.error) {
        if (data.error === "101") {
          showToastMessage("Invalid username or password");
        } else {
          showToastMessage("Something went wrong");
        }
        resetLogin();
      } else if (data.code === "SUCCESS") {
        let obj = { isLogin: true, username };
        if (data.isAdmin) {
          obj.isAdmin = true;
        }
        localStorage.setItem("wafSSG", JSON.stringify(obj));
        window.location.href = "/generate-per-min.html";
      }
    })
    .catch(function(err) {
      showToastMessage("Something went wrong");
      console.log("Something went wrong.", err);
    });
};

const validateMyForm = () => {
  let loginForm = document.querySelector("#loginForm");
  loginForm.classList.add("was-validated");
  document.querySelector("#username").value = removeSpaces(
    document.querySelector("#username").value
  );
  document.querySelector("#password").value = removeSpaces(
    document.querySelector("#password").value
  );
  let username = document.querySelector("#username").value;
  let password = document.querySelector("#password").value;
  if (username && password) {
    loginUser(username, password);
  } else {
    showToastMessage("Username and Password are required");
  }
};

const logout = () => {
  localStorage.removeItem("wafSSG");
  window.location.href = "/index.html";
};

const bindLogout = () => {
  const logoutBtn = document.querySelector("#logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
};
