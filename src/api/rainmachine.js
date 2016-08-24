import axios from 'axios';

export class RainMachineApi {
	constructor(opts) {
		this.opts = Object.assign({
			ip: null,
			logger: () => {}
		}, opts);

		this._apiUrl = `https://${this.opts.ip}:8080/api/4`;
		this.api = axios.create({
			baseURL: this._apiUrl,
			params: {}
		});

		// Required since rain machine uses an invalid cert
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	init(password) {
		return this.api.post('/auth/login', {
			pwd: password,
			remember: 1
		})
			.then(resp => {
				this.api.defaults.params.access_token = resp.data.access_token;
				this._accessToken = resp.data.access_token;
			});
	}

	program() {
		return this.api.get('/program');
	}

	zone() {
		return this.api.get('/zone');
	}

	zoneProperties() {
		return this.api.get('/zone/properties');
	}
}
