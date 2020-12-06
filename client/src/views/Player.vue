<template>
	<div id="player">
		<nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
			<button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div id="navbarOptions" class="collapse navbar-collapse">
				<ul class="navbar-nav ml-auto mt-2 mt-lg-0 mx-auto">
					<li class="nav-item">
						<a class="nav-link" :href="baseUrl + '/home'">Home</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" :href="baseUrl + '/songs'">Songs</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" :href="baseUrl + '/artists'">Artists</a>
					</li>
				</ul>
			</div>
		</nav>
		<div class="playerIcon">
			<i class="fas fa-headphones fa-7x"></i>
		</div>
		<div id="playlist">
			<audio ref="player" :src="current.src" autoplay></audio> 
			<div v-if="!songs.length"><b>No songs for this artist found!</b></div>
			<div v-else>
				<h1>{{current.title}}</h1>
				<div class="controls">
					<button type="button" class="btn btn-primary" @click="backward()"><i class="fas fa-backward"></i></button>
					<button type="button" class="btn btn-danger" v-if="!isPlaying" @click="play('', '')"><i class="fas fa-play"></i></button>
					<button type="button" class="btn btn-danger" v-else @click="pause()"><i class="fas fa-pause"></i></button>
					<button type="button" class="btn btn-primary" @click="forward()"><i class="fas fa-forward"></i></button>
					<button type="button" class="btn btn-info" v-if="!playingAgain" @click="playAgain()"><i class="fas fa-redo-alt"></i></button>
					<button type="button" class="btn btn-info" v-else @click="playAgain()"><i class="fas fa-undo-alt"></i></button>
					<button type="button" class="btn btn-info" v-if="volume > 0" @click="mute()"><i class="fas fa-volume-mute"></i></button>
					<button type="button" class="btn btn-info" v-else @click="mute()"><i class="fas fa-volume-up"></i></button>
					<button type="button" class="btn btn-light" @click="updateVolume('decrease')"><i class="fas fa-minus"></i></button>
					<input type="range" id="volumeBar" min="0" max="1" step="0.1" v-model="volume" @input="updateVolume('')">
					<button type="button" class="btn btn-light" @click="updateVolume('increase')"><i class="fas fa-plus"></i></button>
				</div>
				<div class="playingBar">
					<input type="range" id="playingBar" min="0" :max="duration" v-model="playingTime" @input="seek()">
					<b>{{convertedPlayingTime}} / {{convertedDuration}}</b>
				</div>
				<div>
					<h2>{{artist}}</h2>
					<ul class="list-group">
						<li v-for="(song, index) in songs" :key="song.id" class="list-group-item d-flex justify-content-between align-items-center">
							<div class="song" @click="play(song, index)"><b><i :id="'i_' + song.id" class="songStatus fas fa-play"></i><span class="artist">{{song.title}}</span></b></div>
							<a class="btn btn-primary" :href="require('../assets/songs/' + song.path)" role="button" download><i class="fas fa-download"></i></a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	var axios = require("axios");

	export default {
		name: "player",
		data() {
			return {
				baseUrl: process.env.VUE_APP_BASE_URL + process.env.VUE_APP_CLIENT_PORT,
				artistId: "",
				artist: "",
				songs: [],
				current: {},
				index: 0,
				isPlaying: false,
				playingTime: 0,
				convertedPlayingTime: "00:00",
				duration: 0,
				convertedDuration: "00:00",
				volume: 0,
				playingAgain: false
			}
		},
		methods: {
			getSongs() {
				axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getSongsByArtist/" + this.artistId).then(response => {
					this.artist = response.data.artist;
					var songs = [];
					var uploadedSongs = response.data.songs;
					if(uploadedSongs.length) {
						uploadedSongs.forEach(song => {
							var songObject = {};
							songObject["id"] = song._id;
							songObject["title"] = song.title;
							songObject["artist"] = song.artistName;
							songObject["path"] = song.path;
							songObject["src"] = require("../assets/songs/" + song.path);
							songs.push(songObject);
						});
						this.songs = songs;
						this.current = this.songs[this.index];
					}
				}).catch(error => console.log(error));
			},
			getPlayer() {
				var player = this.$refs.player;
				var temp = this;
				player.addEventListener("loadedmetadata", function() {
					temp.duration = player.duration;
					temp.convertedDuration = temp.convertTime(player.duration);
				}.bind(this));
				player.addEventListener("timeupdate", function() {
					temp.playingTime = this.currentTime;
					temp.convertedPlayingTime = temp.convertTime(this.currentTime);
					//temp.addSongInformation();
				});
				player.addEventListener("ended", function() {
					this.forward();
				}.bind(this));
			},
			play(song, index) {
				var player = this.$refs.player;
				if(typeof song.src != "undefined") {
					this.current = song;
				}
				if(index != "") {
					this.index = index;
				}
				var playerPromise = player.play();
				if(typeof playerPromise != "undefined") {
					playerPromise.then(() => {
						this.addSongInformation();
					}).catch(() => {
						this.addSongInformation();
					});
				}
			},
			addSongInformation() {
				var player = this.$refs.player;
				if(this.volume < 0.1) {	
					this.volume = player.volume;
				} else {
					player.volume = this.volume;
				}
				if(!isNaN(player.duration)) {
					this.duration = player.duration;
					this.convertedDuration = this.convertTime(player.duration);
				}
				this.isPlaying = true;
				this.updateStatuses("play");
			},
			pause() {
				var player = this.$refs.player;
				player.pause();
				this.isPlaying = false;
				this.updateStatuses("pause");
			},
			forward() {
				this.index++;
				if(this.index > this.songs.length - 1) {
					this.index = 0;
				}
				this.current = this.songs[this.index];
				this.play(this.current, this.index);
			},
			backward() {
				this.index--;
				if(this.index < 0) {
					this.index = this.songs.length - 1;
				}
				this.current = this.songs[this.index];
				this.play(this.current);
			},
			playAgain() {
				var player = this.$refs.player;
				if(player.loop) {
					player.loop = false;
					this.playingAgain = false;
				} else {
					player.loop = true;
					this.playingAgain = true;
				}
			},
			mute() {
				if(this.isPlaying) {
					var player = this.$refs.player;
					if(player.muted) {
						player.muted = false;
						this.volume = player.volume.toFixed(1);
					} else {
						player.muted = true;
						this.volume = 0;
					}
				}
			},
			updateVolume(type) {
				if(this.isPlaying) {
					var player = this.$refs.player;
					if(type == "decrease") {
						if(player.volume.toFixed(1) > 0) {
							player.volume = Number(player.volume) - Number(0.1);
							this.volume = player.volume.toFixed(1);
							player.muted = false;
						}
					} else if(type == "increase") {
						if(player.volume.toFixed(1) < 1) {
							player.volume = Number(player.volume) + Number(0.1);
							this.volume = player.volume.toFixed(1);
							player.muted = false;
						}
					} else {
						player.volume = this.volume;
						player.muted = false;
					}
				}
			},
			seek() {
				var player = this.$refs.player;
				if(player.src && this.isPlaying) {
					player.currentTime = this.playingTime;
					this.convertedPlayingTime = this.convertTime(this.playingTime);
				}
			},
			updateStatuses(type) {
				var statuses = document.querySelectorAll(".songStatus");
				statuses.forEach(status => {
					if(status.classList.contains("fa-pause")) {
						status.classList.remove("fa-pause");
						status.classList.add("fa-play");
					}
				});
				if(type == "play") {
					var currentStatus = document.getElementById("i_" + this.current.id);
					currentStatus.classList.remove("fa-play");
					currentStatus.classList.add("fa-pause");
				}
			},
			convertTime(time) {
				var hours = Math.floor(time / 3600);
				if(hours > 0 && hours < 10 ) {
					hours = "0" + hours;
				}
				var minutes = Math.floor((time % 3600) / 60);
				if(minutes < 10) {
					minutes = "0" + minutes;
				} 
				var seconds = Math.floor(time % 60);
				if(seconds < 10) {
					seconds = "0" + seconds;
				}
				var formattedTime = "";
				if(parseInt(hours) > 0) {
					formattedTime = hours + ":" + minutes + ":" + seconds;
				} else {
					formattedTime = minutes + ':' + seconds;
				}  
				return formattedTime;
			}
		},
		mounted() {
			this.getPlayer();
		},
		created() {
			this.artistId = this.$route.params.artistId;
			this.getSongs();
		}
	}
</script>

<style scoped>
	.playerIcon {
		margin-top: 20px;
		margin-bottom: 20px;
		text-align: center;
	}
	#playlist {
		margin: 0 auto;
		max-width: 500px;
		text-align: center;
	}
	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		padding-top: 30px;
		padding-bottom: 30px;
	}
	.btn:not(.btn-light) {
		margin-right: 10px;
	}
	.artist {
		margin-left: 5px;
	}
	.song {
		width: 100%;
		padding-top: 7px;
		padding-bottom: 7px;
		cursor: pointer;
		text-align: left;
	}
	.playingBar {
		margin-bottom: 10px;
	}
	#playingBar {
		height: 38px;
		-webkit-appearance: none;
		width: 100%;
	}
	#playingBar:focus {
		outline: none;
	}
	#playingBar::-webkit-slider-runnable-track {
		width: 100%;
		height: 10px;
		cursor: pointer;
		box-shadow: 1px 1px 1px #000000;
		background: #3071A9;
		border-radius: 5px;
		border: 1px solid #000000;
	}
	#playingBar::-webkit-slider-thumb {
		box-shadow: 1px 1px 1px #000000;
		border: 1px solid #000000;
		height: 30px;
		width: 15px;
		border-radius: 5px;
		background: #FFFFFF;
		cursor: pointer;
		-webkit-appearance: none;
		margin-top: -11px;
	}
	#playingBar:focus::-webkit-slider-runnable-track {
		background: #3071A9;
	}
	#playingBar::-moz-range-track {
		width: 100%;
		height: 10px;
		cursor: pointer;
		box-shadow: 1px 1px 1px #000000;
		background: #3071A9;
		border-radius: 5px;
		border: 1px solid #000000;
	}
	#playingBar::-moz-range-thumb {
		box-shadow: 1px 1px 1px #000000;
		border: 1px solid #000000;
		height: 30px;
		width: 15px;
		border-radius: 5px;
		background: #FFFFFF;
		cursor: pointer;
	}
	#playingBar::-ms-track {
		width: 100%;
		height: 10px;
		cursor: pointer;
		background: transparent;
		border-color: transparent;
		color: transparent;
	}
	#playingBar::-ms-fill-lower {
		background: #3071A9;
		border: 1px solid #000000;
		border-radius: 10px;
		box-shadow: 1px 1px 1px #000000;
	}
	#playingBar::-ms-fill-upper {
		background: #3071A9;
		border: 1px solid #000000;
		border-radius: 10px;
		box-shadow: 1px 1px 1px #000000;
	}
	#playingBar::-ms-thumb {
		margin-top: 1px;
		box-shadow: 1px 1px 1px #000000;
		border: 1px solid #000000;
		height: 30px;
		width: 15px;
		border-radius: 5px;
		background: #FFFFFF;
		cursor: pointer;
	}
	#playingBar:focus::-ms-fill-lower {
		background: #3071A9;
	}
	#playingBar:focus::-ms-fill-upper {
		background: #3071A9;
	}
</style>