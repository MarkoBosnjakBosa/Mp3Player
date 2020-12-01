import {createRouter, createWebHistory} from "vue-router";
import Home from "../views/Home.vue";
import Artists from "../views/Artists.vue";
import Songs from "../views/Songs.vue";
import Player from "../views/Player.vue";
import PageNotFound from "../views/PageNotFound.vue";

const routes = [
	{
		path: "/home",
		name: "Home",
		component: Home
	},
	{
		path: "/artists",
		name: "Artists",
		component: Artists
	},
	{
		path: "/songs",
		name: "Songs",
		component: Songs
	},
	{
		path: "/player/:artistId",
		name: "Player",
		component: Player
	},
	{
		path: "/:catchAll(.*)",
		name: "PageNotFound",
		component: PageNotFound
	}
]

const router = createRouter({history: createWebHistory(process.env.BASE_URL), routes});

export default router;
