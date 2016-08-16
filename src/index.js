import path from 'path';
import _ from 'lodash';

import { Curb } from './curb';

global.URLSearchParams =  require('url-search-params');
const firebase = require('firebase');

const paths = {
	configDir: path.resolve(__dirname, '../', 'config/'),
}


const config = require(`${paths.configDir}/config`);

class QuickDashHelper {
	constructor() {
		this.curb = new Curb(config.curb.clientId, config.curb.clientSecret);
		firebase.initializeApp({
			databaseURL: "https://project-2731511947915132034.firebaseio.com/",
			serviceAccount: `${paths.configDir}/firebase-account.json`
		});

		this.powerRef = firebase.database().ref('/power');
	}

	init() {
		this.curb.init(config.curb.username, config.curb.password)
			.then(profiles => {
				_.each(profiles, profile => {
					this._profileToFirebase(profile);
					this._profileWatch(profile);
				});
			})
			.catch(err => {
				console.error("Horrible failure during curb.init");
				console.error(err);
				process.exit(1);
			});
	}

	_profileToFirebase(profile) {
		console.log(`Initializing ${profile.display_name} in firebase`);

		const power = {};

		_.each(profile.registers, val => {
			power[val.id] = {
				id: val.id,
				name: val.label,
				groups: val.groups
			};
		});

		this.powerRef.set(power);

	}

	_profileWatch(profile) {
		console.log(`Starting stream for ${profile.display_name}`);
		profile.watch(data => {
			const updates = {};
			_.each(data.measurements, val => {
				updates[`${val.id}/watts`] = val.value;
			});
			this.powerRef.update(updates);
		});
	}
}

const helper = new QuickDashHelper();
helper.init();
