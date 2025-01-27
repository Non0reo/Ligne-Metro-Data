const dropdownStation = document.getElementById('search-station');
const dropdownLine = document.getElementById('search-line');
const searchButton = document.getElementById('search-button');

const disabledLines = ['4', '5', '7', '8', 'Transilien P', 'Transilien N', 'Transilien K', 'Transilien J']

dropdownStation.addEventListener('change', () => {
});

dropdownLine.addEventListener('change', () => {
    createStopList(getLineFromName(dropdownLine.value));
});

searchButton.addEventListener('click', () => {
    const station = dropdownStation.value === 'all' ? 'all' : getStopFromName(dropdownStation.value);
    const line = getLineFromName(dropdownLine.value);
    console.log(station, line);

    removeCards()
    if (station === 'all') {
        console.log(line);
        // put stop in order from terminus to this.next
        //get terminus that has a next property that is not null
        const stops = stopsInOrder(line);
        addCards(stops);
    }
    else {
        addCards([getLineStop(station, line)]);
    }
});


function stopsInOrder(line) {
    const lineTerminus = line.terminus.find(stop => stop.next[0]);
    console.log(lineTerminus);
    let lineStop = [lineTerminus];
    let lastStop = lineTerminus;
    for (let i = 0; i < line.stops.length - 1; i++) {
        console.log(lastStop, lastStop.next[0]);
        lastStop = lastStop.next[0];
        lineStop.push(lastStop);
        if (lastStop.isTerminusOfLine) {
            break;
        }
    }
    return lineStop;
}


function createLineList() {
    while (dropdownLine.firstChild) {
        dropdownLine.removeChild(dropdownLine.firstChild);
    }

    lines.forEach(line => {
        let option = document.createElement('option');
        option.value = line.name;
        option.textContent = line.name;
        if (disabledLines.includes(line.name)) {
            option.disabled = true;
        }
        dropdownLine.appendChild(option);
    });
}


function createStopList(line) {
    while (dropdownStation.firstChild) {
        dropdownStation.removeChild(dropdownStation.firstChild);
    }

    if (line) {
        //add all stops option
        let option = document.createElement('option');
        option.value = 'all';
        option.textContent = 'All Stations';
        dropdownStation.appendChild(option);

        const stops = line.stops;
        stops.forEach(stop => {
            let option = document.createElement('option');
            option.value = stop.name;
            option.textContent = stop.name;
            dropdownStation.appendChild(option);
        });
        return;
    }

    stops.forEach(stop => {
        let option = document.createElement('option');
        option.value = stop.name;
        option.textContent = stop.name;
        dropdownStation.appendChild(option);
    });
}


function loadSearchResults() {
    createLineList();
    createStopList(getLineFromName(document.getElementById('search-line').value));
    removeCards();
}