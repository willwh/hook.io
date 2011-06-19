var helpers = exports;


helpers.report = function ( suite, results ) {

  console.log(suite.magenta + ' has completed, here is the report:'.green );
  console.log('\n');
  console.log('  0'.green + ' means that the EXPECTED amount of events were fired');
  console.log('< 0'.yellow + ' means that MORE then the expected amount of events were fired');
  console.log('> 0'.red + ' means that LESS then expected amount of events were fired');
  console.log('\n');
  
  
  for (var e in results) {

    if(results[e].count === 0){
      console.log('  ' + results[e].count.toString().green + ' ' + e.grey );
    }
    else if(results[e].count <= 0) {
      console.log('  ' +  results[e].count.toString().yellow + ' ' + e.grey );
    }
    else {
      console.log('  ' +  results[e].count.toString().red + ' ' + e.grey );
    }
  }
  
}

helpers.fired = function ( event, expected_events ) {
  
  try {
    
    expected_events[event].count--
    
  } catch(err){
    expected_events[event] = {};
    expected_events[event].count = -1;
    //console.log('unexpected event fired: ' + event);
  }
  
  return expected_events;
  
}