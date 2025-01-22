const connectionDiv = document.getElementById('connection');

let actualStop;


function appendConnections(stop) {
    let connections = stop.connections;
    connections.forEach(connection => {
        console.log(connection);
    });
}


setTimeout(() => {
    let actualStop = getLineStop(getStopFromName('Châtelet'), getLineFromName('1'));
    console.log(actualStop);
    appendConnections(actualStop);
}, 200);