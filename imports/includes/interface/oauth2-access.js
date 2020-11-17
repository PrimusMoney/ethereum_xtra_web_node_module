'use strict';

class OAuth2ServerAccess {
	constructor(session, providername) {
		this.session = session;
		
		this.providername = providername;
		
		this.rest_oauth2_connection = null;
	}
	
	getRestOAuth2Connection() {
		if (this.rest_oauth2_connection)
			return this.rest_oauth2_connection;
		
		var session = this.session;
		var global = session.getGlobalObject();
		var _globalscope = global.getExecutionGlobalScope();
		var Config = _globalscope.simplestore.Config;

		var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');
	    
    	// we look in Config to potentially overload default
		if (Config && (Config.get)  && (Config.get('oauth2_webapp_url')))
    		rest_server_url = Config.get('oauth2_webapp_url');

    	// api_path
    	if (Config && (Config.get)  && (Config.get('oauth2_webapp_api_path')))
    		rest_server_api_path = Config.get('oauth2_webapp_api_path');
    	else {
    		if (rest_server_api_path)
    			rest_server_api_path += '/oauth2';
    	}
    	
    	// we look at session's level to see if value has been overloaded at that level
    	var oauth2_rest_server_url = this.session.getXtraConfigValue('oauth2_webapp_url');
    	var oauth2_rest_server_api_path = this.session.getXtraConfigValue('oauth2_webapp_api_path');
    	
    	if (oauth2_rest_server_url && oauth2_rest_server_api_path) {
    		rest_server_url = oauth2_rest_server_url;
    		rest_server_api_path = oauth2_rest_server_api_path;
    	}

	    this.rest_oauth2_connection = this.session.createRestConnection(rest_server_url, rest_server_api_path);
		
		return this.rest_oauth2_connection;
	}
	
	setRestOAuth2Connection(restconnection) {
		if (!restconnection)
			return;
		
		this.rest_oauth2_connection = restconnection;
	}
	
	rest_oauth2_get(resource, callback) {
		var rest_connection = this.getRestOAuth2Connection();
		
		return rest_connection.rest_get(resource, callback);
	}
	
	rest_oauth2_post(resource, postdata, callback) {
		var rest_connection = this.getRestOAuth2Connection();
		
		return rest_connection.rest_post(resource, postdata, callback);
	}
	
	//
	// rest OAuth2 API
	//
	oauth2_server_info(callback) {
		console.log("OAuth2ServerAccess.oauth2_server_info called");
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/server";
				
				self.rest_oauth2_get(resource, function (err, res) {
					if (res) {
						var serverinfo = res.data;
						
						if (callback)
							callback(null, serverinfo);
						
						return resolve(serverinfo);
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
	
	oauth2_authorize_url(params, callback) {
		console.log("OAuth2ServerAccess.oauth2_authorize_url called");
		
		var self = this;
		var session = this.session;
		var providername = this.providername;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/url/authorize" + (providername ? '/' + providername : '');

				// create query string parameters from params
				if (params) {
					var arr = Object.entries(params);
					var paramstring = '';

					for (var i = 0; i < (arr ? arr.length : 0); i++) {
						paramstring += (i > 0 ? '&' : '') + arr[i][0] + '=' + encodeURIComponent(arr[i][1]);
					}

					if (paramstring.length)
						resource += '?' + paramstring;
				}
				
				self.rest_oauth2_get(resource, function (err, res) {
					if (res) {
						var oauth_authorize_url = res.oauth_authorize_url;
						
						if (callback)
							callback(null, oauth_authorize_url);
						
						return resolve(oauth_authorize_url);
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

console.log("OAuth2ServerAccess is loaded");

if ( typeof window !== 'undefined' && window ) // if we are in browser or react-native and not node js (e.g. truffle)
	window.simplestore.OAuth2ServerAccess = OAuth2ServerAccess;
else if (typeof global !== 'undefined')
	global.simplestore.OAuth2ServerAccess = OAuth2ServerAccess; // we are in node js
