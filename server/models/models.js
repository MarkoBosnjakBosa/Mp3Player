module.exports = function(mongoose) {
	const artistScheme = new mongoose.Schema({
		name: String,
		folder: String
	});
	const songScheme = new mongoose.Schema({
		title: String,
		artistId: String,
		artistName: String,
		path: String,
		fileName: String
	});
	const models = {
		Artist: mongoose.model("Artist", artistScheme),
		Song: mongoose.model("Song", songScheme)
	}
	return models;
}