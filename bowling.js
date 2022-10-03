import { h, createApp  } from 'vue';
import { usePlugins } from '../core/plugins';
import useRouter from '../core/router';
import routes from './routes';
import App from './App';


const app = createApp({
    render() {return h(App);},
});


usePlugins(app);
useRouter(app, routes);
app.mount('#game-app');
