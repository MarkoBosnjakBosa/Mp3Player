<template>
	<div id="player">
		<navigation></navigation>
		<div class="playerIcon">
            <i class="fas fa-headphones fa-7x"></i>
        </div>
		<div id="playerDiv">
			<h1 class="song-title">{{current.title}}</h1>
			<div class="controls">
				<button type="button" class="btn backward" @click="backward()"><i class="fas fa-backward"></i></button>
				<button type="button" class="btn play" v-if="!isPlaying" @click="play('')"><i class="fas fa-play"></i></button>
				<button type="button" class="btn pause" v-else @click="pause()"><i class="fas fa-pause"></i></button>
				<button type="button" class="btn forward" @click="forward()"><i class="fas fa-forward"></i></button>
				<input type="range" min="0" :max="duration" v-model="playingTime">
				{{duration}}
			</div>
			<div class="controls">
				<button type="button" class="btn" @click="changeVolume()"><i class="fas fa-forward"></i></button>
			</div>
			<div class="playlist">
				<h2>{{artist}}</h2>
				<ul class="list-group">
					<li v-for="song in songs" :key="song.id" class="list-group-item" @click="play(song)">
						<b><i :id="'i_' + song.id" class="songStatus fas fa-play"></i><span class="artist">{{song.title}}</span></b>
					</li>
				</ul>
				<!--<button v-for="song in songs" :key="song.src" @click="play(song)" :class="(song.src == current.src) ? 'song playing' : 'song'">
					{{ song.title }} - {{ song.artist }}
				</button>-->
			</div>
		</div>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	import Navigation from "@/components/Navigation.vue"; 
    var axios = require("axios");

	export default {
		name: "player",
		components: {
			Navigation
		},
		data() {
			return {
				artistId: "",
				artist: "",
				current: {},
				index: 0,
				isPlaying: false,
				songs: [],
				player: new Audio(),
				playingTime: 0,
				duration: "00:00"
			}
		},
		methods: {
			getSongs() {
				axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getSongsByArtist/" + this.artistId).then(response => {
					this.artist = response.data.artist;
					var songs = [];
					var uploadedSongs = response.data.songs;
					if(uploadedSongs.length) {
						uploadedSongs.forEach(song => {
							var songObject = {};
							songObject["id"] = song._id;
							songObject["title"] = song.title;
							songObject["artist"] = song.artistName;
							songObject["src"] = require("../assets/songs/" + song.path);
							songs.push(songObject);
						});
						this.songs = songs;
						this.current = this.songs[this.index];
						this.player.src = this.current.src;
					}
                }).catch(error => console.log(error));
			},
			play(song) {
				if(typeof song.src != "undefined") {
					this.current = song;
					this.player.src = this.current.src;
				}
				this.player.play();
				if(!isNaN(this.player.duration)) {
					this.duration = this.convertTime(this.player.duration);
				}
				var temp = this;
				this.player.addEventListener("loadedmetadata", function() {
					temp.duration = this.convertTime(this.player.duration);
				}.bind(this));
				this.player.addEventListener("timeupdate", function() {
					temp.playingTime = this.currentTime;
				});
				this.player.addEventListener("ended", function() {
					this.index++;
					if(this.index > this.songs.length - 1) {
						this.index = 0;
					}
					this.current = this.songs[this.index];
					this.play(this.current);
				}.bind(this));
				this.isPlaying = true;
				this.updateStatuses("play");
			},
			pause() {
				this.player.pause();
				this.isPlaying = false;
				this.updateStatuses("pause");
			},
			forward() {
				this.index++;
				if(this.index > this.songs.length - 1) {
					this.index = 0;
				}
				this.current = this.songs[this.index];
				this.play(this.current);
			},
			backward() {
				this.index--;
				if (this.index < 0) {
					this.index = this.songs.length - 1;
				}
				this.current = this.songs[this.index];
				this.play(this.current);
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
			changeVolume() {
				if(this.player.muted) {
					this.player.muted = false;
				} else {
					this.player.muted = true;
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
					seconds = "0" + minutes;
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
		watch: {
			playingTime (value) {
				this.playingTime = value;
			}
		},
		created() {
			this.artistId = this.$route.params.artistId;
			this.getSongs();
		}
	}
</script>

<style>
	.playerIcon {
		margin-top: 20px;
		margin-bottom: 20px;
        text-align: center;
	}
	#playerDiv {
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
	button:hover {
		opacity: 0.8;
		color: #fff !important;
	}
	.play, .pause {
		font-size: 20px;
		padding: 15px 25px;
		margin: 0px 15px;
		border-radius: 10px;
		color: #FFF;
		background-color: #CC2E5D;
	}
	.forward, .backward {
		font-size: 16px;
		padding: 10px 20px;
		margin: 0px 15px;
		border-radius: 10px;
		color: #FFF;
		background-color: #FF5858;
	}
.playlist .song {
  display: block;
  width: 100%;
  padding: 15px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}
.playlist .song:hover {
  color: #FF5858;
}
.playlist .song.playing {
  color: #FFF;
  background-image: linear-gradient(to right, #CC2E5D, #FF5858);
}
	.artist {
        margin-left: 5px;
    }
</style>