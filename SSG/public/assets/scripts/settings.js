(function() {
  window.editValue = id => {
    const selectedRow = document.querySelector("#" + id);
    const valueElem = selectedRow.querySelector(".value");
    valueElem.innerHTML = `<input type="number" value="${valueElem.innerHTML}">`;
    const editBtn = selectedRow.querySelector(".btn-info");
    editBtn.style.display = "none";

    const updateBtn = selectedRow.querySelector(".btn-danger");
    updateBtn.style.display = "";
  };

  window.updateValue = id => {
    const selectedRow = document.querySelector("#" + id);
    const valueElem = selectedRow.querySelector(".value input");
    if (!valueElem.value) {
      showToastMessage("Invalid Value");
    } else {
      apiCaller("/api/update-settings", {
        settingName: id,
        settingValue: valueElem.value
      })
        .then(resp => {
          window.location.reload();
        })
        .catch(err => {
          window.location.reload();
        });
    }
  };

  apiCaller("/api/get-settings").then(resp => {
    Object.keys(resp).forEach(key => {
      const settingRow = document.querySelector(`#${key}`);
      if (settingRow) {
        const settingValueElem = settingRow.querySelector(`.value`);
        if (settingValueElem) {
          settingValueElem.innerHTML = resp[key];
        }
      }
    });
  });
})();
