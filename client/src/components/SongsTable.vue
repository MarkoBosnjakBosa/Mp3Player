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
						<option value="all" selected>All</option>
						<option value="resolved">Resolved</option>
						<option value="declined">Declined</option>
						<option value="processing">In process</option>
						<option value="top">Top priority</option>
						<option value="medium">Medium priority</option>
						<option value="low">Low priority</option>
					</select>
				</th>
			</thead>
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
			filterByTerm() {
				if(this.filter == "resolved") {
					return this.tasks.filter(task => task.resolved == "yes");
				} else if(this.filter == "declined") {
					return this.tasks.filter(task => task.resolved == "no");
				} else if(this.filter == "processing") {
					return this.tasks.filter(task => task.resolved == "processing");
				} else if(this.filter == "top") {
					return this.tasks.filter(task => task.priority == "top");
				} else if(this.filter == "medium") {
					return this.tasks.filter(task => task.priority == "medium");
				} else if(this.filter == "low") {
					return this.tasks.filter(task => task.priority == "low");
				} else {
					return this.tasks;
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
	.noTasks {
		font-weight: bold;
		text-align: center;
		margin-top: 20px;
	}
	#filter {
		width: 200px;
	}
</style>