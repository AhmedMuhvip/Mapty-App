'use strict';

// prettier-ignore

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// let map, mapEvent;
class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords; //[lat, lng]
        this.distance = distance;
        this.duration = duration;
    }
}
class Running extends Workout {
    type = 'running'
        ; constructor(coords, distance, duration, cadence) {
            super(coords, distance, duration);
            this.cadence = cadence;
            this.calcPace();
        }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

const run1 = new Running([41.0353664, 28.6785536], 5.2, 24, 178);
const Cycle1 = new Cycling([41.0353664, 28.6785536], 27, 95, 523);
console.log(run1);
console.log(Cycle1);

class App {
    #map;
    #mapEvent;
    #workouts = [];
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkOut.bind(this));

        inputType.addEventListener('change', this.toggleElevetionField);
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this),
            function () {
                alert('Could not get your position');
            }
        );
    }

    _loadMap(position) {
        // Sucess Function
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];
        console.log(this);
        this.#map = L.map('map').setView(coords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    toggleElevetionField() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkOut(e) {
        const validInputs = (...input) => input.every(inp => Number.isFinite(inp));
        const positiveNumber = (...input) => input.every(inp => inp > 0);

        e.preventDefault();
        // Get The Data From The Form;
        const type = inputType.value;
        const distance = +inputDistance.value; // this value will come like string so to can convert it to number we user + 'unary operator'
        const duration = +inputDuration.value; // this value will come like string so to can convert it to number we user + 'unary operator'
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // if activaty running , Maked Running Object
        if (type === 'running') {
            const cadence = +inputCadence.value;
            // Check if Data is valid;
            if (
                !validInputs(distance, duration, cadence) ||
                !positiveNumber(distance, duration, cadence)
            ) {
                //
                return alert('Input Have to be positive Number');
            }
            workout = new Running([lat, lng], distance, duration, cadence);
            // this.#workouts.push(workout);
        }
        // if activaty Cycle , Maked Cycle Object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            // Check if Data is valid;
            if (
                !validInputs(distance, duration, elevation) ||
                !positiveNumber(distance, duration)
            ) {
                //
                return alert('Input Have to be positive Number');
            }
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        this.#workouts.push(workout);
        // console.log(this.#workouts)
        // console.log(this.#mapEvent);


        // Render Workout On Map as Marker
        this.renderWorkoutMarker(workout);


        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
            '';
    }
    renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(String(workout.distance))
            .openPopup();
        form.classList.add('hidden');
    }
}

const app = new App();
