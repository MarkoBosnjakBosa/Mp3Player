<template>
	<div id="artists" class="container-fluid">
		<h1>Artists</h1>
		<artists-form :returnedData="returnedData" @createartist="createArtist" @resetdata="resetData"/>
		<artists-table :artists="artists" @editartist="editArtist" @deleteartist="deleteArtist"/>
	</div>
</template>

<script>
	import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";
    import ArtistsForm from "../components/artists/ArtistsForm.vue";
	import ArtistsTable from "../components/artists/ArtistsTable.vue";
    var axios = require("axios");
    
	export default {
		name: "songs",
		components: {
            ArtistsForm,
			ArtistsTable
		},
        data() {
            return {
                artists: [],
                returnedData: {
                    created: false,
                    alreadyExists: false,
                    errorFields: []
                }
            }
        },
        methods: {
            getArtists() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getArtists").then(response => {
                    this.artists = response.data.artists;
                }).catch(error => console.log(error));
            },
            createArtist(name) {
                var body = {name: name};
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/createArtist", body).then(response => {
                    if(response.data.created) {
                        var newArtist = response.data.artist;
                        this.artists = [...this.artists, newArtist];
                        this.returnedData = response.data;
                    } else {
                        this.returnedData = response.data;
                    }
                }).catch(error => console.log(error));
            },
            editArtist(updatedArtist) {
                var body = {artistId: updatedArtist._id, name: updatedArtist.name};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/editArtist", body).then(response => {
                    if(response.data.edited) {
                        this.artists = this.artists.map(artist => artist._id == updatedArtist._id ? updatedArtist : artist);
                    }
                }).catch(error => console.log(error));
            },
            deleteArtist(artistId) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/deleteArtist/" + artistId).then(response => {
                    if(response.data.deleted) {
                        this.artists = this.artists.filter(artist => artist._id != artistId);
                    }
                }).catch(error => console.log(error));
            },
            resetData() {
                var reset = {uploaded: false, alreadyExists: false, errorFields: []};
                this.returnedData = reset;
            }
        },
        created() {
            this.getArtists();
        }
    }
</script>

<style>
	h1 {
		text-align: center;
		margin-top: 20px;
		margin-bottom: 20px;
	}
</style>