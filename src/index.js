import path from 'path';
import _ from 'lodash';
import {
	CurbDatasource,
	RainMachineDatasource
} from './datasources';

const firebase = require('firebase');

const paths = {
	configDir: path.resolve(__dirname, '../', 'config/')
};

const config = require(`${paths.configDir}/config`);

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
					// this.sources.push(new CurbDatasource(val, this.database));
					break;
				case 'rainmachine':
					this.sources.push(new RainMachineDatasource(val, this.database));
					break;
				default:
					break;
			}
		});
	}

	init() {
		_.each(this.sources, val => val.init());
	}
}

const helper = new QuickDashHelper();
helper.init();
