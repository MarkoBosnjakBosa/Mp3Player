<template>
	<div id="songsForm">
		<form autocomplete="off" @submit.prevent="uploadSong()">
			<div class="form-row">
				<div class="form-group col-md-4">
					<input type="text" id="title" class="form-control" :class="{'errorField' : titleError && submitting}" placeholder="Title" v-model="song.title" ref="first" @focus="clearTitleStatus()" @keypress="clearTitleStatus()"/>
					<small v-if="(titleError && submitting) || (!returnedData.created && returnedData.errorFields.includes('title'))" class="form-text errorInput">Please provide a valid title!</small>
				</div>
				<div class="form-group col-md-4">
					<input type="text" id="author" class="form-control" :class="{'errorField' : authorError && submitting}" placeholder="Author" v-model="song.author" @focus="clearAuthorStatus()" @keypress="clearAuthorStatus()"/>
					<small v-if="(authorError && submitting) || (!returnedData.created && returnedData.errorFields.includes('author'))" class="form-text errorInput">Please provide a valid author!</small>
				</div>
                <div class="form-group col-md-4">
					<input type="file" id="file" class="form-control" :class="{'errorField' : fileError && submitting}" @focus="clearFileStatus()" @keypress="clearFileStatus()"/>
					<small v-if="(fileError && submitting) || (!returnedData.created && returnedData.errorFields.includes('file'))" class="form-text errorInput">Please provide a valid file!</small>
				</div>
			</div>
			<div v-if="returnedData.created" class="form-group uploadSuccessful">Your song has been successfully uploaded!</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">Upload</button>
				<button type="button" class="btn btn-danger resetForm" @click="resetForm()">Reset</button>
			</div>
		</form>
	</div>
</template>

<script>
	export default {
		name: "songs-form",
		data() {
			return {
				submitting: false,
				titleError: false,
				authorError: false,
				fileError: false,
				song: {
					title: "",
					author: "",
					file: ""
				}
			}
		},
		props: {
			returnedData: Object
		},
		methods: {
			uploadSong() {
				this.submitting = true;
				this.clearTitleStatus();
				this.clearAuthorStatus();
				this.clearFileStatus();
				var allowUpload = true;
				if(this.invalidTitle) {
					this.titleError = true;
					allowUpload = false;
				}
				if(this.invalidAuthor) {
					this.authorError = true;
					allowUpload = false;
				}
				if(this.invalidFile) {
					this.fileError = true;
					allowUpload = false;
				}
				if(!allowUpload) {
					this.$emit("resetdata");
					return;
				}
				this.$emit("createsong", this.song);
				this.$refs.first.focus();
				this.song = {title: "", author: "", file: ""};
				this.titleError = false, this.authorError = false, this.fileError = false, this.submitting = false;
			},
			clearTitleStatus() { this.titleError = false; },
			clearAuthorStatus() { this.authorError = false; },
			clearFileStatus() { this.fileError = false; },
			resetForm() {
				this.song = {title: "", author: "", file: ""};
				this.titleError = false, this.authorError = false, this.fileError = false, this.submitting = false;
				this.$emit("resetdata");
			}
		},
		computed: {
			invalidTitle() { return this.song.title === ""; },
            invalidAuthor() { return this.song.author === ""; },
            invalidFile() { return this.song.file === ""; }
		},
	}
</script>

<style scoped>
	#songsForm {
		max-width: 800px;
		margin: 0 auto;
		margin-bottom: 20px;
	}
	.resetForm {
		margin-left: 10px;
	}
	.uploadSuccessful {
		color: #008000;
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