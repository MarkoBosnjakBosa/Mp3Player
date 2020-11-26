<template>
	<div id="artistsForm">
		<form class="form-inline" autocomplete="off" @submit.prevent="createArtist()">
			<div class="form-group col-md-8">
				<input type="text" id="artist" class="form-control" :class="{'errorField' : artistError}" placeholder="Artist" v-model="artist" @focus="clearArtistStatus()" @keypress="clearArtistStatus()"/>
			</div>
			<div class="form-group col-md-4">
				<button type="submit" class="btn btn-primary">Save</button>
				<button type="button" class="btn btn-danger resetForm" @click="resetForm()">Reset</button>
			</div>
		</form>
		<small v-if="(artistError) || (!returnedData.created && returnedData.errorFields.includes('artist'))" class="form-text errorInput">Please provide a valid artist!</small>
		<div v-if="returnedData.created" class="form-group creationSuccessful">Your artist has been successfully created!</div>
	</div>
</template>

<script>
	export default {
		name: "artists-form",
		data() {
			return {
				artistError: false,
				artist: ""
			}
		},
		props: {
			returnedData: Object
		},
		methods: {
			createArtist() {
				this.clearArtistStatus();
				if(this.invalidArtist) {
					this.artistError = true;
					this.$emit("resetdata");
					return;
				}
				this.$emit("createartist", this.artist);
				this.artist = "";
				this.artistError = false;
			},
			clearArtistStatus() { this.artistError = false; },
			resetForm() {
				this.artist = "";
				this.artistError = false;
				this.$emit("resetdata");
			}
		},
		computed: {
            invalidArtist() { return this.artist === ""; },
		},
	}
</script>

<style scoped>
	#artistsForm {
		margin: 0 auto;
		margin-bottom: 20px;
		max-width: 600px;
	}
	.col-md-8 {
		padding-right: 0px;
	}
	#artist {
		width: 100%;
	}
	.resetForm {
		margin-left: 10px;
	}
	.creationSuccessful {
		color: #008000;
		margin-bottom: 10px;
		padding-left: 15px;
	}
	.errorField {
		border: 1px solid #ff0000;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorInput {
		color: #ff0000;
		padding-left: 15px;
	}
</style>