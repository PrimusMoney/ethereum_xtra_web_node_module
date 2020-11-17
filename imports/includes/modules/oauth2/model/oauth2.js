/**
 * 
 */
'use strict';

var OAuth2ServerInterface = class {
	constructor(module) {
		this.module = module;
		this.global = module.global;
		
		this.oauth2_server_access_instance = null;
	}
	
	getOAuth2ServerAccessInstance(session, providername) {
		if (this.oauth2_server_access_instance)
			return this.oauth2_server_access_instance;
		
		console.log('instantiating OAuth2ServerAccess');
		
		var global = this.global;
		var _globalscope = global.getExecutionGlobalScope();
		
		var OAuth2ServerAccess = _globalscope.simplestore.OAuth2ServerAccess;
		
		var Config = _globalscope.simplestore.Config;

		var oauth2_provider;

		if (providername)
			oauth2_provider = providername;
		else
			oauth2_provider = (Config && (Config.get)  && (Config.get('oauth2_provider')) ? Config.get('oauth2_provider') : null);

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		
		var ret = global.invokeHooks('getOAuth2ServerAccessInstance', result, inputparams);
		
		if (ret && result[0]) {
			this.oauth2_server_access_instance = result[0];
		}
		else {
			this.oauth2_server_access_instance = new OAuth2ServerAccess(session, oauth2_provider);
		}

		
		return this.oauth2_server_access_instance;
		
	}
	
	// api
	getOAuth2AuthorizeUrl(session, params, callback) {
		var oauth2access = this.getOAuth2ServerAccessInstance(session);
		
		return oauth2access.oauth2_authorize_url(params, function(err, res) {
			var oauth_authorize_url =  res;
			
			if (callback)
				callback(null, oauth_authorize_url);
		});
		
	}
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
GlobalClass.registerModuleClass('oauth2', 'OAuth2ServerInterface', OAuth2ServerInterface);
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('oauth2', 'OAuth2ServerInterface', OAuth2ServerInterface);
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('oauth2', 'OAuth2ServerInterface', OAuth2ServerInterface);
}