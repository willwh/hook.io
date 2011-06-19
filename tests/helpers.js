var helpers = exports;


helpers.report = function ( suite, results ) {

  console.log('_________________________________________________________');
  console.log('\n');
  console.log(suite.magenta + ' has completed, here is the report:' );
  console.log('\n');
  console.log('  0'.green + ' means that the EXPECTED amount of events were fired');
  console.log('< 0'.yellow + ' means that MORE then the expected amount of events were fired');
  console.log('> 0'.red + ' means that LESS then expected amount of events were fired');
  console.log('\n');
  
  var isIsWell = true;
  for (var e in results) {

    if(results[e].count === 0){
      console.log('  ' + results[e].count.toString().green + ' ' + e.grey );
    }
    else if(results[e].count <= 0) {
      isIsWell = false;
      console.log('  ' +  results[e].count.toString().yellow + ' ' + e.grey );
    }
    else {
      isIsWell = false;
      console.log('  ' +  results[e].count.toString().red + ' ' + e.grey );
    }
  }
  
  console.log('\n');
  if (!isIsWell) {
    console.log('It appears there has been some issues with this suite. You should look into that.'.red);
  }
  else {
    console.log('All is well in the world'.green);
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