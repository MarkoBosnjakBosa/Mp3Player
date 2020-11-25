import {createRouter, createWebHistory} from "vue-router";
import Songs from "../views/Songs.vue";
import Player from "../views/Player.vue";
import PageNotFound from "../views/PageNotFound.vue";

const routes = [
	{
		path: "/songs",
		name: "Songs",
		component: Songs
	},
	{
		path: "/player",
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
