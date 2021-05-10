'use strict';

console.log('node-load.js');

class CheckModulesLoad {
	constructor(rootscriptloader, signalstring) {
		this.rootscriptloader = rootscriptloader;
		this.array = [];

		this.signalsent = false;
		this.signalstring = signalstring;
	}

	wait(modulename) {
		this.array.push({name: modulename, loaded: false});
	}

	check(modulename) {
		var arr = this.array;

		if (modulename) {
			for (var i = 0; i < arr.length; i++) {
				var entry = arr[i];
	
				if (entry.name == modulename) {
					entry.loaded = true;
					break;
				}
			}
		}

		for (var i = 0; i < arr.length; i++) {
			var entry = arr[i];

			if (entry.loaded !== true)
				return;
		}

		if (this.signalsent)
		return;
		
		// mark loads have finished
		var rootscriptloader = this.rootscriptloader;
		
		rootscriptloader.signalEvent(this.signalstring);
		this.signalsent = true;
	}
}


class NodeLoad {
	constructor(node_module) {
		this.name = 'nodeload';
		
		this.node_module = node_module;
	}
	
	init(callback) {
		console.log('NodeLoad.init called');
		
		try {
			var self = this;
			var _globalscope = global; // nodejs global
			var _noderequire = require; // to avoid problems when react-native processes files
			
			// get ethereum_core
			var ethereum_core = this.node_module.ethereum_core;
			
			if (ethereum_core.initialized === false) {
				console.log('WARNING: @p2pmoney-org/ethereum_core should be initialized before initializing @primusmoney/ethereum_xtra_web');
			}
			
			// get node module objects
			var Bootstrap = _globalscope.simplestore.Bootstrap;
			var ScriptLoader = _globalscope.simplestore.ScriptLoader;
	
			var bootstrapobject = Bootstrap.getBootstrapObject();
			var rootscriptloader = ScriptLoader.getRootScriptLoader();
			
			var GlobalClass = _globalscope.simplestore.Global;
	
			// loading dapps
			let modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');
			
			let xtra_webmodulescriptloader = modulescriptloader.getChildLoader('@primusmoney/xtra_webmoduleloader');
			
			// setting script root dir to this node module
			// instead of ethereum_core/imports
			var path = _noderequire('path');
			var script_root_dir = path.join(__dirname, '../imports');
			xtra_webmodulescriptloader.setScriptRootDir(script_root_dir);
			
		
			//modulescriptloader.setScriptRootDir(script_root_dir); // because xtra_web uses modulescriptloader instead of xtra_webmodulescriptloader
	
			// multiple module load signalling
			var checkmodulesload = new CheckModulesLoad(rootscriptloader, '@primusmoney/on_xtra_web_module_ready');

			
			// xtraconfig
			ScriptLoader.reclaimScriptLoaderName('xtraconfig'); // already used by ethereum_core
			ScriptLoader.reclaimScriptLoaderName('xtramoduleloader'); // already used by ethereum_core
			ScriptLoader.reclaimScriptLoaderName('xtraconfigmoduleloader'); // already used by ethereum_core
			var xtrawebscriptloader = xtra_webmodulescriptloader.getChildLoader('@primusmoney/xtrawebconfig');
			
			// oauth2 module
			ScriptLoader.reclaimScriptLoaderName('oauth2loader'); // in case another node module used this name
			xtrawebscriptloader.getChildLoader('oauth2loader'); // create loader with correct root dir

			xtrawebscriptloader.push_script('./includes/modules/oauth2/module.js', function () {
				console.log('oauth2 module loaded');
			});

			// oauth2 module ready (sent by oauth2 module at the end of registerHooks)
			checkmodulesload.wait('oauth2');
			rootscriptloader.registerEventListener('on_oauth2_module_ready', function(eventname) {
				checkmodulesload.check('oauth2');
			});

			
			// mytokens module
			ScriptLoader.reclaimScriptLoaderName('mytokensloader'); // in case another node module used this name
			xtrawebscriptloader.getChildLoader('mytokensloader'); // create loader with correct root dir

			xtrawebscriptloader.push_script('./js/src/xtra/modules/mytokens/module.js', function () {
				console.log('mytokens module loaded');
			});

			// mytokens module ready (sent by mytokens module at the end of registerHooks)
			checkmodulesload.wait('mytokens');
			rootscriptloader.registerEventListener('on_mytokens_module_ready', function(eventname) {
				checkmodulesload.check('mytokens');
			});

			
			// start loading xtra_webmoduleloader
			xtra_webmodulescriptloader.load_scripts(function () {
				var _nodeobject = GlobalClass.getGlobalObject();
				
				// loading xtra pushed in xtrawebscriptloader
				xtrawebscriptloader.load_scripts(function() {
					checkmodulesload.check();
				});
			});

			
			// end of modules load
			rootscriptloader.registerEventListener('@primusmoney/on_xtra_web_module_ready', function(eventname) {
				if (callback)
					callback(null, self);
			});
		}
		catch(e) {
			console.log('exception in NodeLoad.init: ' + e);
			console.log(e.stack);
		}


		
	}
		
}


module.exports = NodeLoad;




