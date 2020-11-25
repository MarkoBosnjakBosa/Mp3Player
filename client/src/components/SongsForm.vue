<template>
	<div id="songsForm">
		<form autocomplete="off" @submit.prevent="uploadSong()" enctype="multipart/form-data">
			<div class="form-row">
				<div class="form-group col-md-6">
					<select id="author" class="form-control" :class="{'errorField' : authorError && submitting}" v-model="song.author" @focus="clearAuthorStatus()" @keypress="clearAuthorStatus()">
						<option value="" disabled selected>Select author...</option>
						<option value="Bon Jovi">Bon Jovi</option>
						<option value="Linkin Park">Linkin Park</option>
						<option value="ACDC">ACDC</option>
						<option value="Kiss">Kiss</option>
						<option value="Duran Duran">Duran Duran</option>
						<option value="other">Other</option>
					</select>
					<small v-if="(authorError && submitting) || (!returnedData.created && returnedData.errorFields.includes('author'))" class="form-text errorInput">Please provide a valid author!</small>
				</div>
                <div class="form-group col-md-6">
					<input type="file" id="file" class="inputFile" @change="selectFile($event)"/>
					<label for="file"><i class="fas fa-music"></i><span id="fileName">Choose a song</span></label>
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
				authorError: false,
				fileError: false,
				song: {
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
				this.clearAuthorStatus();
				this.clearFileStatus();
				var allowUpload = true;
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
				var formData = new FormData();
				formData.append("author", this.song.author);
				formData.append("file", this.song.file);
				this.$emit("uploadsong", formData);
				this.song = {author: "", file: ""};
				document.getElementById("file").value = "";
				document.getElementById("fileName").textContent = "Choose a song";
				this.authorError = false, this.fileError = false, this.submitting = false;
			},
			clearAuthorStatus() { this.authorError = false; },
			clearFileStatus() { this.fileError = false; },
			selectFile(event) {
				var files = event.target.files;
				var allowedExtensions = ["audio/mpeg"];
				if(files && files.length && allowedExtensions.includes(files[0].type)) {
					var file = files[0];
					var reader = new FileReader();
					this.song.file = file;
					document.getElementById("fileName").textContent = file.name;
					this.clearFileStatus();
					reader.readAsDataURL(file);
				} else {
					this.fileError = true;
				}
			},
			resetForm() {
				this.song = {author: "", file: ""};
				document.getElementById("file").value = "";
				document.getElementById("fileName").textContent = "Choose a song";
				this.authorError = false, this.fileError = false, this.submitting = false;
				this.$emit("resetdata");
			}
		},
		computed: {
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
	.inputFile {
		width: 0.1px;
		height: 0.1px;
		opacity: 0;
		overflow: hidden;
		position: absolute;
		z-index: -1;
	}
	.inputFile + label{
		width: 100%;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
		display: inline-block;
		overflow: hidden;
		padding: 5px;
		color: #808080;
		border: 2px solid #808080;
		border-radius: .25rem;
	}
	.inputFile:focus + label, .inputFile.has-focus + label, .inputFile + label:hover {
		outline: 1px dotted #000;
		outline: -webkit-focus-ring-color auto 5px;
		color: #000;
	}
	.inputFile + .fas.fa-music {
		width: 1em;
		height: 1em;
		vertical-align: middle;
		fill: currentColor;
		margin-top: -0.25em;
		margin-right: 0.25em;
	}
	#fileName {
		margin-left: 5px;
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