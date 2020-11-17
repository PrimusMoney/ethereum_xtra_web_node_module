'use strict';

var Module = class {
	
	constructor() {
		this.name = 'mytokens';
		this.current_version = "0.20.1.2020.11.23";
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.mytokens_interface = null;
		
		this.controllers = null;
	}
	
	init() {
		console.log('module init called for ' + this.name);
		
		this.isready = true;
	}
	
	// compulsory  module functions
	loadModule(parentscriptloader, callback) {
		console.log('loadModule called for module ' + this.name);

		if (this.isloading)
			return;
			
		this.isloading = true;

		var self = this;
		var global = this.global;

		// mytokens module script loader
		var modulescriptloader;
		
		// look if oauth2loader already created (e.g. for loading in node.js)
		modulescriptloader = global.findScriptLoader('mytokensloader');

		// if not, create on as child as parent script loader passed in argument
		if (!modulescriptloader)
		modulescriptloader = global.getScriptLoader('mytokensloader', parentscriptloader);
		
		var xtraroot = './js/src/xtra';
		
		var interfaceroot = xtraroot + '/interface';

		modulescriptloader.push_script( interfaceroot + '/mytokens-access.js');

		var moduleroot = xtraroot + '/modules/mytokens';

		//modulescriptloader.push_script( moduleroot + '/control/controllers.js');
		
		modulescriptloader.push_script( moduleroot + '/model/mytokens.js');

		
		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });
		
		return modulescriptloader;
	}
	
	isReady() {
		return this.isready;
	}

	hasLoadStarted() {
		return this.isloading;
	}

	// optional  module functions
	registerHooks() {
		console.log('module registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('getVersionInfo_hook', this.name, this.getVersionInfo_hook);
		global.modifyHookPriority('getVersionInfo_hook', this.name, -5);
		
		// signal module is ready
		var rootscriptloader = global.getRootScriptLoader();
		rootscriptloader.signalEvent('on_mytokens_module_ready');
	}
	
	postRegisterModule() {
		console.log('postRegisterModule called for ' + this.name);
		if (!this.isloading) {
			var global = this.global;
			var self = this;
			var rootscriptloader = global.getRootScriptLoader();
			
			this.loadModule(rootscriptloader, function() {
				if (self.registerHooks)
				self.registerHooks();
			});
		}
	}
	
	
	//
	// hooks
	//

	getVersionInfo_hook(result, params) {
		console.log('getVersionInfo_hook called for ' + this.name);
		
		var global = this.global;
		
		var versioninfos = params[0];
		
		var versioninfo = {};
		
		versioninfo.label = global.t('mytokens');
		versioninfo.value = this.current_version;

		versioninfos.push(versioninfo);

		
		result.push({module: this.name, handled: true});
		
		return true;
	}
	
	
	// objects
	getMytokensInterface() {
		var global = this.global;
		
		if (this.mytokens_interface)
			return this.mytokens_interface;
		
		var mytokensinterface = null;

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		
		result[0] = new this.MyTokensServerInterface(this);
		
		// call hook to let modify or replace instance
		var ret = global.invokeHooks('getMytokensInterface_hook', result, inputparams);
		
		if (ret && result[0]) {
			mytokensinterface = result[0];
		}
		else {
			mytokensinterface = new this.MyTokensServerInterface(this);
		}
		
		this.mytokens_interface = mytokensinterface;
		
		return this.mytokens_interface;
	}
	
	
	getMyTokensServerAccessInstance(session) {
		var mytokensinterface = this.getMytokensInterface();
		
		return mytokensinterface.getMyTokensServerAccessInstance(session);
		
		/*console.log('instantiating MyTokensServerAccess');
		
		var global = this.global;

		var result = []; 
		var inputparams = [];
		
		inputparams.push(session);
		
		var ret = global.invokeHooks('getMyTokensServerAccessInstance_hook', result, inputparams);
		
		if (ret && result[0]) {
			this.mytokens_server_access_instance = result[0];
		}
		else {
			this.mytokens_server_access_instance = new window.MyTokensServerAccess(session);
		}

		
		return this.mytokens_server_access_instance;*/
	}

	//
	// API
	//
	
	
	getPublicSchemeList(session, bRefresh, callback) {
		var mytokensinterface = this.getMytokensInterface();
		
		return mytokensinterface.getPublicSchemeList(session, callback);
	}

	//
	// control
	//
	
	getControllersObject() {
		if (this.controllers)
			return this.controllers;
		
		this.controllers = new this.Controllers(this);
		
		return this.controllers;
	}

	//
	// model
	//
	
	
}


if ( typeof GlobalClass !== 'undefined' && GlobalClass ) {
	GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	GlobalClass.getGlobalObject().registerModuleDepency('mytokens', 'common');
}
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	_GlobalClass.getGlobalObject().registerModuleDepency('mytokens', 'common');
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	_GlobalClass.getGlobalObject().registerModuleDepency('mytokens', 'common');
}
