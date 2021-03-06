module.exports = function(app, models, fs, async) {
	const Artist = models.Artist;
	const Song = models.Song;
	const folderPath = "../client/src/assets/songs/";
	app.get("/getArtists", (request, response) => {
		var query = {};
		Artist.find(query).then(artists => {
			response.status(200).json({artists: artists});
			response.end();
		}).catch(error => console.log(error));
	});
	app.post("/createArtist", (request, response) => {
		var allowCreation = true;
		var errorFields = [];
		var name = request.body.name;
		if(!name) {
			errorFields.push("name");
			allowCreation = false;
		}
		var folder = request.body.folder;
		if(!folder || invalidFolder(folder)) {
			errorFields.push("folder");
			allowCreation = false;
		}
		if(allowCreation) {
			var query = {$or: [{name: name}, {folder: folder}]};
			Artist.findOne(query).then(artist => {
				if(!isEmpty(artist)) {
					var error = {created: false, alreadyExists: true};
					if(artist.name == name) {
						error.field = "name";
					} else {
						error.field = "folder";
					}
					response.status(200).json(error);
					response.end();
				} else {
					var newArtist = getArtistScheme(Artist, name, folder);
					newArtist.save().then(artist => {
						if(!fs.existsSync(folderPath + folder)) {
							fs.mkdirSync(folderPath + folder);
						}
						response.status(200).json({created: true, artist: artist});
						response.end();
					}).catch(error => console.log(error));
				}
			}).catch(error => console.log(error));
		} else {
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
			Artist.findOneAndUpdate(query, update, {new: true}).then(artist => {
				if(!isEmpty(artist)) {
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
			var queries = [];
			var artistQuery = {_id: artistId};
			queries.push(function(callback) {
				Artist.findOneAndRemove(artistQuery).then(artist => {
					if(!isEmpty(artist)) {
						if(fs.existsSync(folderPath + artist.folder)) {
							fs.rmdirSync(folderPath + artist.folder, {recursive: true});
						}
					}
					callback(null, artist);
				}).catch(error => console.log(error));
			});
			var songsQuery = {artistId: artistId};
			queries.push(function(callback) {
				Song.deleteMany(songsQuery).then(songs => {
					callback(null, songs);
				}).catch(error => console.log(error));
			});
			async.parallel(queries).then(results => {
				var artistResult = results[0];
				if(!isEmpty(artistResult)) {
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

	function getArtistScheme(Artist, name, folder) {
		return new Artist({name: name, folder: folder});
	}
	function invalidFolder(folder) {
		var folderFormat = /^[a-z0-9_.]*$/;
		if(folderFormat.test(folder)) {
			return false;
		} else {
			return true;
		}
	}
	function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}