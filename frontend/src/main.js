import { createApp } from 'vue';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import App from './App.vue';
import router from '@/router/index.js';
import '@/tailwind.css';
import '@mdi/font/css/materialdesignicons.css';
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi', // Use Material Design Icons
    },
});
const app = createApp(App);
app.use(router);  // Use Vue Router
app.use(vuetify); // Use Vuetify
app.use(Toast,{
    position : POSITION.TOP_RIGHT,
    timeout : 5000
})
app.mount('#app'); // Mount the app to the DOM

