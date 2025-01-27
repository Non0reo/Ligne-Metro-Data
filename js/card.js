function appendConnections(stop, card) {
    let connections = stop.connections;
    connections = connections.filter(connection => connection.lineID !== stop.line.lineID);

    const connectionMetro = document.querySelectorAll('.connect_metro')[card];
    const connectionRER = document.querySelectorAll('.connect_rer')[card];
    const connectionTrain = document.querySelectorAll('.connect_train')[card];
    const allConnection = document.querySelectorAll('.connect_transport');

    for (let i = card * 3; i < card * 3 + 3; i++) {
        const connection = allConnection[i];
        connection.style.display = 'none';
        while (connection.firstChild) {
            connection.removeChild(connection.firstChild);
        }
    }

    const hasMetro = connections.some(connection => connection.mode.includes('metro'));
    const hasRER = connections.some(connection => connection.mode.includes('rer'));
    const hasTrain = connections.some(connection => connection.mode.includes('rail'));

    if (hasMetro) {
        connectionMetro.style.display = 'flex';
        let metro = document.createElement('img');
        metro.src = 'assets/icons/symbole_metro_RVB.svg';
        metro.alt = 'metro';
        metro.classList.add('connected-symbol');
        connectionMetro.appendChild(metro);
    }
    if(hasRER) {
        connectionRER.style.display = 'flex';
        let rer = document.createElement('img');
        rer.src = 'assets/icons/symbole_RER_RVB.svg';
        rer.alt = 'rer';
        rer.classList.add('connected-symbol');
        connectionRER.appendChild(rer);
    }
    if(hasTrain) {
        connectionTrain.style.display = 'flex';
        let train = document.createElement('img');
        train.src = 'assets/icons/symbole_train_RVB.svg';
        train.alt = 'train';
        train.classList.add('connected-symbol');
        connectionTrain.appendChild(train);
    }


    connections.forEach(connection => {
        let connectedLine = document.createElement('img');
        connectedLine.src = `${connection.picto.url}`;
        connectedLine.alt = connection.lineID;
        connectedLine.classList.add('connected-line');
        connectedLine.addEventListener('click', () => {
            removeCards();
            console.log(connection);
            let stops = stopsInOrder(connection);
            console.log(stops);
            addCards(stops);
        });
    
        switch(connection.mode) {
            case 'metro':
                connectedLine.classList.add('metro');
                connectionMetro.appendChild(connectedLine);
                break;
            case 'rer':
                connectedLine.classList.add('rer');
                connectionRER.appendChild(connectedLine);
                break;
            case 'rail':
                connectedLine.classList.add('train');
                connectionTrain.appendChild(connectedLine);
                break;
        }
    });
}

function changeLine(stop, card) {
    const lineColor = document.querySelectorAll('.line-color')[card];  
    const stationColor = document.querySelectorAll('.station-color')[card];
    
    if(card === 0 && stop.isTerminusOfLine) {
        lineColor.style.background = `linear-gradient(180deg, transparent 50%, #${stop.line.color} 51%)`;
    } else if(stop.line.terminus[1] === stop) {
        lineColor.style.background = `linear-gradient(0deg, transparent 50%, #${stop.line.color} 51%)`;
    } else {
        lineColor.style.background = `#${stop.line.color}`;
    }

    //console.log(stop.isTerminusOfLine, card, stop.line.terminus[1] === stop);
    
    stationColor.style.border = `2px solid black`;

    let connections = stop.connections;
    connections = connections.filter(connection => connection.lineID !== stop.line.lineID);

    if (stop.isTerminusOfLine) {
        stationColor.style.backgroundColor = `black`;
    }
    else if(connections.length === 0) {
        stationColor.style.backgroundColor = `#${stop.line.color}`;
        stationColor.style.border = `2px solid #${stop.line.color}`;
    }
    else {
        stationColor.style.backgroundColor = `white`;
        
    }

}


function setStopName(stop, card) {
    const stationInfoDiv = document.querySelectorAll('.station-infos')[card];
    while (stationInfoDiv.firstChild) {
        stationInfoDiv.removeChild(stationInfoDiv.firstChild);
    }

    let stationName = document.createElement('div');
    let stopName = document.createElement('div');
    let stopSubName = document.createElement('div');

    stationName.classList.add('station-name');
    stopName.classList.add('main-name');
    stopSubName.classList.add('sub-name');


    let mainNameElement = document.createElement('span');
    mainNameElement.textContent = stop.name;
    
    stopName.appendChild(mainNameElement);
    stationInfoDiv.appendChild(stationName);
    stationName.appendChild(stopName);

    stopSubName.style.maxWidth = stopName.clientWidth + 'px';
    stationName.appendChild(stopSubName)
    
;
    if(stop.subname === null) {
        stopSubName.style.display = 'none';

    } else {
        stopSubName.style.display = 'block';
        let subNameElement = document.createElement('span');
        subNameElement.textContent = stop.subname;
        stopSubName.appendChild(subNameElement);
        
    }
}

function setStopAccessibility(stop, card) {
    const stationInfoDiv = document.querySelectorAll('.station-infos')[card];

    let accessibilityElement = document.createElement('img');
    accessibilityElement.src = stop.accessibilityLevel >= 4 || stop.line.isAccessible ? 'assets/icons/Accessible_UFR_RVB.svg' : 'assets/icons/Non_accessible_UFR_RVB.svg';;
    accessibilityElement.alt = stop.accessibilityLevel;
    accessibilityElement.setAttribute('title', stop.accessibilityLevel);
    accessibilityElement.classList.add('accessibility');
    stationInfoDiv.appendChild(accessibilityElement);
}


function changeCard(stop, card) {
    appendConnections(stop, card);
    changeLine(stop, card);
    setStopName(stop, card);
    setStopAccessibility(stop, card);
}



//creerCarte
function createCard() {
    let card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
            <div class="stop">
            <div class="line-color">
                <div class="station-color"></div>
            </div>

            <div class="connection">
                <div class="connect_transport connect_metro"></div>
                <div class="connect_transport connect_rer"></div>
                <div class="connect_transport connect_train"></div>
            </div>


            <div class="station-infos">
                <div id="station-name">
                    <div class="main-name"></div>
                    <div class="sub-name"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(card);
    return document.querySelectorAll('.card').length - 1;
}

//creerCarte prend en entrée les stops
function addCards(stops) {
    stops.forEach(stop => {
        let card = createCard();
        changeCard(stop, card);
    });
}

function removeCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.remove());
}


