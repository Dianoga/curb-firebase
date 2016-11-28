import path from 'path';
import _ from 'lodash';
import chalk from 'chalk';
import {
	CurbDatasource,
	RainMachineDatasource
} from './datasources';

const firebase = require('firebase');

const paths = {
	configDir: path.resolve(__dirname, '../', 'config/')
};

const config = require(path.join(paths.configDir, 'config'));

class QuickDashHelper {
	constructor() {
		firebase.initializeApp({
			databaseURL: 'https://project-2731511947915132034.firebaseio.com/',
			serviceAccount: `${paths.configDir}/firebase-account.json`
		});

		this.database = firebase.database();
		this.sources = [];

		// Setup all the datasources
		_.each(config, (val, key) => {
			switch (key) {
				case 'curb':
					if (val.disable) {
						this._log('Curb Disabled');
					} else {
						this.sources.push(new CurbDatasource(val, this.database));
					}
					break;
				case 'rainmachine':
					if (val.disable) {
						this._log('Rainmachine Disabled');
					} else {
						this.sources.push(new RainMachineDatasource(val, this.database));
					}
					break;
				default:
					break;
			}
		});
	}

	init() {
		_.each(this.sources, val => val.init());
	}

	_log(message) {
		console.log(chalk.red('Master: ') + message);
	}
}

const helper = new QuickDashHelper();
helper.init();
