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
                    uploaded: false,
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
            createArtist(formData) {
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/uploadSong", formData).then(response => {
                    var returnedData = {};
                    if(response.data.uploaded) {
                        var newSong = response.data.song;
                        this.songs = [...this.songs, newSong];
                        returnedData = {created: true, errorFields: []};
                        this.returnedData = returnedData;
                    } else {
                        returnedData = {uploaded: false, errorFields: response.data.errorFields};
                        this.returnedData = returnedData;
                    }
                }).catch(error => console.log(error));
            },
            editArtist(updatedSong) {
                var body = {songId: updatedSong._id, title: updatedSong.title, author: updatedSong.author};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/editSong", body).then(response => {
                    if(response.data.edited) {
                        this.songs = this.songs.map(song => song._id == updatedSong._id ? updatedSong : song);
                    }
                }).catch(error => console.log(error));
            },
            deleteArtist(songId) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/deleteSong/" + songId).then(response => {
                    if(response.data.deleted) {
                        this.songs = this.songs.filter(song => song._id != songId);
                    }
                }).catch(error => console.log(error));
            },
            resetData() {
                var reset = {uploaded: false, errorFields: []};
                this.returnedData = reset;
            }
        },
        created() {
            //this.getArtists();
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