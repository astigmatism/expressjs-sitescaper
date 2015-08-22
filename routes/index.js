var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');
var gm = require('gm');
var router = express.Router();

router.get('/google', function(req, res, next) {
  	
    var delay = req.query.delay || 10000;

	var systemnames = {
		nes: 'nes',
		snes: 'snes',
		gen: 'sega genesis',
		gb: 'gameboy'
	}

    var i;
    var resizes = [400, 300, 250, 200, 150, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

	//open the data dir
    fs.readdir(__dirname + '/../data', function(err, systems) {
        if (err) {
            return res.json(err);
        }

        //loop over each system
        async.eachSeries(systems, function(system, nextsystem) {

            //pass over "all" folder
            if (system === 'all' || system.indexOf('.') === 0) {
                return nextsystem(null);
            }

            console.log('google: starting ' + system);

            var systemfolder = __dirname + '/../google/' + system;

            fs.exists(systemfolder, function (exists) {
                if (!exists) {
                    fs.mkdirSync(systemfolder);
                }

                //read the genreated search.json file
                fs.readFile(__dirname + '/../data/' + system + '/search.json', 'utf8', function(err, content) {

                    try {
                        content = JSON.parse(content);
                    } catch (e) {
                        return nextsystem(e);
                    }

                    var games = [];
                    for (game in content) {
                    	if (content[game].r >= 88) {
                    		games.push(game);
                    	}
                    }
                    var ctr = 0;

                    //loop over games
                    async.eachSeries(games, function(game, nextgame) {

                    	++ctr;
                        var foldertocheck = __dirname + '/../google/' + system + '/' + game;

                        fs.exists(foldertocheck, function (exists) {
                            if (exists) {
                                return nextgame(null);
                            }

                            //build url
                            var term = encodeURIComponent(systemnames[system] + ' ' + game + ' box');
                            var url = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=8&start=0&q=' + term;

                            console.log('goog ' + system + ' ' + ctr + ': ' + game + ' --> ' + url);

                            request({
                                method: 'get',
                                url: url
                            }, function(err, response, body) {
                                if (err) {
                                    return nextgame(response);
                                }
                                
                                console.log('search retunred');

                                body = JSON.parse(body);
                                
                                if (body.responseData && body.responseData.results && body.responseData.results[0] && body.responseData.results[0].unescapedUrl) {

                                    var imageurl = body.responseData.results[0].unescapedUrl;
                                } else {
                                    
                                    console.log('likely error in response: ' + body);
                                    return nextgame(console.log(JSON.stringify(response, null, 4))); //an error. maybe google suspected foul play
                                }

                                console.log('waiting to prevent spamming google.... if you want to stop the application, do so now.');
                                setTimeout(function() {
                                    
                                    console.log('create game folder');
                                    fs.mkdirSync(__dirname + '/../google/' + system + '/' + game);

                                    console.log('downloading');
                                    download(imageurl, __dirname + '/../google/' + system + '/' + game + '/original.jpg', function(filename){
                                        
                                        console.log('resizing asynconously..');

                                        for (i = 0; i < resizes.length; ++i) {

                                            gm(filename).resize(resizes[i]).write(__dirname + '/../google/' + system + '/' + game + '/' + resizes[i] + '.jpg', function (err) {
                                                if (err) {
                                                    console.log('resizing error: ' + err)
                                                }
                                            });
                                        }

                                        console.log('done!');
                                        nextgame(null);
                                        
                                    });
                                }, delay);
                            });

                        });

                    }, function(err) {
    				    if (err) {
    				        return nextsystem(err);
    				    }
    				    console.log('next system');
    				    nextsystem(null);
    				});
                });
            });

        }, function(err) {
            if (err) {
                return res.json(err);
            }
            res.json();
        });
    });
});

router.get('/bing', function(req, res, next) {
  	
	var systemnames = {
		nes: 'nes',
		snes: 'snes',
		gen: 'sega genesis',
		gb: 'gameboy'
	};

	//open the data dir
    fs.readdir(__dirname + '/../data', function(err, systems) {
        if (err) {
            return res.json(err);
        }

        //loop over each system
        async.eachSeries(systems, function(system, nextsystem) {

            //pass over "all" folder
            if (system === 'all' || system.indexOf('.') === 0) {
                return nextsystem(null);
            }

            console.log('bing: starting ' + system);

            var newdir = __dirname + '/../bing/' + system;
            try {
            	fs.mkdirSync(newdir);
            } catch (e) {
            	
            }

            //read the genreated search.json file
            fs.readFile(__dirname + '/../data/' + system + '/search.json', 'utf8', function(err, content) {

                try {
                    content = JSON.parse(content);
                } catch (e) {
                    return nextsystem(e);
                }

                var games = [];
                for (game in content) {
                	if (content[game].r >= 88) {
                		games.push(game);
                	}
                }
                var ctr = 0;

                //loop over games
                async.eachSeries(games, function(game, nextgame) {
                	
                    ++ctr;

                    try {
                        stats = fs.lstatSync(__dirname + '/../bing/' + system + '/' + game + '.jpg');

                        if (stats.isFile()) {
                            return nextgame(null);
                        }
                    } catch (e) {
                        //continue when file not found
                    }

                	//build url
                	var term = encodeURIComponent(systemnames[system] + ' ' + game + ' box');
				    var url = 'https://api.datamarket.azure.com/Bing/Search/v1/Image?Query=%27' + term + '%27&$format=json';

				    console.log('bing ' + ctr + ': ' + game + ' --> ' + url);

				    request({
				    	method: 'get',
				    	url: url,
                        headers: {
                            'Authorization': 'Basic OjVRb3hwWEtRQWVGY1YySEIvQk5SVWQrVDZJM3A3WFgxMGh4dXFTbkdyVHc='
                        }
				    }, function(err, response, body) {
				    	if (err) {
				    		return nextgame(response);
				    	}
				    	body = JSON.parse(body);

				    	if (body.d && body.d.results && body.d.results[0] && body.d.results[0].MediaUrl) {

				    		var imageurl = body.d.results[0].MediaUrl;
				    	} else {
				    		return nextgame(null); //no results, next game
				    	}

						download(imageurl, __dirname + '/../bing/' + system + '/' + game + '.jpg', function(){
							nextgame(null);
						});
				    });

                }, function(err) {
				    if (err) {
				        return nextsystem(err)
				    }
				    console.log('next system');
				    nextsystem(null);
				});
            });

        }, function(err) {
            if (err) {
                return res.json(err);
            }
            res.json();
        });
    });
});

var download = function(uri, filename, callback){
	request.head(uri, function(err, res, body){
		//console.log('content-type:', res.headers['content-type']);
		//console.log('content-length:', res.headers['content-length']);

		request(uri, {timeout: 1500})
        .on('error', function(err) {
            console.log(err);
            callback();
        })
		.pipe(fs.createWriteStream(filename)).on('close', function() {
			callback(filename);
		});
	});
};

module.exports = router;