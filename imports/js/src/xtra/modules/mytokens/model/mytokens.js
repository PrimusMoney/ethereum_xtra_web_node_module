/**
 * 
 */
'use strict';

var MyTokensServerInterface = class {
	constructor(module) {
		this.module = module;
		this.global = module.global;
		
		this.mytokens_server_access_instance = null;
	}
	
	getMyTokensServerAccessInstance(session) {
		if (this.mytokens_server_access_instance)
			return this.mytokens_server_access_instance;
		
		console.log('instantiating MyTokensServerAccess');
		
		var global = this.global;
		var _globalscope = global.getExecutionGlobalScope();
		
		var MyTokensServerAccess = _globalscope.simplestore.MyTokensServerAccess;

		var Config = _globalscope.simplestore.Config;

		var mytokens_provider = (Config && (Config.get)  && (Config.get('mytokens_provider')) ? Config.get('mytokens_provider') : null);

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		
		var ret = global.invokeHooks('getMyTokensServerAccessInstance', result, inputparams);
		
		if (ret && result[0]) {
			this.mytokens_server_access_instance = result[0];
		}
		else {
			this.mytokens_server_access_instance = new MyTokensServerAccess(session, mytokens_provider);
		}

		
		return this.mytokens_server_access_instance;
		
	}
	
	// api
	getPublicSchemeList(session, callback) {
		var mytokensaccess = this.getMyTokensServerAccessInstance(session);
		
		return mytokensaccess.public_scheme_list(function(err, res) {
			var schemelist =  res;
			
			if (callback)
				callback(null, schemelist);
		})
		.catch(err => {
			if (callback)
				callback(err, null);
			
			throw err;
		});
		
	}
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
GlobalClass.registerModuleClass('mytokens', 'MyTokensServerInterface', MyTokensServerInterface);
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('mytokens', 'MyTokensServerInterface', MyTokensServerInterface);
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.registerModuleClass('mytokens', 'MyTokensServerInterface', MyTokensServerInterface);
}