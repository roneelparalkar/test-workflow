(function () {
    const API = '/api/getDateWiseGames/';
    let searchText = '';
    const apiCaller = (api, body, method) => {
        return new Promise((resolve) => {
            fetch(api, {
                headers: {
                    entity: window.TOKEN
                }
            }).then(function (response) {
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


    const gameModes = {
        "1": "Friends",
        "2": "Online",
        "3": "SI-Online",
        "4": "Bot-Online",
        "5": "Solo",
        "6": "Rematch",
        "7": "Bot-Rematch"
    };
    const gameStatus = {
        1: "Live",
        2: "Interrupted",
        3: "Completed",
        4: "Abandoned",
        5: "Awarded",
        6: "Not Started"
    };

    let searchButton = document.querySelector('.searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            let date = document.querySelector('#dateToSearch').value;
            if (date) {
                apiCaller(API + date)
                    .then(response => {
                        let markup = '';
                        if (response && response.data) {
                            response.data.forEach((row, index) => {
                                markup += `
                            <tr data-info="${row.cf_gameid} ${row.user_a_score} && ${row.user_b_score} ${row.username_a} VS ${row.username_b} ${gameModes[row.game_mode]} ${gameStatus[row.game_status]} ${row.created_date}">
                                <td>${index + 1}</td>
                                <td>${row.cf_gameid}</td>
                                <td title="${row.user_a} & ${row.user_b}">${row.username_a} VS ${row.username_b}</td>
                                <td>${row.user_a_score} && ${row.user_b_score}</td>
                                <td>${gameModes[row.game_mode]}</td>
                                <td>${gameStatus[row.game_status]}</td>                                
                                <td>${row.created_date}</td>
                            </tr>
                            `
                            });
                        }
                        document.querySelector('#dateWiseGames tbody').innerHTML = markup;
                        searchTable('dateWiseGames', searchText);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        });
    }

    const searchTable = (tableID, textToSearch) => {
        textToSearch = textToSearch.toLowerCase();
        let table = document.querySelector('#' + tableID);
        if (table) {
            let tableBody = table.querySelector('tbody');
            let rows = tableBody.querySelectorAll('tr');
            if (rows && rows.length) {
                Array.from(rows).forEach(rowElement => {
                    if (rowElement.hasAttribute('data-info')) {
                        let dataAttribute = rowElement.getAttribute('data-info');
                        if (dataAttribute && dataAttribute.toLowerCase().includes(textToSearch)) {
                            rowElement.style.display = '';
                        } else {
                            rowElement.style.display = 'none';
                        }
                    }
                });
            }
        }
    };

    window.searchTable = searchTable;

    let searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            searchText = searchInput.value;
            searchTable('dateWiseGames', searchText);
        });
    }
})();