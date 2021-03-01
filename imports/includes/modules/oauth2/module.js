'use strict';

var Module = class {
	
	constructor() {
		this.name = 'oauth2';
		this.current_version = "0.20.8.2021.03.13";
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.activated = true;
		
		//this.oauth2_server_access_instance = null;
		this.oauth2_interface = null;
		
		this.controllers = null;
	}
	
	activation(choice) {
		if (choice === false) {
			this.activated = false;
		}
		else if (this.activated === false) {
			this.activated = true;
		}
	}
	
	isActivated() {
		return this.activated;
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

		// oauth2 module script loader
		var modulescriptloader;
		
		// look if oauth2loader already created (e.g. for loading in node.js)
		modulescriptloader = global.findScriptLoader('oauth2loader');

		// if not, create on as child as parent script loader passed in argument
		if (!modulescriptloader)
		modulescriptloader = global.getScriptLoader('oauth2loader', parentscriptloader);
		
		var xtraroot = './includes';
		
		var interfaceroot = xtraroot + '/interface';

		modulescriptloader.push_script( interfaceroot + '/oauth2-access.js');

		var moduleroot = xtraroot + '/modules/oauth2';

		//modulescriptloader.push_script( moduleroot + '/control/controllers.js');
		
		modulescriptloader.push_script( moduleroot + '/model/oauth2.js');

		
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

		global.registerHook('getAuthKeyServerAccessInstance_hook', this.name, this.getAuthKeyServerAccessInstance_hook);
		
		// angular login page
		global.registerHook('alterLoginForm_hook', this.name, this.alterLoginForm_hook);
		global.modifyHookPriority('alterLoginForm_hook', this.name, 5);
		
		global.registerHook('handleLoginSubmit_hook', this.name, this.handleLoginSubmit_hook);
		global.modifyHookPriority('handleLoginSubmit_hook', this.name, 5);

		
		global.registerHook('alterLogoutForm_hook', this.name, this.alterLogoutForm_hook);
		global.registerHook('handleLogoutSubmit_hook', this.name, this.handleLogoutSubmit_hook);
		
		// signal module is ready
		var rootscriptloader = global.getRootScriptLoader();
		rootscriptloader.signalEvent('on_oauth2_module_ready');
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
		var _globalscope = global.getExecutionGlobalScope();
		var Constants = _globalscope.simplestore.Constants;
		var oauth2_versioninfo = Constants.get('oauth2_version');
		
		var versioninfos = params[0];
		
		var versioninfo = {};
		
		versioninfo.label = global.t('oauth2');

		if (oauth2_versioninfo && oauth2_versioninfo.value)
			versioninfo.value = oauth2_versioninfo.value; // overloaded
		else if (this.current_version)
			versioninfo.value = this.current_version; // hard-coded value
		else
			versioninfo.value = global.t('unknown');
		
		versioninfos.push(versioninfo);

		
		result.push({module: this.name, handled: true});
		
		return true;
	}

	_getAppObject() {
		var global = this.global;
		if (global.getAppObject)
			return global.getAppObject();
	}

	getOAuth2Interface() {
		var global = this.global;
		
		if (this.oauth2_interface)
			return this.oauth2_interface;
		
		var oauth2interface = null;

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		
		result[0] = new this.OAuth2ServerInterface(this);
		
		// call hook to let modify or replace instance
		var ret = global.invokeHooks('getOAuth2Interface_hook', result, inputparams);
		
		if (ret && result[0]) {
			oauth2interface = result[0];
		}
		else {
			oauth2interface = new this.OAuth2ServerInterface(this);
		}
		
		this.oauth2_interface = oauth2interface;
		
		return this.oauth2_interface;
	}

	getOAuth2ServerAccessInstance(session, providername) {
		var oauth2interface = this.getOAuth2Interface();

		return oauth2interface.getOAuth2ServerAccessInstance(session, providername);
	}
	
	// authkey hook
	getAuthKeyServerAccessInstance_hook(result, params) {
		console.log('getAuthKeyServerAccessInstance_hook called for ' + this.name);
		
		if (this.activated === false)
			return false;

		var global = this.global;
		
		var authkeymodule = params[0];
		var session = params[1];
		
		// look if session deactivates oauth2
		if (session.activate_oauth2_server_access === false)
			return false;
		
		var authkey_server_access_instance = result[0];
		
		var _globalscope = global.getExecutionGlobalScope();
		var Config = _globalscope.simplestore.Config;

		
		// we look at our oauth2 settings for auth and key
		
		var rest_server_url = session.getXtraConfigValue('rest_server_url'); // default is rest server
	    var rest_server_api_path = session.getXtraConfigValue('rest_server_api_path');
	    
	    if (!rest_server_url) {
	    	// we are not in ethereum_webapp overload mode (simple copy)
	    	if (Config && (Config.get)  && (Config.get('oauth2_webapp_url')))
	    		rest_server_url = Config.get('oauth2_webapp_url');
	    }

	    if (!rest_server_api_path) {
	    	if (Config && (Config.get)  && (Config.get('oauth2_webapp_api_path'))) {
	    		rest_server_api_path = Config.get('oauth2_webapp_api_path');
		    	
		    	// strip oauth2
		    	rest_server_api_path = rest_server_api_path.replace('/oauth2', '');
	    	}
	    }
	    
		var rest_auth_url;
		var rest_auth_api_path;
		var rest_auth_connection;
		
		var rest_key_url;
		var rest_key_api_path;
		var rest_key_connection;

	   
	    //
	    // rest_auth_connection
	    //
		if (Config && (Config.get)  && (Config.get('oauth2_auth_server_url'))) {
			// auth only
			rest_auth_url = Config.get('oauth2_auth_server_url');
		}
		else if (Config && (Config.get)  && (Config.get('oauth2_authkey_server_url'))) {
	    	// dual auth & key
			rest_auth_url = Config.get('oauth2_authkey_server_url');
    	}

	    
    	if (Config && (Config.get)  && (Config.get('oauth2_auth_server_api_path'))) {
			// auth only
    		rest_auth_api_path = Config.get('oauth2_auth_server_api_path');
    	}
    	else if (Config && (Config.get)  && (Config.get('oauth2_authkey_server_api_path'))) {
	    	// dual auth & key
    		rest_auth_api_path = Config.get('oauth2_authkey_server_api_path');
    	}
	    
		if (rest_auth_url && rest_auth_api_path)
			rest_auth_connection = session.createRestConnection(rest_auth_url, rest_auth_api_path);
		else
		    rest_auth_connection = session.createRestConnection(rest_server_url, rest_server_api_path);

		
	    //
		// rest_key_connection
		//
    	if (Config && (Config.get)  && (Config.get('oauth2_key_server_url'))) {
			// key only
    		rest_key_url = Config.get('oauth2_key_server_url');
    	}
    	else if (Config && (Config.get)  && (Config.get('oauth2_authkey_server_url'))) {
	    	// dual auth & key
    		rest_key_url = Config.get('oauth2_authkey_server_url');
    	}

    	if (Config && (Config.get)  && (Config.get('oauth2_key_server_api_path'))) {
    		// key only
    		rest_key_api_path = Config.get('oauth2_key_server_api_path');
    	}
    	else if (Config && (Config.get)  && (Config.get('oauth2_authkey_server_api_path'))) {
	    	// dual auth & key
    		rest_key_api_path = Config.get('oauth2_authkey_server_api_path');
    	}


		if (rest_key_url && rest_key_api_path)
			rest_key_connection = session.createRestConnection(rest_key_url, rest_key_api_path);
		else
			rest_key_connection = session.createRestConnection(rest_server_url, rest_server_api_path);
		
		// set connection
		if (rest_auth_connection)
		authkey_server_access_instance.setRestAuthConnection(rest_auth_connection);
		
		if (rest_key_connection)
		authkey_server_access_instance.setRestKeyConnection(rest_key_connection);

		// return this interface
		result.push(authkey_server_access_instance);
		result.push({module: this.name, handled: true, stop: true});
		
		return true;
	}
	
	// angular login page
	alterLoginForm_hook(result, params) {
		console.log('alterLoginForm_hook called for ' + this.name);
		
		if (this.activated === false)
			return false;

		var global = this.global;
		var self = this;

		/*var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();*/

		var $scope = params[0];
		var logoutform = params[1];
		var session = params[2];

		// look if session deactivates oauth2
		if (session.activate_oauth2_server_access === false)
			return false;
		
		// remove private key input
		var privkeyspan = document.getElementById('privkey-span');
		
		if ( privkeyspan ) {
			privkeyspan.parentNode.removeChild(privkeyspan);
		}
		
		var buttonspan = document.getElementById('button-span');

		if ( buttonspan ) {
			// hide button until we have the authorize url
			buttonspan.style.display = 'none';
		}
		
		// add our inputs
		/*var loginForm = document.getElementById('loginForm');
		
		if (loginForm) {
			
		}*/
		
		var oauth2interface = this.getOAuth2Interface();
		var params = {}; // default {client: 'web', closewindow: '0', appurl: 'none'}

		params.client = 'web';
		params.closewindow = '0';
		params.appurl = 'none';
		
/* 		var currenturl = window.location.href;

		if (currenturl.indexOf('#') != -1) {
			// strip anchors
			currenturl = currenturl.slice(0, currenturl.indexOf('#'));
		}

		params.appurl = currenturl + '?sessionuuid=' + session.getSessionUUID();
 */		
		oauth2interface.getOAuth2AuthorizeUrl(session, params, function(err, res) {
			var oauth_url = res;
			
			session.setSessionVariable('oauth2_authorize_url', oauth_url);
			
			// can show login button now
			if ( buttonspan ) {
				// hide button
				buttonspan.style.display = 'block';
			}
		});
		

	
		result.push({module: this.name, handled: true, stop: true});
		
		return true;
	}
	
	_OpenPopupWindow(uri, name, options, callback) {
		if (this.activated === false) {
			if (callback)
				callback(global.t('oauth2 module is not activated'), null);
			return;
		}

	    var win = window.open(uri, name, options);
	    var interval = window.setInterval(function() {
	        try {
	            if (win == null || win.closed) {
	                window.clearInterval(interval);
	                callback(null, win);
	            }
	        }
	        catch (e) {
	        }
	    }, 1000);
	    return win;
	}

	handleLoginSubmit_hook(result, params) {
		console.log('handleLoginSubmit_hook called for ' + this.name);

		if (this.activated === false)
			return false;

		var global = this.global;
		var self = this;
		
		var app = this._getAppObject();
		
		/*var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();*/

		var $scope = params[0];
		var session = params[1];
		
		// look if session deactivates oauth2
		if (session.activate_oauth2_server_access === false)
			return false;
		
		var oauth_url = session.getSessionVariable('oauth2_authorize_url');
		
		if (oauth_url) {
			// create a popup window
			// note: the window.open must be in the treatment
			// corresponding to a user click, or popup will be blocked
			var windowname = global.t('OAuth authentication');
			var windowparams = 'height=640,width=640';
			
			var oauthwindow = self._OpenPopupWindow(oauth_url, windowname, windowparams, function(err, res) {
				if (app) app.refreshDisplay();
			});
			
			if (window.focus) {
				if (oauthwindow)
				oauthwindow.focus();
			}
		}
		
		result.push({module: this.name, handled: true, stop: true});
		
		return true;
	}
		
	alterLogoutForm_hook(result, params) {
		console.log('alterLogoutForm_hook called for ' + this.name);
		
		if (this.activated === false)
			return false;

		var $scope = params[0];
		var logoutform = params[1];
		var session = params[2];
		
		// look if session deactivates oauth2
		if (session.activate_oauth2_server_access === false)
			return false;
		
	}
	
	handleLogoutSubmit_hook(result, params) {
		console.log('handleLogoutSubmit_hook called for ' + this.name);
		
		if (this.activated === false)
			return false;

		var $scope = params[0];
		var session = params[1];
		
		// look if session deactivates oauth2
		if (session.activate_oauth2_server_access === false)
			return false;
		

	}

	
	//
	// API
	//
	

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
	GlobalClass.getGlobalObject().registerModuleDepency('oauth2', 'common');
}
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	_GlobalClass.getGlobalObject().registerModuleDepency('oauth2', 'common');
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	// dependencies
	_GlobalClass.getGlobalObject().registerModuleDepency('oauth2', 'common');
}