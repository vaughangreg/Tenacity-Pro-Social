var serverConfig = require('./serverConfig.js');
var redis = require ('redis');
var redisClient = redis.createClient(serverConfig.redis.port, serverConfig.redis.host);

var schema 	= serverConfig.redis.schema;
var pairData = schema + "PairData:";

AddDataToPairSet = function (updateObject, cb){
	var d = new Date();
	d.setSeconds(d.getSeconds() + Math.round(d.getMilliseconds()/1000));
	console.log(updateObject.isTarget);
	if (updateObject.isTarget == 'true'){
		d.setMilliseconds(0);
	}else{
		d.setMilliseconds(1);
	}
	updateObject.timeStamp = d.toISOString();
	redisClient.hset(pairData + updateObject.pairID, updateObject.timeStamp, JSON.stringify(updateObject), function (error, added){
		if (error){
			console.log(error);
			cb(false);
			return;
		}
		cb(true);
		return;	
	});
};

GetDataByPair = function (pairObject, cb){
	redisHelperGetHashObject(pairData + pairObject.pairID, function(dataObject){
		cb(dataObject);
	});
};

exports.AddDataToPairSet = AddDataToPairSet;
exports.GetDataByPair = GetDataByPair;





redisHelperGetHashObject = function (key, cb){
	var ret = {}
	var complete = function (){
		cb(ret);
	}
	redisClient.hkeys(key, function (error, data){
		if (error){
			console.log("getHashObjectError:hkeys: " + error);
			cb(ret);
			return;
		};
		AsyncEach(data, function(item, resume){
			redisClient.hget(key, item, function (error, value){
				if (error){
					console.log("Async hget error: " + error);
				}
				ret[item] = JSON.parse(value);
				resume();
			});
		}, complete);
	});	
};

AsyncEach = function(array, iterator, complete) {
  var list    = array,
      n       = list.length,
      i       = -1,
      calls   = 0,
      looping = false;

  var iterate = function() {
    calls -= 1;
    i += 1;
    if (i === n) {
		complete();
		return;
	}
	iterator(list[i], resume);
  };

  var loop = function() {
    if (looping) return;
    looping = true;
    while (calls > 0) iterate();
    looping = false;
  };

  var resume = function() {
    calls += 1;
    if (typeof setTimeout === 'undefined') loop();
    else setTimeout(iterate, 1);
  };
  resume();
};