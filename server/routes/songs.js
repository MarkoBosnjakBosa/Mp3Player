module.exports = function(app, models, multer, fs, async) {
	const Artist = models.Artist;
	const Song = models.Song;
	const folderPath = "../client/src/assets/songs/";
	app.get("/getSongs", (request, response) => {
		var query = {};
        Song.find(query).then(songs => {
			response.status(200).json({songs: songs});
			response.end();
		}).catch(error => console.log(error));
	});
	app.get("/getSongsByArtist/:artistId", (request, response) => {
		var artistId = request.params.artistId;
		var artistQuery = {_id: artistId};
		var songsQuery = {artistId: artistId};
		var queries = [];
		queries.push(function(callback) {
			Artist.findOne(artistQuery).then(artist => {
				callback(null, artist);
			}).catch(error => console.log(error));
		});
		queries.push(function(callback) {
			Song.find(songsQuery).then(songs => {
				callback(null, songs);
			}).catch(error => console.log(error));
		});
		async.parallel(queries, function(error, results) {
			response.status(200).json({artist: results[0].name, songs: results[1]});
			response.end();
		});
	});
	var storage = multer.diskStorage({
		destination: function (request, file, callback) {
			var artistId = request.body.artistId;
			var query = {_id: artistId};
			Artist.findOne(query).then(artist => {
				if(!isEmpty(artist)) {
					callback(null, folderPath + artist.folder);
				}
			}).catch(error => console.log(error));
		},
		filename: function (request, file, callback) {
			var fileArray = file.originalname.split(".");
			var fileName = fileArray[0] + "_" + Date.now() + "." + fileArray[1];
			callback(null, fileName);
		},
	});
	var upload = multer({
		storage: storage,
		fileFilter: function (request, file, callback) {
			if(file.mimetype === "audio/mpeg") {
				callback(null, true);
			} else {
				request.extensionValidationError = true;
				return callback(null, false, request.extensionValidationError);
			}
		}
    });
    app.post("/uploadSong", upload.single("file"), (request, response) => {
		var allowUpload = true;
		var errorFields = [];
		var artistId = request.body.artistId;
		if(!artistId) {
			errorFields.push("artistId");
			allowUpload = false;
		}
		var file = request.file;
		if(!file && request.extensionValidationError) {
			errorFields.push("file");
			allowUpload = false;
		}
		if(allowUpload) {
			var query = {_id: artistId};
			Artist.findOne(query).then(artist => {
				if(!isEmpty(artist)) {
					var title = file.originalname;
					var fileName = file.filename;
					var path = artist.folder + "/" + fileName;
					var newSong = getSongScheme(Song, title, artistId, artist.name, path, fileName);
					newSong.save().then(song => {
						response.status(200).json({uploaded: true, song: song});
						response.end();
					}).catch(error => console.log(error));
				} else {
					errorFields.push("artistId");
					response.status(200).json({uploaded: false, errorFields: errorFields});
					response.end();
				}
			}).catch(error => console.log(error));
		} else {
			response.status(200).json({uploaded: false, errorFields: errorFields});
			response.end();
		}
    });
    app.put("/editSong", (request, response) => {
        var songId = request.body.songId;
        var title = request.body.title;
        if(songId && title) {
            var query = {_id: songId};
            var update = {title: title};
            Song.findOneAndUpdate(query, update, {new: true}).then(song => {
                if(!isEmpty(song)) {
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
    app.delete("/deleteSong/:songId", (request, response) => {
        var songId = request.params.songId;
        if(songId) {
            var query = {_id: songId};
            Song.findOneAndRemove(query).then(song => {
                if(!isEmpty(song)) {
					fs.unlink(song.path, function(error) {});
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
    
    function getSongScheme(Song, title, artistId, artistName, path, fileName) {
		return new Song({title: title, artistId: artistId, artistName: artistName, path: path, fileName: fileName});
	}
	function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}