const fs = require('fs'),
      process = require('child_process'),
      Promise = require("es6-promise").Promise,
      Galileo = require("galileo-io"),
      schedule = require('node-schedule'),
      client = new OPC('localhost', 7890),
      OPC = new require('./opc');
      

/**
 *
 * Moon phases:
 * full            -> [0,1,2,3,4,5]
 * waxing gibbous  -> [1,2,3,4,5]
 * first quarter   -> [3,4,5]
 * waxing crescent -> [4,5]
 * new             -> []
 * waning crescent -> [0,1]
 * third quarter   -> [0,1,2]
 * waning gibbous  -> [0,1,2,3,4]
 * 
 */

 //get moon phase
 //init board
 //light lights

const MOON_PHASES = {
  'full'            : [0,1,2,3,4,5],
  'waxing gibbous'  : [1,2,3,4,5],
  'first quarter'   : [3,4,5],
  'waxing crescent' : [4,5],
  'new'             : [],
  'waning crescent' : [0,1],
  'third quarter'   : [0,1,2],
  'waning gibbous'  : [0,1,2,3,4]
};

function MoonFish(opts) {
  if(!(this instanceof MoonFish)) {
    return new MoonFish(opts);
  }

  this.galileo        = new Galileo();
  this.phase          = '';
  this.percentLit     = 0;
  this.daysOld        = 0;
}

function checkMoonPhase(moonfish) {
  process.exec('python ./lib/moon.py', function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
    } else {
      if(stdout) {
        console.log('stdout: ' + stdout);
      }
      
      var res       = parseMoonPhase(stdout);
      moonfish.phase      = res.phase;
      moonfish.percentLit = res.percentLit;
      moonfish.daysOld    = res.daysOld;
        
      for(var o in MOON_PHASES) {
        if(o === moonfish.phase) {
          console.log(o);
          setMoonPhase();
        }
      }
    }
  });
}

function parseMoonPhase(phaseText) {
  var res = phaseText.split(',');
  return {
    phase:      res[0],
    percentLit: res[1],
    daysOld:    res[2]
  };
}

function setMoonPhase() {
  for(var i = 0; i < 6; ++i) {
    console.log("Turning off pixel " + i);
    //client.setPixel(i, 0, 0, 0);
  }

  for(var o in MOON_PHASES[mf.phase]) {
    console.log("Turning on pixel " + MOON_PHASES[mf.phase][o]);
    //client.setPixel(o, 255, 255, 255);
  }

  //client.writePixels();
}

var mf = new MoonFish();
checkMoonPhase(mf);

var rule = new schedule.RecurrenceRule();
rule.minute = 0;

var job = schedule.scheduleJob(rule, function(){
  checkMoonPhase(mf);
});