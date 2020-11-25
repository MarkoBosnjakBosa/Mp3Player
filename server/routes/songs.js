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
			callback(null, "songs/");
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
		var author = request.body.author;
		if(!author) {
			errorFields.push("author");
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
			var path = "../../../server/songs/" + file.originalname;
			var newSong = getSongScheme(Song, title, author, fileName, path);
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
        var author = request.body.icon;
        if(songId && title && author) {
            var query = {_id: songId};
            var update = {title: title, author: author};
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
    
    function getSongScheme(Song, title, author, fileName, path) {
		return new Song({title: title, author: author, fileName: fileName, path: path});
	}
	function isEmpty(object) {
		return !object || Object.keys(object).length === 0;
	}
}