<template>
	<div id="app" class="container-fluid">
		<h1>Songs</h1>
		<songs-form :returnedData="returnedData" @uploadsong="uploadSong" @resetdata="resetData"/>
		<songs-table :songs="songs" @editsong="editSong" @deletesong="deleteSong"/>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	import SongsTable from "../components/SongsTable.vue";
	import SongsForm from "../components/SongsForm.vue";
    var axios = require("axios");
    
	export default {
		name: "songs",
		components: {
			SongsTable,
			SongsForm
		},
        data() {
            return {
                songs: [],
                returnedData: {
                    uploaded: false,
                    errorFields: []
                }
            }
        },
        methods: {
            getSongs() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getSongs").then(response => {
                    this.songs = response.data.songs;
                }).catch(error => console.log(error));
            },
            uploadSong(formData) {
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
            editSong(updatedSong) {
                var body = {songId: updatedSong._id, title: updatedSong.title, author: updatedSong.author};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/editSong", body).then(response => {
                    if(response.data.edited) {
                        this.songs = this.songs.map(song => song._id == updatedSong._id ? updatedSong : song);
                    }
                }).catch(error => console.log(error));
            },
            deleteSong(songId) {
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
            this.getSongs();
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