const connectionMetro = document.querySelector('.connect_metro');
const connectionRER = document.querySelector('.connect_rer');
const connectionTrain = document.querySelector('.connect_train');
const connectionDiv = document.querySelector('.connection');

let actualStop;


function appendConnections(stop) {
    let connections = stop.connections;
    connections = connections.filter(connection => connection.lineID !== stop.line.lineID);

    const allConnection = document.querySelectorAll('.connect_transport');
    allConnection.forEach(connection => {
        connection.style.display = 'none';
        while (connection.firstChild) {
            connection.removeChild(connection.firstChild);
        }
    });

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

function changeLine(stop) {
    const lineColor = document.querySelector('.line-color');  
    const stationColor = document.querySelector('.station-color');
    
    lineColor.style.backgroundColor = `#${stop.line.color}`;
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


function setStopName(stop) {
    const stationInfoDiv = document.querySelector('.station-infos');
    while (stationInfoDiv.firstChild) {
        stationInfoDiv.removeChild(stationInfoDiv.firstChild);
    }

    let stationName = document.createElement('div');
    let stopName = document.createElement('div');
    let stopSubName = document.createElement('div');

    stationName.classList.add('station-name');
    stopName.classList.add('main-name');
    stopSubName.classList.add('sub-name');

    stationInfoDiv.appendChild(stationName);
    stationName.appendChild(stopName);
    stationName.appendChild(stopSubName)


    let mainNameElement = document.createElement('span');
    mainNameElement.textContent = stop.name;
    
    stopName.appendChild(mainNameElement)
    
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

function setStopAccessibility(stop) {
    const stationInfoDiv = document.querySelector('.station-infos');

    let accessibilityElement = document.createElement('img');
    accessibilityElement.src = stop.accessibilityLevel >= 4 || stop.line.isAccessible ? 'assets/icons/Accessible_UFR_RVB.svg' : 'assets/icons/Non_accessible_UFR_RVB.svg';;
    accessibilityElement.alt = stop.accessibilityLevel;
    accessibilityElement.setAttribute('title', stop.accessibilityLevel);
    accessibilityElement.classList.add('accessibility');
    stationInfoDiv.appendChild(accessibilityElement);
}


function changeCard(stop) {
    appendConnections(stop);
    changeLine(stop);
    setStopName(stop);
    setStopAccessibility(stop);
}


setTimeout(() => {
    let actualStop = getLineStop(getStopFromName('La Défense'), getLineFromName('RER A'));
    // let actualStop = getLineStop(getStopFromName('Cormeilles-en-Parisis'), getLineFromName('Transilien J'))
    //let actualStop = getLineStop(getStopFromName('Rambuteau'), getLineFromName('11'));
    // let actualStop = getLineStop(getStopFromName('Saint-Lazare'), getLineFromName('Transilien J'));
    // let actualStop = getLineStop(getStopFromName('Châtelet'), getLineFromName('1'));
    changeCard(actualStop);
}, 200);