var utils = require('./utilities.js');
var users = require('./users.js');

RegisterUser = function(userObject, cb){
	userObject.userID = utils.GenerateUserID();
	users.AddUser(userObject, function(added){
		cb(userObject.userID);
	});
};

UnregisterUser = function(userObject, cb){
	users.RemoveUser(userObject, function(removed){
		cb(removed);
	});
	
};

ListSingleUsers = function (cb){
	users.GetSingleUserList(function(userList){
		cb(userList);
	});
};

PairUsers = function(pairObject, cb){
	pairObject.pairID = utils.GeneratePairID();
	users.PairUsers(pairObject, function (bCompleted){
		if (bCompleted){
			cb (pairObject.pairID);
		}else{
			cb ("");
		}
	});
	
};

GetUser = function (userObject, cb){
	users.GetUser(userObject.userID, function (userObject){
		cb(userObject);	
	});	
}

exports.RegisterUser = RegisterUser;
exports.UnregisterUser = UnregisterUser;
exports.ListSingleUsers = ListSingleUsers;
exports.PairUsers = PairUsers;
exports.GetUser = GetUser;