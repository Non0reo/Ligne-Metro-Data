class Line {
    constructor(data) {
        this.name = data.name;
        this.color = data.color;
        this.mode = data.mode;
        this.lineID = data.lineID;
        this.stops = data.stops;
        this.picto = data.picto;
        this.isAccessible = data.isAccessible;
        this.stopCount = data.stopCount;
        this.terminus = data.terminus;
        this.sections = [];
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
        this.terminusFor = data.terminusFor;
        this.coordinates = data.coordinates;
    }
}

class LineStop extends Stop {
    constructor(data) {
        super(data);
        this.line = data.line;
        this.color = data.color;
        this.lineID = data.lineID;
        this.previous = [];
        this.next = [];
        this.isTerminusOfLine = data.isTerminusOfLine;
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
                    isAccessible: line.accessibility,
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
                        
                        terminusFor: terminusNames.filter(term => stop[term] !== '0').map(term => getLineFromName(lineUpperName(stop[term])) ),
                        coordinates: stop.geo_point_2d
                    })
                );
            }
            else {
                let declaredStop = stops.find(s => s.stationID === stop.id_ref_zdc);
                declaredStop.connections.push(lines.find(line => line.lineID === stop.idrefligc));
                declaredStop.connectionCount = declaredStop.connections.length;
                declaredStop.terminusFor.push(...terminusNames.filter(term => stop[term] !== '0').map(term => getLineFromName(lineUpperName(stop[term])) ));
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

            loadShapes(line);

            //J'en ai chié pour trouver les lignes d'en dessous        
            // const firstStop = line.stops[0];
            // let possibleStopList = stopsRaw.filter(stop => firstStop.stationID === stop.id_ref_zdc && firstStop.connections.some(connection => connection.name === line.name));
            // line.upperName = possibleStopList.filter(stop => stop.idrefligc === line.lineID)[0].res_com;
            line.stopCount = line.stops.length;
        });


        lines.forEach(line => {
            line.stops.forEach(stop => {
                stop.isTerminusOfLine = stop.terminusFor.includes(line)
            });

            line.terminus = line.stops.filter(stop => stop.isTerminusOfLine); //set line terminus
        });
        
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

function loadShapes(line) {
    fetch('./shapes.json')
    .then((response) => response.json())
    .then((json) => {

        let shapeRaw = json.filter(shape => shape.idrefligc === line.lineID);
        let sectionList = [];

        shapeRaw.forEach(shape => {
            const coordinates = shape.geo_shape.geometry.coordinates;

            let section = {
                from: coordinates[0],
                to: coordinates[coordinates.length - 1],
                fromStop: getLineStop(stopFromGeoPoint(coordinates[0][0], coordinates[0][1]), line),
                toStop: getLineStop(stopFromGeoPoint(coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]), line),
                get fromStopID() {
                    if(this.fromStop) return this.fromStop.stationID;
                },
                get toStopID() {
                    if(this.toStop) return this.toStop.stationID;
                }
            }
            sectionList.push(section);
        });

        line.sections = sectionList;
        line.sections.forEach((section, i) => {
            let lineStop1 = line.stops.find(stop => stop.stationID === section.fromStopID);
            let lineStop2 = line.stops.find(stop => stop.stationID === section.toStopID);

            if(lineStop1 && lineStop1 != lineStop2) lineStop1.next.push(lineStop2);
            if(lineStop2 && lineStop1 != lineStop2) lineStop2.previous.push(lineStop1);
        });

    });
}


getStopFromName = (name) => {
    return stops.find(stop => stop.name === name);
}

getLineFromName = (name) => {
    return lines.find(line => line.name === name);
}

//get the closest stop from a geopoint
stopFromGeoPoint = (lon, lat) => {
    let closestStop = getStopFromName('Les Halles');
    let closestDistance = Math.sqrt(Math.pow(lat - closestStop.coordinates.lat, 2) + Math.pow(lon - closestStop.coordinates.lon, 2));
    stops.forEach(stop => {
        let distance = Math.sqrt(Math.pow(lat - stop.coordinates.lat, 2) + Math.pow(lon - stop.coordinates.lon, 2));
        if (distance < closestDistance) {
            //console.log('new closest stop', stop);
            closestDistance = distance;
            closestStop = stop;
        }
    });
    return closestStop;
}

getLineStop = (stop, line) => {
    return line.stops.find(s => s.stationID === stop.stationID);
}

getLineFromUpperName = (name) => {
    return lines.find(line => line.upperName === name);
}



lineUpperName = (line) => {
    const lineNames = {
        'METRO 1': '1',
        'METRO 2': '2',
        'METRO 3': '3',
        'METRO 3bis': '3 Bis',
        'METRO 4': '4',
        'METRO 5': '5',
        'METRO 6': '6',
        'METRO 7': '7',
        'METRO 7bis': '7 Bis',
        'METRO 8': '8',
        'METRO 9': '9',
        'METRO 10': '10',
        'METRO 11': '11',
        'METRO 12': '12',
        'METRO 13': '13',
        'METRO 14': '14',
        'RER A': 'RER A',
        'RER B': 'RER B',
        'RER C': 'RER C',
        'RER D': 'RER D',
        'RER E': 'RER E',
        'TRAIN H': 'Transilien H',
        'TRAIN J': 'Transilien J',
        'TRAIN K': 'Transilien K',
        'TRAIN L': 'Transilien L',
        'TRAIN N': 'Transilien N',
        'TRAIN P': 'Transilien P',
        'TRAIN R': 'Transilien R',
        'TRAIN U': 'Transilien U',
        'TRAIN V': 'RER C',
        'CDGVAL': 'CDG VAL',
        'ORLYVAL': 'ORLYVAL'
    }

    return lineNames[line];
}