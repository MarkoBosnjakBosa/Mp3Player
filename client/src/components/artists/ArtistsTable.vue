<template>
	<div id="artistsTable">
		<table class="table">
			<thead>
				<th scope="col">#</th>
				<th scope="col">Artist</th>
				<th scope="col">Actions</th>
			</thead>
			<tbody>
				<tr v-if="!artists.length">
					<td colspan="6" class="noArtists">No artists found!</td>
				</tr>
				<tr v-for="(artist, index) in artists" :key="artist._id">
					<th scope="row">{{++index}}</th>
					<td v-if="editing == artist._id"><input type="text" class="form-control" v-model="artist.name"/></td>
					<td v-else>{{artist.name}}</td>
					<td v-if="editing == artist._id" class="padded">
						<i class="far fa-check-circle" @click="editArtist(artist)"></i>
						<i class="far fa-times-circle" @click="disableEditing(artist)"></i>
					</td>
					<td v-else>
						<i class="fas fa-pencil-alt" @click="enableEditing(artist)"></i>
						<i class="fas fa-trash" @click="deleteArtist(artist._id)"></i>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		name: "artists-table",
		data() {
			return {
				editing: null
			}
		},
		props: {
			artists: Array
		},
		methods: {
			enableEditing(artist) { 
				this.cachedArtist = Object.assign({}, artist);
				this.editing = artist._id; 
			},
			disableEditing(artist) { 
				Object.assign(artist, this.cachedArtist);
				this.editing = null; 
			},
			editArtist(artist) {
				if(artist.name != "") {
					this.$emit("editartist", artist);
					this.editing = null;
				} else {
					return;
				}
			},
			deleteArtist(artistId) { this.$emit("deleteartist", artistId); },
		}
	}
</script>

<style scoped>
	#artistsTable {
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
	.noArtists {
		font-weight: bold;
		text-align: center;
		margin-top: 20px;
	}
</style>