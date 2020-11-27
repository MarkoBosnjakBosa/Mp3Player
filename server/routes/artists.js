module.exports = function(app, models, fs) {
	const Artist = models.Artist;
	const folderPath = "../client/src/assets/songs/";
	app.get("/getArtists", (request, response) => {
		var query = {};
        Artist.find(query).then(artists => {
			response.status(200).json({artists: artists});
			response.end();
		}).catch(error => console.log(error));
	});
    app.post("/createArtist", (request, response) => {
		var errorFields = [];
		var name = request.body.name;
		if(name) {
			var query = {name: name};
			Artist.findOne(query).then(artist => {
				if(!isEmpty(artist)) {
					response.status(200).json({created: false, alreadyExists: true, errorFields: errorFields});
					response.end();
				} else {
					var newArtist = getArtistScheme(Artist, name);
					newArtist.save().then(artist => {
						if(!fs.existsSync(folderPath + name)) {
							fs.mkdirSync(folderPath + name);
						}
						response.status(200).json({created: true, artist: artist, alreadyExists: false, errorFields: errorFields});
						response.end();
					}).catch(error => console.log(error));
				}
			}).catch(error => console.log(error));
		} else {
			errorFields.push("name");
			response.status(200).json({created: false, alreadyExists: false, errorFields: errorFields});
			response.end();
		}
    });
    app.put("/editArtist", (request, response) => {
        var artistId = request.body.artistId;
        var name = request.body.name;
        if(artistId && name) {
            var query = {_id: artistId};
            var update = {name: name};
            if(!fs.existsSync(folderPath + name)) {
                response.status(200).json({edited: false});
                response.end();
                return;
            }
            Artist.findOneAndUpdate(query, update).then(artist => {
                if(!isEmpty(artist)) {
                    fs.renameSync(folderPath + artist.name, folderPath + name);
                    response.status(200).json({edited: true});
                    response.end();
                } else {
                    response.status(200).json({edited: false});
                    response.end();
                }
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({edited: false});
            response.end();
        }
    });
    app.delete("/deleteArtist/:artistId", (request, response) => {
        var artistId = request.params.artistId;
        if(artistId) {
			var query = {_id: artistId};
            Artist.findOneAndRemove(query).then(artist => {
                if(!isEmpty(artist)) {
                    if(fs.existsSync(folderPath + artist.name)) {
                        fs.rmdirSync(folderPath + artist.name);
                    }
                    response.status(200).json({deleted: true});
                    response.end();
                } else {
                    response.status(200).json({deleted: false});
                    response.end();
                }
            }).catch(error => console.log(error));
        } else {
            response.status(200).json({deleted: false});
            response.end();
        }
    });
    
    function getArtistScheme(Artist, name) {
		return new Artist({name: name});
	}
	function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}