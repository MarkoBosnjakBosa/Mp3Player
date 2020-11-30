<template>
    <div id="home" class="container-fluid">
        <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div id="navbarOptions" class="collapse navbar-collapse">
                <ul class="navbar-nav ml-auto mt-2 mt-lg-0 mx-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#" @click="openHome()">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" @click="openSongs()">Songs</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" @click="openArtists()">Artists</a>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
    export default {
        name: "navigation",
        methods: {
            openHome() {
                this.$router.push("/home");
            },
            openSongs() {
                this.$router.push("/songs");
            },
            openArtists() {
                this.$router.push("/artists");
            }
        }
    }
</script>