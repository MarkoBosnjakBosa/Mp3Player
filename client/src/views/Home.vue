<template>
	<div id="home" class="container-fluid">
		<navigation></navigation>
		<div class="homeIcon">
            <i class="fas fa-list fa-7x"></i>
        </div>
        <div id="artistsList">
            <div v-if="!artists.length" class="noArtists">No artists found!</div>
            <ul class="list-group">
                <li v-for="artist in artists" :key="artist._id" class="list-group-item d-flex justify-content-between align-items-center" @click="openPlayer(artist._id)">
                    <b><i class="far fa-folder"></i><span class="artist">{{artist.name}}</span></b>
                    <i class="fas fa-arrow-right"></i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	import Navigation from "@/components/Navigation.vue"; 
    var axios = require("axios");
    
	export default {
		name: "home",
		components: {
			Navigation
		},
        data() {
            return {
                artists: []
            }
        },
        methods: {
            getArtists() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getArtists").then(response => {
                    this.artists = response.data.artists;
                }).catch(error => console.log(error));
            },
            openPlayer(artistId) {
                this.$router.push("/player/" + artistId);
            }
        },
        created() {
            this.getArtists();
        }
    }
</script>

<style scoped>
    .homeIcon {
		margin-top: 20px;
		margin-bottom: 20px;
        text-align: center;
	}
    #artistsList {
        margin: 0 auto;
        max-width: 500px;
    }
    .artist {
        margin-left: 5px;
    }
    .list-group-item {
        cursor: pointer;
    }
    .noArtists {
        text-align: center;
    }
</style>