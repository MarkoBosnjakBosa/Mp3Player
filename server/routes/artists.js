module.exports = function(app, models, multer, fs, path) {
	const Song = models.Song;
	app.get("/getSongs", (request, response) => {
		var query = {};
        Song.find(query).then(songs => {
			response.status(200).json({songs: songs});
			response.end();
		}).catch(error => console.log(error));
	});
	var storage = multer.diskStorage({
		destination: function (request, file, callback) {
			var author = request.body.author;
			var path = "../client/src/assets/songs/" + author;
			var existingFolder = null;
			try {
				existingFolder = fs.statSync(path);
			} catch(error) {
				fs.mkdirSync(path);
			}
			callback(null, path);
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
		var artist = request.body.artist;
		if(!artist) {
			errorFields.push("artist");
			allowUpload = false;
		}
		var file = request.file;
		if(!file && request.extensionValidationError) {
			errorFields.push("file");
			allowUpload = false;
		}
		if(allowUpload) {
			var title = file.originalname;
			var fileName = file.filename;
			var newSong = getSongScheme(Song, title, artist, fileName);
			newSong.save().then(song => {
				response.status(200).json({uploaded: true, song: song});
				response.end();
			}).catch(error => console.log(error));
		} else {
			response.status(200).json({uploaded: false, alreadyExists: false, errorFields: errorFields});
			response.end();
		}
    });
    app.put("/editSong", (request, response) => {
        var songId = request.body.songId;
        var title = request.body.title;
        var artist = request.body.artist;
        if(songId && title && artist) {
            var query = {_id: songId};
            var update = {title: title, artist: artist};
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
					fs.unlink(path.join(__dirname, "../songs/", song.path), function(error) {});
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
    
    function getSongScheme(Song, title, artist, fileName) {
		return new Song({title: title, artist: artist, fileName: fileName});
	}
	function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}