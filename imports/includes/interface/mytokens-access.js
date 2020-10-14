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
	
	
	// rest connection (on storage side) 
	getRestConnection() {
		if (this.rest_connection)
			return this.rest_connection;
		
	    var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');

	    this.rest_connection = this.session.createRestConnection(rest_server_url, rest_server_api_path);
		
		return this.rest_connection;
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

}


if ( typeof window !== 'undefined' && window ) // if we are in browser or react-native and not node js (e.g. truffle)
	window.simplestore.MyTokensServerAccess = MyTokensServerAccess;
else if (typeof global !== 'undefined')
	global.simplestore.MyTokensServerAccess = MyTokensServerAccess; // we are in node js
