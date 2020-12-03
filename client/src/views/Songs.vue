<template>
	<div id="songs" class="container-fluid">
		<navigation></navigation>
		<div class="songsIcon">
            <i class="fas fa-music fa-7x"></i>
        </div>
		<div id="songsForm">
            <form autocomplete="off" @submit.prevent="uploadSong()" enctype="multipart/form-data">
			<div class="form-row">
				<div class="form-group col-md-6">
					<select id="artist" class="form-control" :class="{'errorField' : artistIdError && submitting}" v-model="song.artistId" @focus="clearArtistIdStatus()" @keypress="clearArtistIdStatus()">
						<option value="" disabled selected>Select artist...</option>
						<option v-for="artist in artists" :key="artist._id" :value="artist._id">{{artist.name}}</option>
					</select>
                    <small v-if="artistIdError && submitting" class="form-text errorInput">Please provide a valid artist!</small>
				</div>
                <div class="form-group col-md-6">
					<input type="file" id="file" class="inputFile" @change="selectFile($event)"/>
					<label for="file"><i class="fas fa-music"></i><span id="fileName">Choose a song</span></label>
                    <small v-if="fileError && submitting" class="form-text errorInput fileError">Please provide a valid file!</small>				
                </div>
			</div>
            <div v-if="songUploaded" class="form-group uploadSuccessful">Your song has been successfully uploaded!</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">Upload</button>
				<button type="button" class="btn btn-danger resetForm" @click="resetForm()">Reset</button>
			</div>
		</form>
        </div>
        <table id="songsTable" class="table">
			<thead>
				<th scope="col">#</th>
				<th scope="col">Title</th>
				<th scope="col">Artist</th>
				<th scope="col">Actions</th>
				<th scope="col">
					<select id="filter" class="form-control" v-model="filter">
						<option value="all">All</option>
						<option v-for="artist in artists" :key="artist._id" :value="artist._id">{{artist.name}}</option>
					</select>
				</th>
			</thead>
			<tbody>
				<tr v-if="!filterByArtist.length">
					<td colspan="6" class="noSongs">No songs found!</td>
				</tr>
				<tr v-for="(song, index) in filterByArtist" :key="song._id">
					<th scope="row">{{++index}}</th>
					<td v-if="editing == song._id"><input type="text" class="form-control" v-model="song.title"/></td>
					<td v-else>{{song.title}}</td>
					<td v-if="editing == song._id" class="padded">{{song.artistName}}</td>
					<td v-else>{{song.artistName}}</td>
					<td v-if="editing == song._id" class="padded">
						<i class="far fa-check-circle editSong" @click="editSong(song)"></i>
						<i class="far fa-times-circle disableEditing" @click="disableEditing(song)"></i>
					</td>
					<td v-else>
						<i class="fas fa-pencil-alt" @click="enableEditing(song)"></i>
						<i class="fas fa-trash" @click="deleteSong(song._id)"></i>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	import Navigation from "@/components/Navigation.vue"; 
    var axios = require("axios");
    
	export default {
		name: "songs",
		components: {
			Navigation
		},
        data() {
            return {
                songs: [],
                artists: [],
                submitting: false,
                artistIdError: false,
                fileError: false,
                song: {
                    artistId: "",
                    file: ""
                },
                songUploaded: false,
                filter: "all",
                editing: null
            }
        },
        methods: {
            getSongs() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getSongs").then(response => {
                    this.songs = response.data.songs;
                }).catch(error => console.log(error));
            },
            getArtists() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getArtists").then(response => {
                    this.artists = response.data.artists;
                }).catch(error => console.log(error));
            },
            uploadSong() {
                this.submitting = true;
                this.clearArtistIdStatus();
                this.clearFileStatus();
				var allowUpload = true;
				if(this.invalidArtistId) {
					this.artistIdError = true;
					allowUpload = false;
				}
				if(this.invalidFile) {
					this.fileError = true;
					allowUpload = false;
				}
				if(!allowUpload) {
                    this.songUploaded = false;
					return;
				}
				var formData = new FormData();
				formData.append("artistId", this.song.artistId);
				formData.append("file", this.song.file);
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/uploadSong", formData).then(response => {
                    if(response.data.uploaded) {
                        var newSong = response.data.song;
                        this.songs = [...this.songs, newSong];
                        this.songUploaded = true;
                        this.$refs.first.focus();
                        this.song = {artistId: "", file: ""};
                        this.artistIdError = false, this.fileError = false, this.submitting = false;
                    } else {
                        var errorFields = response.data.errorFields;
                        if(errorFields.includes("artistId")) this.artistIdError = true;
                        if(errorFields.includes("file")) this.fileError = true;
                        this.songUploaded = false;
                    }
                }).catch(error => console.log(error));
			},
			enableEditing(song) {
                this.cachedSong = Object.assign({}, song);
                this.editing = song._id;
            },
            disableEditing(song) {
                Object.assign(song, this.cachedSong);
                this.editing = null;
            },
            editSong(updatedSong) {
                var body = {songId: updatedSong._id, title: updatedSong.title};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/editSong", body).then(response => {
                    if(response.data.edited) {
						this.songs = this.songs.map(song => song._id == updatedSong._id ? updatedSong : song);
						this.editing = null;
                    }
                }).catch(error => console.log(error));
            },
            deleteSong(songId) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/deleteSong/" + songId).then(response => {
                    if(response.data.deleted) {
                        this.songs = this.songs.filter(song => song._id != songId);
                    }
                }).catch(error => console.log(error));
            },
            resetForm() {
                this.song = {artistId: "", file: ""};
                this.artistIdError = false, this.fileError = false, this.songUploaded = false, this.submitting = false;
            },
            clearArtistIdStatus() { this.artistIdError = false; },
			clearFileStatus() { this.fileError = false; },
			selectFile(event) {
				var files = event.target.files;
				var allowedExtensions = ["audio/mpeg"];
				if(files && files.length && allowedExtensions.includes(files[0].type)) {
					var file = files[0];
					var reader = new FileReader();
					this.song.file = file;
					document.getElementById("fileName").textContent = file.name;
					this.clearFileStatus();
					reader.readAsDataURL(file);
				} else {
					this.fileError = true;
				}
			},
        },
        computed: {
			filterByArtist() {
				if(this.filter != "all") {
					return this.songs.filter(song => song.artistId == this.filter);
				} else {
					return this.songs;
				}
            },
            invalidArtistId() { return this.song.artist === ""; },
            invalidFile() { return this.song.file === ""; }
		},
        created() {
            this.getSongs();
            this.getArtists();
        }
    }
</script>

<style scoped>
	.songsIcon {
		margin-top: 20px;
		margin-bottom: 20px;
        text-align: center;
	}
    #songsForm {
		max-width: 800px;
		margin: 0 auto;
		margin-bottom: 20px;
	}
	.inputFile {
		width: 0.1px;
		height: 0.1px;
		opacity: 0;
		overflow: hidden;
		position: absolute;
		z-index: -1;
	}
	.inputFile + label{
		width: 100%;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
		display: inline-block;
		overflow: hidden;
		padding: 5px;
		color: #808080;
		border: 2px solid #808080;
		border-radius: .25rem;
	}
	.inputFile:focus + label, .inputFile.has-focus + label, .inputFile + label:hover {
		outline: 1px dotted #000;
		outline: -webkit-focus-ring-color auto 5px;
		color: #000;
	}
	.inputFile + .fas.fa-music {
		width: 1em;
		height: 1em;
		vertical-align: middle;
		fill: currentColor;
		margin-top: -0.25em;
		margin-right: 0.25em;
	}
	#fileName {
		margin-left: 5px;
	}
	.fileError {
		margin-top: -10px;
	}
	#songsTable {
        margin: 0 auto;
        max-width: 1000px;
    }
	tbody .fas, tbody .far {
        cursor: pointer;
        margin-right: 5px;
    }
    .padded {
        padding-top: 20px;
    }
    .editSong {
        color: #008000;
    }
    .disableEditing {
        color: #ff0000;
    }
	.noSongs {
        text-align: center;
    }
	.resetForm {
		margin-left: 10px;
	}
	.uploadSuccessful {
		color: #008000;
		margin-bottom: 10px;
	}
	.errorField {
		border: 1px solid #ff0000;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorInput {
		color: #ff0000;
	}
</style>