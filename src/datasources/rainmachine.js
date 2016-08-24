import _ from 'lodash';
import chalk from 'chalk';
import { RainMachineApi } from '../api/rainmachine';

export class RainMachineDatasource {
	constructor(config, database) {
		this._config = config;
		this.rainmachine = new RainMachineApi({
			ip: config.ip,
			logger: this._log
		});
		this.ref = database.ref('/irrigation');
	}

	init() {
		this._log('Initializing');
		this.rainmachine.init(this._config.password)
			.then(() => {
				this._log('Getting zone properties');
				return this.rainmachine.zoneProperties();
			})
			.then(resp => {
				this._log('Sending zones to firebase');
				this._zonesToFirebase(resp.data.zones);

				this._log('Getting programs');
				return this.rainmachine.program();
			})
			.then(resp => {
				this._log('Sending programs to firebase');
				this._programsToFirebase(resp.data.programs);
			})
			.then(() => {
				this.startWatching();
			})
			.catch(err => {
				console.error('Horrible failure during rainmachine.init');
				console.error(err);
				process.exit(1);
			});
	}

	startWatching() {
		this._log('Polling started');
		this._interval = setInterval(() => {
			this.rainmachine.program()
				.then(resp => {
					this._programsToFirebase(resp.data.programs);
				})
				.catch(err => {
					console.error('Horrible failure during rainmachine.program');
					console.error(err);
				});

			this.rainmachine.zone()
				.then(resp => {
					this._zonesToFirebase(resp.data.zones);
				})
				.catch(err => {
					console.error('Horrible failure during rainmachine.zone');
					console.error(err);
				});
		}, 10000);
	}

	_zonesToFirebase(zones) {
		const data = {};

		_.each(zones, val => {
			if (!val.active) return;

			data[val.uid] = {
				name: val.name,
				status: val.state || 0,
				remaining: val.remaining || 0
			};
		});

		this.ref.update({ zones: data });
	}

	_programsToFirebase(programs) {
		const data = {};

		_.each(programs, val => {
			if (!val.active) return;

			data[val.uid] = {
				name: val.name,
				status: val.status,
				nextRun: val.nextRun,
				startTime: val.startTime
			};
		});

		this.ref.update({ programs: data });
	}

	_log(message) {
		console.log(chalk.blue('RainMachine: ') + message);
	}
}
