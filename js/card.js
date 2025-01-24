const connectionMetro = document.querySelector('.connect_metro');
const connectionRER = document.querySelector('.connect_rer');
const connectionTrain = document.querySelector('.connect_train');

let actualStop;


function appendConnections(stop) {
    let connections = stop.connections;
    connections = connections.filter(connection => connection.lineID !== stop.line.lineID);

    const hasMetro = connections.some(connection => connection.mode.includes('metro'));
    const hasRER = connections.some(connection => connection.mode.includes('rer'));
    const hasTrain = connections.some(connection => connection.mode.includes('rail'));
    console.log(hasMetro, hasRER, hasTrain);

    if (hasMetro) {
        let metro = document.createElement('img');
        metro.src = 'assets/icons/symbole_metro_RVB.svg';
        metro.alt = 'metro';
        metro.classList.add('connected-symbol');
        connectionMetro.appendChild(metro);
    }
    if(hasRER) {
        let rer = document.createElement('img');
        rer.src = 'assets/icons/symbole_RER_RVB.svg';
        rer.alt = 'rer';
        rer.classList.add('connected-symbol');
        connectionRER.appendChild(rer);
    }
    if(hasTrain) {
        let train = document.createElement('img');
        train.src = 'assets/icons/symbole_train_RVB.svg';
        train.alt = 'train';
        train.classList.add('connected-symbol');
        connectionTrain.appendChild(train);
    }


    connections.sort(
        (a, b) => { // Sort by name
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        }
    ).forEach(connection => {
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
        

        console.log(connection);
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
    const stopName = document.querySelector('.main-name');
    let mainNameElement = document.createElement('span');
    mainNameElement.textContent = stop.name;
    stopName.appendChild(mainNameElement);

    const stopSubName = document.querySelector('.sub-name');
    let subNameElement = document.createElement('span');
    subNameElement.textContent = stop.subname;
    stopSubName.appendChild(subNameElement);
}


setTimeout(() => {
    //let actualStop = getLineStop(getStopFromName('La Défense'), getLineFromName('RER A'));
    let actualStop = getLineStop(getStopFromName('Rambuteau'), getLineFromName('11'));
    console.log(actualStop);
    appendConnections(actualStop);
    changeLine(actualStop);
    setStopName(actualStop);
}, 200);