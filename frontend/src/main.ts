import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Ripple from 'primevue/ripple';
import ToastService from 'primevue/toastservice';
import {createPinia} from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import router from './router';
import {useSettingsStore} from './stores/settings';

import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Divider from 'primevue/divider';
import Menubar from 'primevue/menubar';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Checkbox from 'primevue/checkbox';
import Card from 'primevue/card';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './style.css';
import App from './App.vue';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Ensure Pinia is active before router guards use stores
app.use(pinia);

const settings = useSettingsStore(pinia);
router.beforeEach((to, _from, next) => {
    if (to.name !== 'welcome' && !settings.datasetMode) {
        next({name: 'welcome'});
        return;
    }
    next();
});

app.use(PrimeVue, {
    ripple: true,
    theme: {preset: Aura},
});
app.use(ToastService);
app.use(router);
app.directive('ripple', Ripple);

app.component('Select', Select);
app.component('MultiSelect', MultiSelect);
app.component('InputText', InputText);
app.component('DatePicker', DatePicker);
app.component('Panel', Panel);
app.component('Button', Button);
app.component('Chip', Chip);
app.component('Divider', Divider);
app.component('Menubar', Menubar);
app.component('Tag', Tag);
app.component('ProgressBar', ProgressBar);
app.component('Checkbox', Checkbox);
app.component('Card', Card);

app.mount('#app');
