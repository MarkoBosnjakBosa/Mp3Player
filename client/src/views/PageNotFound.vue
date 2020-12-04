<template>
    <div id="overview" class="container-fluid">
        <div class="container pageNotFoundDiv">
            <div class="alert alert-danger" role="alert">Page not found!</div>
            <button type="button" class="btn btn-info" @click="openHome()">Proceed to MP3 Player <i class="fas fa-music"></i></button>
        </div>
    </div>
</template>

<script>
    import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";
    
    export default {
        name: "pageNotFound",
        methods: {
            openHome() {
                this.$router.push("/home");
            }
        }
    }
</script>

<style scoped>
    .pageNotFoundDiv {
        margin: 0 auto;
        max-width: 400px;
        text-align: center;
        margin-top: 20px;
    }
</style>