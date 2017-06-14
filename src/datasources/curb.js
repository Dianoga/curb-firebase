import chalk from 'chalk';
import { Curb } from 'node-curb';

export class CurbDatasource {
	constructor(config, database) {
		this._config = config;
		this.curb = new Curb({
			clientId: config.clientId,
			clientSecret: config.clientSecret,
			logger: this._log
		});
		this.ref = database.ref('/power');
	}

	init() {
		this.curb.init(this._config.username, this._config.password)
			.then(locations => {
				Object.values(locations).forEach(location => {
					this._locationToFirebase(location);
					location.addListener(this._locationWatch.bind(this));
				});

				this.curb.watch();
			})
			.catch(err => {
				console.error('Horrible failure during curb.init');
				console.error(err);
				process.exit(1);
			});
	}

	_locationToFirebase(location) {
		this._log(`Initializing ${location.name} in firebase`);

		const power = {};

		Object.values(location.circuits).forEach(val => {
			power[val.id] = val;
		});

		this.ref.set(power);
	}

	_locationWatch(location) {
		this.ref.set(location.circuits);
	}

	_log(message) {
		console.log(chalk.green('Curb: ') + message);
	}
}
