<template>
	<div id="artistsForm">
		<form class="form-inline" autocomplete="off" @submit.prevent="createArtist()">
			<div class="form-group col-md-8">
				<input type="text" id="name" class="form-control" :class="{'errorField' : nameError}" placeholder="Artist" v-model="name" @focus="clearNameStatus()" @keypress="clearNameStatus()"/>
			</div>
			<div class="form-group col-md-4">
				<button type="submit" class="btn btn-primary">Save</button>
			</div>
		</form>
		<small v-if="nameError || (!returnedData.created && returnedData.errorFields.includes('name'))" class="form-text errorInput">Please provide a valid artist!</small>
		<small v-if="returnedData.alreadyExists" class="form-text errorInput">The artist already exists!</small>
		<div v-if="returnedData.created" class="form-group creationSuccessful">Your artist has been successfully created!</div>
	</div>
</template>

<script>
	export default {
		name: "artists-form",
		data() {
			return {
				nameError: false,
				name: ""
			}
		},
		props: {
			returnedData: Object
		},
		methods: {
			createArtist() {
				this.clearNameStatus();
				if(this.invalidName) {
					this.nameError = true;
					this.$emit("resetdata");
					return;
				}
				this.$emit("createartist", this.name);
				this.name = "";
				this.nameError = false;
			},
			clearNameStatus() { 
				this.nameError = false; 
				this.$emit("resetdata");
			}
		},
		computed: {
            invalidName() { return this.name === ""; },
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
	#name {
		width: 100%;
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