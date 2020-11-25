<template>
	<div id="songsTable">
		<table class="table">
			<thead>
				<th scope="col">#</th>
				<th scope="col">Title</th>
				<th scope="col">Author</th>
				<th scope="col">Actions</th>
				<th scope="col">
					<select id="filter" class="form-control" v-model="filter">
						<option value="all">All</option>
						<option value="bonJovi">Bon Jovi</option>
						<option value="linkinPark">Linkin Park</option>
						<option value="acdc">ACDC</option>
						<option value="kiss">Kiss</option>
						<option value="duranDuran">Duran Duran</option>
						<option value="other">Other</option>
					</select>
				</th>
			</thead>
			<tbody>
				<tr v-if="!filterByBand.length">
					<td colspan="6" class="noSongs">No songs found!</td>
				</tr>
				<tr v-for="(song, index) in filterByBand" :key="song._id">
					<th scope="row">{{++index}}</th>
					<td v-if="editing == song._id"><input type="text" class="form-control" v-model="song.title"/></td>
					<td v-else>{{song.title}}</td>
					<td v-if="editing == song._id">
					<select class="form-control" v-model="song.author">
						<option value="bonJovi">Bon Jovi</option>
						<option value="linkinPark">Linkin Park</option>
						<option value="acdc">ACDC</option>
						<option value="kiss">Kiss</option>
						<option value="duranDuran">Duran Duran</option>
						<option value="other">Other</option>
					</select>
					</td>
					<td v-else style="text-transform: capitalize">{{song.author}}</td>
					<td v-if="editing == song._id" class="padded">
						<i class="far fa-check-circle" @click="editSong(song)"></i>
						<i class="far fa-times-circle" @click="disableEditing(song)"></i>
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
	export default {
		name: "songs-table",
		data() {
			return {
				editing: null,
				filter: "all"
			}
		},
		props: {
			songs: Array
		},
		methods: {
			enableEditing(song) { 
				this.cachedSong = Object.assign({}, song);
				this.editing = song._id; 
			},
			disableEditing(song) { 
				Object.assign(song, this.cachedSong);
				this.editing = null; 
			},
			editSong(song) {
				if(song.title != "" && song.author != "" && song.file != "") {
					this.$emit("editsong", song);
					this.editing = null;
				} else {
					return;
				}
			},
			deleteSong(songId) { this.$emit("deletesong", songId); },
		},
		computed: {
			filterByBand() {
				if(this.filter == "bonJovi") {
					return this.songs.filter(song => song.author == "bonJovi");
				} else if(this.filter == "linkinPark") {
					return this.songs.filter(song => song.author == "linkinPark");
				} else if(this.filter == "acdc") {
					return this.songs.filter(song => song.author == "acdc");
				} else if(this.filter == "kiss") {
					return this.songs.filter(song => song.author == "kiss");
				} else if(this.filter == "duranDuran") {
					return this.songs.filter(song => song.author == "duranDuran");
				} else if(this.filter == "other") {
					return this.songs.filter(song => song.author == "other");
				} else {
					return this.songs;
				}
			}
		}
	}
</script>

<style scoped>
	#songsTable {
		max-width: 1200px;
		margin: 0 auto;
	}
	.far:not(.fa-clock), .fas {
		cursor: pointer;
		margin-right: 5px;
	}
	.padded {
		padding-top: 20px;
	}
	.fa-check-circle, .resolvedTask {
		color: #008000;
	}
	.fa-times-circle, .declinedTask {
		color: #ff0000;
	}
	.noSongs {
		font-weight: bold;
		text-align: center;
		margin-top: 20px;
	}
	#filter {
		width: 200px;
	}
</style>