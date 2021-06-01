(function() {
  const loginCheckInterval = 60;
  const apiCaller = (api, body) => {
    return new Promise(resolve => {
      let options = {
        method: body ? "POST" : "GET",
        headers: {
          entity: window.TOKEN,
          "Content-Type": "application/json"
        }
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      fetch(api, options)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.error) {
            if (data.error === "301") {
              logout();
            } else {
              showToastMessage("Something went wrong");
            }
          } else {
            resolve(data);
          }
        })
        .catch(function(err) {
          showToastMessage("Something went wrong");
          console.log("Something went wrong.", err);
        });
    });
  };
  window.apiCaller = apiCaller;
  const checkLogin = () => {
    setInterval(() => {
      apiCaller("/api/check-login");
    }, loginCheckInterval * 1000);
  };
})();
