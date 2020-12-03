<template>
	<div id="artists" class="container-fluid">
        <navigation></navigation>
        <div class="artistsIcon">
            <i class="far fa-folder fa-7x"></i>
        </div>
        <div id="artistsForm">
            <form autocomplete="off" @submit.prevent="createArtist()">
                <div class="form-group">
                    <input type="text" id="name" class="form-control" :class="{'errorField' : nameError && submitting}" placeholder="Name" v-model="artist.name" ref="first" @focus="clearNameStatus()" @keypress="clearNameStatus()"/>
                    <small v-if="nameError && submitting" class="form-text errorInput">Please provide a valid name!</small>
                </div>
                <div class="form-group">
                    <input type="text" id="folder" class="form-control" :class="{'errorField' : folderError && submitting}" placeholder="Folder" v-model="artist.folder" @focus="clearFolderStatus()" @keypress="clearFolderStatus()"/>
                    <small v-if="folderError && submitting" class="form-text errorInput">Please provide a valid folder!</small>
                </div>
                <div v-if="alreadyExists == 'name'" class="form-group creationFailed">The name already exists!</div>
                <div v-if="alreadyExists == 'folder'" class="from-group creationFailed">The folder already exists!</div>
                <div v-if="artistCreated" class="form-group creationSuccessful">The artist has been successfully added!</div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Add</button>
                    <button type="button" class="btn btn-danger resetForm" @click="resetForm()">Reset</button>
                </div>
            </form>
        </div>
        <table id="artistsTable" class="table">
            <thead>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Folder</th>
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
                    <td v-if="editing == artist._id" class="padded">{{artist.folder}}</td>
                    <td v-else>{{artist.folder}}</td>
                    <td v-if="editing == artist._id" class="padded">
                        <i class="far fa-check-circle editArtist" @click="editArtist(artist)"></i>
                        <i class="far fa-times-circle disableEditing" @click="disableEditing(artist)"></i>
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
	import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navigation from "@/components/Navigation.vue"; 
    var axios = require("axios");
    
	export default {
        name: "artists",
        components: {
			Navigation
		},
        data() {
            return {
                artists: [],
                submitting: false,
                nameError: false,
                folderError: false,
                artist: {
                    name: "",
                    folder: ""
                },
                artistCreated: false,
                alreadyExists: false,
                editing: null
            }
        },
        methods: {
            getArtists() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getArtists").then(response => {
                    this.artists = response.data.artists;
                }).catch(error => console.log(error));
            },
            createArtist() {
                this.submitting = true;
                this.clearNameStatus();
                this.clearFolderStatus();
                var allowSubmit = true;
                if(this.invalidName) {
                    this.nameError = true;
                    allowSubmit = false;
                }
                if(this.invalidFolder) {
                    this.folderError = true;
                    allowSubmit = false;
                }
                if(!allowSubmit) {
                    this.alreadyExists = "";
                    this.artistCreated = false;
                    return;
                }
                var body = {name: this.artist.name, folder: this.artist.folder};
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/createArtist", body).then(response => {
                    if(response.data.created) {
                        var newArtist = response.data.artist;
                        this.artists = [...this.artists, newArtist];
                        this.artistCreated = true;
                        this.$refs.first.focus();
                        this.artist = {name: "", folder: ""};
                        this.alreadyExists = "";
                        this.nameError = false, this.folderError = false, this.publicSubmitting = false;
                    } else {
						if(response.data.alreadyExists) {
							this.alreadyExists = response.data.field;
							this.artistCreated = false;
						} else {
							var errorFields = response.data.errorFields;
							if(errorFields.includes("name")) this.nameError = true;
							if(errorFields.includes("folder")) this.folderError = true;
							this.alreadyExists = "";
							this.artistCreated = false;
						}
					}
                }).catch(error => console.log(error));
            },
            enableEditing(artist) {
                this.cachedArtist = Object.assign({}, artist);
                this.editing = artist._id;
            },
            disableEditing(artist) {
                Object.assign(artist, this.cachedArtist);
                this.editing = null;
            },
            editArtist(updatedArtist) {
                if(updatedArtist.name != "") {
                    var body = {artistId: updatedArtist._id, name: updatedArtist.name};
                    axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/editArtist", body).then(response => {
                        if(response.data.edited) {
                            this.artists = this.artists.map(artist => artist._id == updatedArtist._id ? updatedArtist : artist);
                            this.editing = null;
                        }
                    }).catch(error => console.log(error));
                } else {
                    return;
                }
            },
            deleteArtist(artistId) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/deleteArtist/" + artistId).then(response => {
                    if(response.data.deleted) {
                        this.artists = this.artists.filter(artist => artist._id != artistId);
                    }
                }).catch(error => console.log(error));
            },
            resetForm() {
                this.artist = {name: "", folder: ""};
                this.alreadyExists = "";
				this.nameError = false, this.folderError = false, this.artistCreated = false, this.submitting = false;
            },
            clearNameStatus() { this.nameError = false; },
			clearFolderStatus() { this.folderError = false; },
        },
        computed: {
			invalidName() { return this.artist.name === ""; },
			invalidFolder() { 
                var folderFormat = /^[a-z0-9_.]*$/;
				if(this.artist.folder != "" && folderFormat.test(this.artist.folder)) {
                    console.log(1);
					return false;
				} else {
                    console.log(2);
					return true;
                }
            }
		},
        created() {
            this.getArtists();
        }
    }
</script>

<style scoped>
    .artistsIcon {
		margin-top: 20px;
		margin-bottom: 20px;
        text-align: center;
	}
    #artistsForm {
        margin: 0 auto;
        max-width: 500px;
    }
    #artistsTable {
        margin: 0 auto;
        max-width: 1000px;
    }
    tbody .fas, tbody .far {
        cursor: pointer;
        margin-right: 5px;
    }
    .padded {
        padding-top: 20px;
    }
    .editArtist {
        color: #008000;
    }
    .disableEditing {
        color: #ff0000;
    }
    .noArtists {
        text-align: center;
    }
    .resetForm {
		margin-left: 10px;
	}
    .creationSuccessful {
        color: #008000;
        margin-bottom: 10px;
    }
    .creationFailed {
		color: #ff0000;
		margin-bottom: 10px;
	}
    .errorField {
        border: 1px solid #ff0000;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
    }
    .errorInput {
        color: #ff0000;
    }
</style>