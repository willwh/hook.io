var Hook = require('../../lib/hookio').Hook;
//var profiler = require('v8-profiler');

var hook = new Hook( {
    name: 'MemLeakMaster',
    silent: true,
    local:true,
    oneway:true
});

hook.on('hook::ready', function () {
	hook.spawn([{src:'../MemLeakSlave.js',name:'MemLeakSlave', silent:true,oneway:true},
		{src:'../MemLeakChild.js',name:'MemLeakChild', silent:true,oneway:true},
		{src:'../MemLeakChild.js',name:'MemLeakChild', silent:true,oneway:true}]);
});

hook.start();
