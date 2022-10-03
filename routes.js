/* global require */

const requireScreens = require.context('./pages', false, /[a-z]\w+(.vue)$/);

const PATHNAME = `/game/bowling/`;
//const routes = [{
//        path: `${PATHNAME}home`,
//        name: 'home',
//        component: () => import ('./pages/Home')
//},{
//        path: `${PATHNAME}settings`,
//        name: 'settings',
//        component: () => import ('./pages/Settings')
//},{
//        path: `${PATHNAME}tutorial`,
//        name: 'tutorial',
//        component: () => import ('./pages/Tutorial')
//},{
//        path: `${PATHNAME}game`,
//        name: 'game',
//        component: () => import ('./pages/Game')
//}];
const routes = [];
    requireScreens.keys().forEach(name => {
        
        const screen = requireScreens(name);
        const screenName = name.toLowerCase().substring(2, name.indexOf('.vue'));
        routes.push({
            path: `${PATHNAME}${(screen.default.path || screenName)}`,
            name: screenName,
            component: screen.default
        });
    });
    
    
export default routes;