(function () {
    let configs = [{
        id: 'gamePlayConfig',
        name: 'Gameplay Config',
        key: 'gamePlayConfig'
    },
    {
        id: 'matchmakingLevels',
        name: 'Match making levels',
        key: 'level'
    },
    {
        id: 'ledMessages',
        name: 'Led Messages',
        key: 'ledMsg'
    },
    {
        id: 'matchConfig',
        name: 'Match Config',
        key: 'matchConfig',
    },
    ];
    const API = '/api/show-config';
    const RESET_CONFIG_API = '/api/reset-config';
    const UPDATE_CONFIG = '/api/update-config';
    window.configs = configs;
    let htmlMarkup = '';
    for (let i = 0; i < configs.length; i += 2) {
        let index = i;
        let configData1 = configs[i];
        let configData2 = configs[i + 1];
        htmlMarkup += `
        <div class="row">
            <div class="col-md-6 col-xl-6">
                <div class="card mb-3 widget-content bg-midnight-bloom">
                    <div class="widget-content-wrapper text-white">
                        <div class="widget-content-left">
                            <div class="widget-heading">${configData1.name}
                                <button class="mb-2 mr-2 btn btn-danger active" onclick="updateConfig('${i}')">Update</button>
                                <button class="mb-2 mr-2 btn btn-warning active" onclick="resetConfig('${i}')">Reset To Default</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="jsoneditor${i}" style="width: 100%; height: 400px;"></div>
            </div>
            <div class="col-md-6 col-xl-6">
                <div class="card mb-3 widget-content bg-arielle-smile">
                    <div class="widget-content-wrapper text-white">
                        <div class="widget-content-left">
                            <div class="widget-heading">${configData2.name}
                                <button class="mb-2 mr-2 btn btn-danger active" onclick="updateConfig('${i + 1}')">Update</button>
                                <button class="mb-2 mr-2 btn btn-warning active" onclick="resetConfig('${i + 1}')">Reset To Default</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="jsoneditor${i + 1}" style="width: 100%; height: 400px;"></div>
            </div>
        </div>
        <br>
        <hr>
        <br>`;

        htmlMarkup
    }

    const apiCaller = (api, body, method) => {
        return new Promise((resolve) => {
            let options = {
                headers: {
                    entity: window.TOKEN,
                    'Content-Type': 'application/json'
                },
                method: method ? method : 'GET'
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            fetch(api, options).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (data.error) {
                    if (data.error === '301') {
                        logout();
                    } else if (data.error === '109') {
                        showToastMessage('User no longer found in the queue');
                        const gameLinkContainer = document.getElementById('gameLink');
                        gameLinkContainer.innerHTML = `<p>Either the user has left or has already been matched with some user.</p>`
                    } else {
                        showToastMessage('Something went wrong');
                    }
                } else {
                    resolve(data);
                }
            }).catch(function (err) {
                showToastMessage('Something went wrong');
                console.log('Something went wrong.', err);
            });
        })
    };

    window.updateConfig = (index) => {
        try {
            let newConfig = {};
            newConfig.configId = configs[index].id;
            newConfig.value = configs[index].editor.get();
            apiCaller(UPDATE_CONFIG, newConfig, 'POST')
                .then(response => {
                    if (response.status === 'success') {
                        showToastMessage('Configuration updated successfully');
                    }
                })
        } catch (e) {
            alert('Invalid JSON');
        }
    };

    window.resetConfig = (index) => {
        let newConfig = {};
        newConfig.configId = configs[index].id;
        apiCaller(RESET_CONFIG_API, newConfig, 'POST')
            .then(response => {
                location.reload();
            })
            .catch((err) => {
                showToastMessage('Something went wrong');
            })
    };

    let parent = document.querySelector('.app-main__inner');
    if (parent) {
        parent.innerHTML += htmlMarkup;


        apiCaller(API)
            .then(response => {
                const options = { mode: 'code' };
                configs.forEach((configData, index) => {
                    const container = document.getElementById('jsoneditor' + index);
                    const editor = new JSONEditor(container, options);
                    editor.set(response[configData.key]);
                    configData.editor = editor;
                });
            })
            .catch(err => {
                console.log(err);
            });
    };

})();