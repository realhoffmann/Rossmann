import {createRouter, createWebHashHistory} from 'vue-router';
import WelcomePage from './views/WelcomePage.vue';
// Lazy-load the main dashboard views
const OverviewPage = () => import('./views/OverviewPage.vue');
const SalesPage = () => import('./views/SalesPage.vue');
const PromoPage = () => import('./views/PromoPage.vue');
const StoreTypesPage = () => import('./views/StoreTypesPage.vue');

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', redirect: '/welcome'},
        {path: '/welcome', name: 'welcome', component: WelcomePage},
        {path: '/overview', name: 'overview', component: OverviewPage},
        {path: '/sales', name: 'sales', component: SalesPage},
        {path: '/promo', name: 'promo', component: PromoPage},
        {path: '/store-types', name: 'storetypes', component: StoreTypesPage},
        {path: '/dashboard', name: 'dashboard', redirect: {name: 'overview'}},
        {path: '/:pathMatch(.*)*', redirect: '/welcome'},
    ],
});

export default router;
