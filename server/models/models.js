module.exports = function(mongoose) {
	const songScheme = new mongoose.Schema({
		title: String,
		author: String,
		path: String
	});
	const models = {
		Song: mongoose.model("Song", songScheme)
	}
	return models;
}