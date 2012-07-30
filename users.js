var serverConfig = require('./serverConfig.js');
var redis = require ('redis');
var redisClient = redis.createClient(serverConfig.redis.port, serverConfig.redis.host);

var schema 	= serverConfig.redis.schema;
var users 	= schema + "Users:";
var pairs 	= schema + "Pairs:";

AddUser = function(userObject, cb){
	console.log("Adding User: " + JSON.stringify(userObject));
	userObject.pairID = '0';
	redisClient.hset(users, userObject.userID, JSON.stringify(userObject), function (error, added){
		cb(added);
		return 0;	
	});	
};

RemoveUser = function(userObject, cb){
	console.log("Removing User: " + userObject.userID);
	redisClient.hexists(users, userObject.userID, function (error, data){
		if (error) {
			console.log(error);
			cb(false);
			return
		}
		if (data) {
			redisClient.hdel(users, userObject.userID, function (error, success){
				if (error){
					console.log(error);
					cb(false);
					return;
				}
				cb(true);
				return;
			});	
		};	
	});
};

PairUsers = function (pairObject, cb){
	console.log("Pairing Users: " + pairObject.user1 + " & " + pairObject.user2);
	redisClient.hset(pairs, pairObject.pairID, JSON.stringify(pairObject), function (error, success){
		if (success){
			redisClient.hget(users, pairObject.user1, function (error, objectString){
				var userObject = JSON.parse(objectString);
				userObject.pairID = pairObject.pairID;
				userObject.isTarget = true;
				redisClient.hset(users, userObject.userID, JSON.stringify(userObject), function (error, success){
					redisClient.hget(users, pairObject.user2, function (error, objectString){
						var userObject = JSON.parse(objectString);
						userObject.pairID = pairObject.pairID;
						userObject.isTarget = false;
						redisClient.hset(users, userObject.userID, JSON.stringify(userObject), function (error, success){
							cb(true);
						});
					});
				});
			});
		}else{
			cb(false);
		}
	});
};

GetUser = function (userID, cb){
	redisClient.hget(users, userID, function (error, objectString){
		cb(JSON.parse(objectString));
	});
};

GetSingleUserList = function (cb){
	redisHelperGetHashObject(users, function(fieldsObject){
		var returning = {};
		for (var key in Object.keys(fieldsObject)){
			if (fieldsObject[Object.keys(fieldsObject)[key]].pairID == '0'){
				returning[Object.keys(fieldsObject)[key]] = fieldsObject[Object.keys(fieldsObject)[key]];
			}
		}		
		cb(returning);
	});
	return;
};

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
exports.AddUser = AddUser;
exports.RemoveUser = RemoveUser;
exports.GetSingleUserList = GetSingleUserList;
exports.PairUsers = PairUsers;
exports.GetUser = GetUser;