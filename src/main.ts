import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import App from "./App.vue";
import router from "./router";
import "./assets/css/main.css";

const app = createApp(App);

app.use(router);
app.use(createHead());

app.mount("#app");
