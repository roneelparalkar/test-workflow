(function() {
  const tabCount = 2;

  const bindSubmitButtons = () => {
    const routesAddBtn = document.querySelector("#perMinRoutesAddBtn");
    if (routesAddBtn) {
      routesAddBtn.addEventListener("click", addRoutes);
    }

    const routesUpdateBtn = document.querySelector("#perMinRoutesUpdateBtn");
    if (routesUpdateBtn) {
      routesUpdateBtn.addEventListener("click", submitUpdatedRoutes);
    }

    const routesClearBtn = document.querySelector("#perMinRoutesClearBtn");
    if (routesClearBtn) {
      routesClearBtn.addEventListener("click", clearRoutes);
    }
  };

  const bindRoutesBtn = () => {
    const tab0 = document.querySelector("#tab-c-0");
    if (tab0) {
      tab0.addEventListener("click", getPerMinRoutes);
    }

    const tab1 = document.querySelector("#tab-c-1");
    if (tab1) {
      tab1.addEventListener("click", showUpdateTab);
    }

    const tab2 = document.querySelector("#tab-c-2");
    if (tab2) {
      tab2.addEventListener("click", showUploadTab);
    }
    if (tab0) tab0.click();
  };

  const getPerMinRoutes = () => {
    apiCaller("/api/per-min-routes").then(resp => {
      let tableElem = document.querySelector("#per-min-routes");
      const markup = `
        <tr data-attr="{{DATA_ATTR}}" role="row" class="odd">
            <td>{{INDEX}}</td>
            <td>{{ROUTE}}</td>
            <td>
              <button class="mb-2 mr-2 btn btn-danger" onclick="deleteRoute('{{ROUTE}}')">
                Delete
              </button>
            </td>
        </tr>
      `;
      let markupToInject = "";
      if (tableElem) {
        resp.apis.forEach((api, index) => {
          markupToInject += markup
            .replace("{{INDEX}}", index + 1)
            .replace(/{{ROUTE}}/g, api)
            .replace("{{DATA_ATTR}}", api);
        });
      }
      tableElem.querySelector("tbody").innerHTML = markupToInject;
    });
    hideAllTabsAndShowSelectedTab("tab-content-0");
  };

  const showUpdateTab = () => {
    hideAllTabsAndShowSelectedTab("tab-content-1");
  };

  const showUploadTab = () => {
    hideAllTabsAndShowSelectedTab("tab-content-2");
  };

  const hideAllTabsAndShowSelectedTab = selectedTabId => {
    for (let i = 0; i < tabCount; i++) {
      const tabContent = document.querySelector(`#tab-content-${i}`);
      if (selectedTabId === `tab-content-${i}`) {
        tabContent.style.display = "block";
      } else {
        tabContent.style.display = "none";
      }
    }
  };

  const submitUpdatedRoutes = e => {
    e.preventDefault();
    const textAreaElem = document.querySelector("#perMinRoutesInput");
    if (!textAreaElem.value) {
      showToastMessage("Enter Routes");
    } else {
      const rawRoutes = textAreaElem.value;
      const routes = rawRoutes.replace(/(?:\r\n|\r|\n)/g, "||").split("||");
      if (!routes.length || (routes.length === 1 && !routes[0])) {
        showToastMessage("Enter Routes");
        return;
      }
      const validatedRoutes = validateRoutes(routes);
      if (!validatedRoutes.length) {
        showToastMessage("Invalid Routes");
        return;
      }
      apiCaller("/api/update-per-min-routes", {
        routes: validatedRoutes
      }).then(() => {
        showToastMessage("Routes Updated");
        document.querySelector("#perMinRoutesInput").value = "";
      });
    }
  };

  const addRoutes = e => {
    e.preventDefault();
    const textAreaElem = document.querySelector("#perMinRoutesInput");
    if (!textAreaElem.value) {
      showToastMessage("Enter Routes");
    } else {
      const rawRoutes = textAreaElem.value;
      const routes = rawRoutes.replace(/(?:\r\n|\r|\n)/g, "||").split("||");
      if (!routes.length || (routes.length === 1 && !routes[0])) {
        showToastMessage("Enter Routes");
        return;
      }
      const validatedRoutes = validateRoutes(routes);
      if (!validatedRoutes.length) {
        showToastMessage("Invalid Routes");
        return;
      }
      apiCaller("/api/add-per-min-routes", {
        routes: validatedRoutes
      }).then(() => {
        showToastMessage("Routes Added");
        document.querySelector("#perMinRoutesInput").value = "";
      });
    }
  };

  const clearRoutes = e => {
    e.preventDefault();
    apiCaller("/api/update-per-min-routes", {
      routes: []
    }).then(() => {
      showToastMessage("Routes Cleared");
      document.querySelector("#perMinRoutesInput").value = "";
    });
  };

  window.deleteRoute = route => {
    apiCaller("/api/delete-per-min-route", {
      route
    }).then(() => {
      showToastMessage("Routes Deleted");
      const tab0 = document.querySelector("#tab-c-0");
      if (tab0) tab0.click();
    });
  };

  const validateRoutes = routes => {
    routes = routes.filter(route => {
      return route && route[0] === "/" && !route.includes(" ");
    });
    return routes;
  };

  window.filterTable = () => {
    const searchBox = document.querySelector("#searchBox");
    if (searchBox) {
      const searchValue = searchBox.value;
      const tableBody = document.querySelectorAll("#per-min-routes tbody tr");
      tableBody.forEach(elem => {
        if (elem.getAttribute("data-attr").includes(searchValue)) {
          elem.style.display = "";
        } else {
          elem.style.display = "none";
        }
      });
    }
  };

  bindRoutesBtn();
  bindSubmitButtons();
})();
