import _ from 'lodash';
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
			.then(profiles => {
				_.each(profiles, profile => {
					this._profileToFirebase(profile);
					this._profileWatch(profile);
				});
			})
			.catch(err => {
				console.error('Horrible failure during curb.init');
				console.error(err);
				process.exit(1);
			});
	}

	_profileToFirebase(profile) {
		this._log(`Initializing ${profile.display_name} in firebase`);

		const power = {};

		_.each(profile.registers, val => {
			power[val.id] = {
				id: val.id,
				name: val.label,
				groups: val.groups
			};
		});

		this.ref.set(power);
	}

	_profileWatch(profile) {
		this._log(`Starting stream for ${profile.display_name}`);
		profile.watch(data => {
			const updates = {};
			_.each(data.measurements, val => {
				updates[`${val.id}/watts`] = val.value;
			});
			this.ref.update(updates);
		});
	}

	_log(message) {
		console.log(chalk.green('Curb: ') + message);
	}
}
