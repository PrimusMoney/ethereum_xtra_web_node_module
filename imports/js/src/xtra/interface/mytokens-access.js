'use strict';

var MyTokensServerAccess = class {
	
	constructor(session) {
		this.session = session;
	}
	
	
	// launcher (on calling side, e.g. authkey server)
	getRestLauncherConnection() {
		if (this.rest_launcher_connection)
			return this.rest_launcher_connection;
		
		// we use authkey entry for the moment
		var rest_server_url = this.session.getXtraConfigValue('authkey_server_url');
		var rest_server_api_path = this.session.getXtraConfigValue('authkey_server_api_path');

		this.rest_launcher_connection = this.session.createRestConnection(rest_server_url, rest_server_api_path);
		
		return this.rest_launcher_connection;
	}
	
	rest_launcher_get(resource, callback) {
		var rest_connection = this.getRestLauncherConnection();
		
		return rest_connection.rest_get(resource, callback);
	}
	
	rest_launcher_post(resource, postdata, callback) {
		var rest_connection = this.getRestLauncherConnection();
		
		return rest_connection.rest_post(resource, postdata, callback);
	}
	
	
	// rest connection
	_checkRestConnectionHeader() {
		if (!this.rest_connection)
			return;
			
		var rest_connection = this.rest_connection;

		var connection_header = rest_connection.header;
		var session = this.session;

		var calltokenstring = connection_header['calltoken'];
		var calljson = (calltokenstring ? JSON.parse(calltokenstring) : {});

		// auth part (if any)
		if (session.authkey_server_access_instance && session.authkey_server_access_instance.rest_auth_connection) {
			var rest_auth_connection = session.authkey_server_access_instance.rest_auth_connection;

			if (rest_auth_connection._isReady()) {
				var authurl =  session.authkey_server_access_instance.rest_auth_connection.getRestCallUrl();
				
				if (authurl) {
					calljson.auth = authurl;
				}
			}
			
		}

		// web3 part
		if (session.ethereum_node_access_instance && session.ethereum_node_access_instance.web3providerurl) {
			calljson.web3 = session.ethereum_node_access_instance.web3providerurl;
		}

		calltokenstring = JSON.stringify(calljson);
		rest_connection.addToHeader({key: 'calltoken', value: calltokenstring});
	}

	getRestConnection() {
		if (this.rest_connection)
			return this.rest_connection;
		
	    var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');

	    this.rest_connection = this.session.createRestConnection(rest_server_url, rest_server_api_path);
		
		// set Header
		this._checkRestConnectionHeader();
		
		return this.rest_connection;
	}
	
	setRestConnection(restconnection) {
		if (!restconnection)
			return;
		
		this.rest_connection = restconnection;

		// set Header
		this._checkRestConnectionHeader();
	}
	
	rest_get(resource, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_get(resource, callback);
	}
	
	rest_post(resource, postdata, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_post(resource, postdata, callback);
	}

	rest_put(resource, postdata, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_put(resource, postdata, callback);
	}
	
	//
	// MyTokens Server API
	//
	
	// launcher
	launcher_version(callback) {
		console.log("MyTokensServerAccess.launcher_version called");
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/version";
				
				self.rest_launcher_get(resource, function (err, res) {
					if (res) {
						var version = res['version'];
						
						if (callback)
							callback(null, version);
						
						return resolve(version);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}

	// mytokens microservice
	node_version(callback) {
		// obsolete
		this.service_version(callback);
	}

	service_version(callback) {
		console.log("MyTokensServerAccess.service_version called");
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/version";
				
				self.rest_get(resource, function (err, res) {
					if (res) {
						var version = res['version'];
						
						if (callback)
							callback(null, version);
						
						return resolve(version);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}


	public_scheme_list(callback) {
		console.log("MyTokensServerAccess.public_scheme_list called");
		
		var self = this;
		var session = this.session;
	
		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/mytokens/scheme/list";
				
				self.rest_get(resource, function (err, res) {
					if (res) {
						var schemelist = res['data'];
						
						if (callback)
							callback(null, schemelist);
						
						return resolve(schemelist);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}

	// explorer
	account_transactions(address, callback) {
		console.log("MyTokensServerAccess.account_transactions called");
		
		var self = this;
		var session = this.session;
	
		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/web3/account/" + address + "/txs";
				
				self.rest_get(resource, function (err, res) {
					if (res && (res['status'] == 1)) {
						var txlist = res['data'];
						
						if (callback)
							callback(null, txlist);
						
						return resolve(txlist);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}


}


if ( typeof window !== 'undefined' && window ) // if we are in browser or react-native and not node js (e.g. truffle)
	window.simplestore.MyTokensServerAccess = MyTokensServerAccess;
else if (typeof global !== 'undefined')
	global.simplestore.MyTokensServerAccess = MyTokensServerAccess; // we are in node js
