import _ from 'lodash';

import { Curb } from './curb';

global.URLSearchParams =  require('url-search-params');

const curbAccount = require('../config/curb-account');

const curb = new Curb(curbAccount.clientId, curbAccount.clientSecret);

curb.init(curbAccount.username, curbAccount.password)
	.then(profiles => {
		_.each(profiles, profile => {
			console.log(`Starting stream for ${profile.display_name}`);
			profile.watch(data => {
				console.log(data);
			});
		});
	})
	.catch(err => {
		console.error("Horrible failure during curb.init");
		console.error(err);
	});
