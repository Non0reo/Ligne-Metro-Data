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
        this.color = data.color;
        this.mode = data.mode;
        this.lineID = data.lineID;
        this.stops = data.stops;
        this.picto = data.picto;
        this.shape = data.shape;
        this.isAccessible = data.isAccessible;
        this.stopCount = data.stopCount;
        this.nameUpper = data.nameUpper;
        this.terminus = data.terminus;
    }
}

class Stop {
    constructor(data) {
        this.name = data.name;
        this.subname = data.subname;
        this.stationID = data.stationID;
        this.connections = data.connections;
        this.hasConnections = data.hasConnections;
        this.connectionCount = data.connections.length;
        this.accessibilityLevel = data.accessibilityLevel;
        this.isTerminusOfLine = data.isTerminusOfLine;
        this.terminusFor = data.terminusFor;
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
        console.log(linesRaw);
        linesRaw.forEach(line => {
            lines.push(
                new Line({
                    name: line.shortname_groupoflines,
                    lineID: line.id_line,
                    color: line.colourweb_hexa,
                    picto: line.picto,
                    mode: line.transportmode,
                    isAccessible: line.accessibility,
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
        const terminusNames = ['termetro', 'tertram', 'tertrain', 'terrer', 'terval'];

        let stopsRaw = json.filter(stop => lines.some(line => line.lineID === stop.idrefligc));
         console.log(stopsRaw);
        //add stops to the stops array. Each stop need to appear one time only. If a stop appears multiple times, reference every lines that are stopping there in the connections array.
        stopsRaw.forEach((stop, i) => {
            if (!stops.some(s => s.stationID === stop.id_ref_zdc)) {
                stops.push(
                    new Stop({
                        name: stop.nom_gares,
                        subname: stop.nom_so_gar,
                        stationID: stop.id_ref_zdc,
                        connections: [lines.find(line => line.lineID === stop.idrefligc)],
                        hasConnections: false,
                        isAccessible: undefined,
                        isTerminusOfLine: terminusNames.some(term => stop[term] !== '0'),
                        terminusFor: terminusNames.filter(term => stop[term] !== '0').map(term => stop[term]),
                        coordonates: stop.geo_point_2d
                    })
                );
            }
            else {
                let declaredStop = stops.find(s => s.stationID === stop.id_ref_zdc);
                declaredStop.connections.push(lines.find(line => line.lineID === stop.idrefligc));
                declaredStop.connectionCount = declaredStop.connections.length;
                console.log(declaredStop.terminus)
                declaredStop.terminusFor.push(...terminusNames.filter(term => stop[term] !== '0').map(term => stop[term]));
                declaredStop.hasConnections = true;
            }

        });
        loadAccessiblity();

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
            line.terminus = line.stops.filter(stop => stop.isTerminusOfLine && stop.terminusFor.includes(line.name));

            //J'en ai chié pour trouver les lignes d'en dessous        
            const firstStop = line.stops[0];
            let possibleStopList = stopsRaw.filter(stop => firstStop.stationID === stop.id_ref_zdc && firstStop.connections.some(connection => connection.name === line.name));
            line.nameUpper = possibleStopList.filter(stop => stop.idrefligc === line.lineID)[0].res_com;

        });

        //change line.termiusFor nameUpper format to the actual line object 
        lines.forEach(line => {
            line.terminus.forEach(terminus => {
                terminus.terminusFor = terminus.terminusFor.map(terminus => lines.find(line => line.name === terminus));
            });
        });

        console.log(lines);
        loadShapes();
    });
}

async function loadAccessiblity() {
    await fetch('./accessibility.json')
    .then((response) => response.json())
    .then((json) => {
        stops.forEach(stop => {
            let accessibilityRaw = json.filter(accessibility => stop.stationID.toString() === accessibility.stop_point_id.replace('stop_point:IDFM:monomodalStopPlace:', ''))[0];
            if (accessibilityRaw) {
                stop.accessibilityLevel = accessibilityRaw.accessibility_level_id;
            }
        });
    });
}

function loadShapes() {
    fetch('./shapes.json')
    .then((response) => response.json())
    .then((json) => {
        lines.forEach(line => {
            let shapeRaw = json.filter(shape => shape.idrefligc === line.lineID)/* [0].shape.geometry.coordinates */;
            // console.log(shapeRaw, line.stopCount - 1);
            //console.log(line.name, shapeRaw);
            //console.log(line.name, line.stopCount, shapeRaw.filter(array => array.length === line.stopCount).length !== 0, shapeRaw, shapeRaw.filter(array => array.length === line.stopCount));

            

            shapeRaw.forEach(shape => {
                const coordinates = shape.geo_shape.geometry.coordinates;

                let section = {
                    from: coordinates[0],
                    to: coordinates[coordinates.length - 1],
                    fromStop: stopFromGeoPoint(coordinates[0][0], coordinates[0][1]),
                    toStop: stopFromGeoPoint(coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1])
                }

                //console.log(section);
            });

        });


    });
}


findStopFromName = (name) => {
    return stops.find(stop => stop.name === name);
}

findLineFromName = (name) => {
    return lines.find(line => line.name === name);
}

//get the closest stop from a geopoint
stopFromGeoPoint = (lon, lat) => {
    let closestStop = findStopFromName('Les Halles');
    let closestDistance = Math.sqrt(Math.pow(lat - closestStop.coordonates.lat, 2) + Math.pow(lon - closestStop.coordonates.lon, 2));
    stops.forEach(stop => {
        let distance = Math.sqrt(Math.pow(lat - stop.coordonates.lat, 2) + Math.pow(lon - stop.coordonates.lon, 2));
        if (distance < closestDistance) {
            //console.log('new closest stop', stop);
            closestDistance = distance;
            closestStop = stop;
        }
    });
    return closestStop;
}

createUpperName = (name, mode) => {
    //if the mode is rail, 
}