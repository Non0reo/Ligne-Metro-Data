/* class Arret {
    constructor(data) {
        this.previous = data.previous;
        this.next = data.next;
        this.name = data.name;
        this.subname = data.subname;
        this.line = data.line;
        this.color = data.color;
        this.connections = data.connections;
        this.hasConnections = data.hasConnections;
        this.isAccessible = data.isAccessible;
        this.isTerminus = data.isTerminus;
    }
}

class Line {
    constructor(data) {
        
        this.color = data.color;
        this.stops = data.stops;
    }
}


const stops = {
    line: ,
    previous: Arret()
} */

class Line {
    constructor(data) {
        this.name = data.name;
        this.lineID = data.lineID;
        this.color = data.color;
        this.mode = data.mode;
        this.stops = data.stops;
        this.picto = data.picto;
        this.shape = data.shape;
        this.stopCount = undefined;
    }
}

class Stop {
    constructor(data) {
        this.name = data.name;
        this.stationID = data.stationID;
        this.subname = data.subname;
        this.connections = data.connections;
        this.hasConnections = data.hasConnections;
        this.connectionCount = data.connections.length;
        this.isAccessible = data.isAccessible;
        this.isTerminus = data.isTerminus;
        this.coordonates = data.coordonates;
    }

    
}

class LineStop extends Stop {
    constructor(data) {
        super(data);
        this.line = data.line;
        this.color = data.color;
        this.lineID = data.lineID;
        this.previous = data.previous;
        this.next = data.next;
    }
}



const acceptedTransportModes = ['metro', 'tramway', 'rail', 'funicular'];


let lines = [];
let stops = [];

fetch('./lignes.json')
    .then((response) => response.json())
    .then((json) => {
        let linesRaw = json.filter(line => acceptedTransportModes.includes(line.transportmode) && line.transportsubmode !== 'regionalRail');
        linesRaw.forEach(line => {
            lines.push(
                new Line({
                    name: line.shortname_groupoflines,
                    lineID: line.id_line,
                    color: line.colourweb_hexa,
                    picto: line.picto,
                    mode: line.transportmode,
                    shape: undefined,
                })
            )
        });

        loadStops();
    });


function loadStops() {
    fetch('./stops.json')
    .then((response) => response.json())
    .then((json) => {
        let stopsRaw = json.filter(stop => lines.some(line => line.lineID === stop.idrefligc));

        //add stops to the stops array. Each stop need to appear one time only. If a stop appears multiple times, reference every lines that are stopping there in the connections array.
        stopsRaw.forEach(stop => {
            if (!stops.some(s => s.stationID === stop.id_ref_zda)) {
                stops.push(
                    new Stop({
                        name: stop.nom_gares,
                        stationID: stop.id_ref_zda,
                        subname: stop.nom_so_gar,
                        connections: lines.filter(line => line.lineID === stop.idrefligc),
                        hasConnections: false,
                        isAccessible: stop.isaccessible,
                        isTerminus: stop.isterminus,
                        coordonates: stop.geo_point_2d
                    })
                );
            } else {
                let declaredStop = stops.find(s => s.stationID === stop.id_ref_zda);
                declaredStop.connections.push(lines.find(line => line.lineID === stop.idrefligc));
                declaredStop.connectionCount = declaredStop.connections.length;
                declaredStop.hasConnections = true;
            }
        });


        lines.forEach(line => {
            //transform stops into LineStop objects
            line.stops = stops.filter(stop => stop.connections.some(connection => connection.lineID === line.lineID)).map(stop => {

                //remove from ...stops.connections the current line
                // let connection = stop.connections.filter(connection => connection.lineID !== line.lineID);
                // stop.connections = connection;
                
                return new LineStop({
                    ...stop,
                    lineID: line.lineID,
                    line: line,
                    color: line.color,
                    previous: undefined,
                    next: undefined
                });
            });

            line.stopCount = line.stops.length;
        });
        console.log(lines);
        loadShapes();
    });
}

function loadShapes() {
    fetch('./shapes.json')
    .then((response) => response.json())
    .then((json) => {
        console.log(json);
        lines.forEach(line => {
            let shapeRaw = json.filter(shape => shape.route_id.replace('IDFM:', '') === line.lineID)[0].shape.geometry.coordinates;
            console.log(line.name, line.stopCount, shapeRaw.filter(array => array.length === line.stopCount).length !== 0, shapeRaw, shapeRaw.filter(array => array.length === line.stopCount));
            line.shape = shapeRaw;
        });


    });
}


findStopFromName = (name) => {
    return stops.find(stop => stop.name === name);
}