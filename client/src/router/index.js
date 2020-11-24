import {createRouter, createWebHistory} from "vue-router";
import Player from "../views/Player.vue";
import PageNotFound from "../views/PageNotFound.vue";

const routes = [
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
