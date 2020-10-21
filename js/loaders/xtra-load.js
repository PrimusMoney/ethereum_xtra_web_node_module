console.log('xtra-load.js');

var Bootstrap = window.simplestore.Bootstrap;
var ScriptLoader = window.simplestore.ScriptLoader;

var bootstrapobject = Bootstrap.getBootstrapObject();
var rootscriptloader = ScriptLoader.getRootScriptLoader();

var globalscriptloader = ScriptLoader.findScriptLoader('globalloader')

var xtrascriptloader = globalscriptloader.getChildLoader('xtraconfig');

// oauth2
rootscriptloader.push_import(xtrascriptloader,'../../imports/includes/interface/oauth2-access.js');
import '../../imports/includes/interface/oauth2-access.js';

rootscriptloader.push_import(xtrascriptloader,'../../imports/includes/modules/oauth2/module.js');
import '../../imports/includes/modules/oauth2/module.js';

rootscriptloader.push_import(xtrascriptloader,'../../imports/includes/modules/oauth2/model/oauth2.js');
import '../../imports/includes/modules/oauth2/model/oauth2.js';


// mytokens
rootscriptloader.push_import(xtrascriptloader,'../../imports/js/src/xtra/interface/mytokens-access.js');
import '../../imports/js/src/xtra/interface/mytokens-access.js';

rootscriptloader.push_import(xtrascriptloader,'../../imports/js/src/xtra/modules/mytokens/module.js');
import '../../imports/js/src/xtra/modules/mytokens/module.js';

rootscriptloader.push_import(xtrascriptloader,'../../imports/js/src/xtra/modules/mytokens/model/mytokens.js');
import '../../imports/js/src/xtra/modules/mytokens/model/mytokens.js';


xtrascriptloader.load_scripts();
