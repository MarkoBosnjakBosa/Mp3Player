module.exports = function(app, models, multer, fs) {
    const Song = models.Song;
	var storage = multer.diskStorage({
		destination: function (request, file, callback) {
			callback(null, "songs/");
		},
		filename: function (request, file, callback) {
			callback(null, file.originalname);
		},
	});
	var upload = multer({
		storage: storage,
		fileFilter: function (request, file, callback) {
			if(file.mimetype === "audio/mp3") {
				callback(null, true);
			} else {
				request.extensionValidationError = true;
				return callback(null, false, request.extensionValidationError);
			}
		},
		limits: {fileSize: 500000}
    });
    app.post("/uploadSong", upload.single("song"), (request, response) => {
		var allowUpload = true;
		var errorFields = [];
		var title = request.body.title;
		if(!title) {
			errorFields.push("title");
			allowUpload = false;
		}
		var author = request.body.author;
		if(!author) {
			errorFields.push("author");
			allowUpload = false;
		}
		var song = request.file;
		if(!song && request.extensionValidationError) {
			errorFields.push("song");
			allowUpload = false;
		}
		if(allowUpload) {
			var query = {name: name};
			Song.findOne(query).then(song => {
				if(!isEmpty(song)) {
					var error = {created: false, alreadyExists: true, field: "title"};
                    response.status(200).json(error);
                    response.end();
				} else {
					var newSong = getSongScheme(Song, title, author, path);
                    newSong.save().then(user => {
                        response.status(200).json({created: true});
                        response.end();
                    }).catch(error => console.log(error));
				}
			}).catch(error => console.log(error));
		} else {
			response.status(200).json({created: false, alreadyExists: false, errorFields: errorFields});
			response.end();
		}
    });
    
    function getSongScheme(Song, title, author, path) {
		return new Song({title: title, author: author, path: path});
	}
}