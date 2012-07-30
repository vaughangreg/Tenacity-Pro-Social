
/**
 * Module dependencies.
 */

var serverConfig = require('./serverConfig.js');
var userManager = require('./userMethods.js');
var dataManager = require('./datastore.js');


var express = require('express')
  , routes = require('./routes')
  , http = require('http') 
  ,	format = require('util').format
  , fs = require('fs');

var app = express();

var ejs = require('ejs');

app.configure(function(){
  app.set('port', serverConfig.node.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir: serverConfig.node.imageTemp}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.post('/register', function (req, res){
	userManager.RegisterUser(req.body, function(userID){
		res.json({userID: userID});
	});
});

app.post('/unregister', function (req, res){
	userManager.UnregisterUser(req.body, function (removed){
		res.json({wasRemoved: removed});
	});
});

app.post('/update', function (req, res){
	console.log(req.body);
	dataManager.AddDataToPairSet(req.body, function (success){
		res.json({wasReceived: true});
	});
});

app.get('/userstopair', function (req, res){
	var info = {};
	userManager.ListSingleUsers(function (data){
		info.currentUsers = data;
		console.log(info);
		res.render('pairusers', info)
	});
	
});


app.post('/pairusers', function (req, res){
	console.log (req.body);
	userManager.PairUsers(req.body, function(pairID){
		res.json({pairID: pairID});
	});
});

app.post('/poll', function (req, res){
	userManager.GetUser(req.body, function (userObject){
		res.json(userObject);	
	});
});

app.post('/pollPairData', function (req, res){
	dataManager.GetDataByPair(req.body, function (dataObject){
		res.json(dataObject);
	});
});

app.post('/lineGraphPair', function (req, res){
	dataManager.GetDataByPair(req.body, function(dataObject){
		var targetData = [];
		var perceiverData = [];
		for (var key in dataObject){
			console.log(dataObject[key]);
			if (dataObject[key].isTarget == 'true'){
				targetData.push(dataObject[key]);
			}else{
				perceiverData.push(dataObject[key]);
			}
		}
		targetData.sort(function (a, b){
			var dateA = new Date(a.timeStamp); 
			var dateB = new Date(b.timeStamp);
			return dateA - dateB;
		});
		perceiverData.sort(function (a, b){
			var dateA = new Date(a.timeStamp); 
			var dateB = new Date(b.timeStamp);
			return dateA - dateB;
		});
		
		var dateSorter = function (a, b){
			var dateA = new Date(a.timeStamp); 
			var dateB = new Date(b.timeStamp);
			return dateA - dateB;
		}; 
		
		res.render('viewPair', {perceiverData: JSON.stringify(perceiverData), targetData: JSON.stringify(targetData)});
	});
	
});

app.post ('/scatterPlotPair', function (req, res){
	dataManager.GetDataByPair(req.body, function (dataObject){
		var pairs = [];
		for (var key1 in dataObject){
			for (var key2 in dataObject){
				var t1 = new Date(dataObject[key1].timeStamp).setMilliseconds(new Date(dataObject[key1].timeStamp).getMilliseconds());
				var t2 = new Date(dataObject[key2].timeStamp).setMilliseconds(0); //ms of 1 is the guesser
				
				var x = dataObject[key2].rating;
				var y = dataObject[key1].rating;
				console.log(t1 + " " + t2);
				if (t1 == t2){
					var foundPair = false;
					for (var p in pairs){
						if (p.timeX == t2) foundPair = true;
					}
					if (foundPair == false){
						pairs.push({timeX: t2, x: x, timeY: t1, y: y});
					}
				}
			}		
		}
		res.render('scatterPlot', {plotData: JSON.stringify(pairs)});
	});	
});

app.get('/imageupload', function(req, res){
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Title: <input type="text" name="imageTitle" /></p>'
    + '<p>Image: <input type="file" name="image" /></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>');
});

app.post('/imageupload', function(req, res, next){
  // the uploaded file can be found as `req.files.image` and the
  // title field as `req.body.title`
	res.send(format('\nuploaded %s (%d Kb) to %s as %s'
	    , req.files.image.name
	    , req.files.image.size / 1024 | 0 
	    , req.files.image.path
	    , req.body.imageTitle));
	fs.rename(req.files.image.path, serverConfig.node.imageStore + "/" + req.body.imageTitle + ".png");
});












http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});











