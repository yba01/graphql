export default class Router extends HTMLElement {
    constructor() {
        super();

        this.routes = [
            // Other routes...
            {
                name: 'dashboard-page',
                path: './dashboard.js',
                regExp: new RegExp(/^#home$/)
            },
            {
                name: 'login-page',
                path: './login.js',
                regExp: new RegExp(/^$/)
            }
        ];

        this.hashChangeListener = event => this.route(location.hash, false, event.newURL === event.oldURL);
    }

    connectedCallback() {

        self.addEventListener('hashchange', this.hashChangeListener);
        this.route("" , true)

    }

    disconnectedCallback() {
        self.removeEventListener('hashchange', this.hashChangeListener);
    }

    route(hash, replace = false, isUrlEqual = true) {
        const jwt = localStorage.getItem("jwt");
        if (jwt) {
            if (hash === ""){
                hash = "#home";
            }
        } else {
            if (hash === "#home"){
                hash = "";
            }
        }

        if (location.hash !== hash) {
            if (replace) return location.replace(hash);
            return (location.hash = hash);
        }

        let router;
        // Find the correct route or throw an error
        if (!(router = this.routes.find(route => route.regExp.test(hash)))) {
            this.renderNotFound();
            return;
        }

        // Reuse route.component, if already set, otherwise import and define custom element
        (router.component ? Promise.resolve(router.component) : import(router.path).then(module => {
            // Don't define already existing customElements
            if (!customElements.get(router.name)) customElements.define(router.name, module.default);
            // Save it to router object for reuse. Grab child if it already exists.
            return (router.component = this.children && this.children[0] && this.children[0].tagName === router.name.toUpperCase() ? this.children[0] : document.createElement(router.name));
        })).then(component => {
            if (this.shouldComponentRender(router.name, isUrlEqual)) {
                this.render(component);
            }
        }).catch(error => {
            console.log(error);
            console.warn('Router did not find:', router) || error;
        });
    }

    // route(hash, replace = false, isUrlEqual = true) {
    //     // Retrieve JWT from localStorage
    //     const jwt = localStorage.getItem("jwt");
        
    //     // Adjust hash based on JWT presence
    //     if (jwt && hash === "") {
    //         hash = "#home";
    //     } else if (!jwt && hash === "#home") {
    //         hash = "";
    //     }
    //     console.log(hash)
    //     console.log(location.hash)
    //     // Check if the current hash needs to be updated
    //     if (location.hash !== hash) {
    //         replace ? location.replace(hash) : location.hash = hash;
    //         return;
    //     }
    //     console.log(hash)
    //     console.log(location.hash)
    //     // Find the corresponding route or render a 404 page
    //     const route = this.routes.find(way => way.regExp.test(hash));
    //     if (!route) {
    //         this.renderNotFound();
    //         return;
    //     }
    
    //     // Define and render the component
    //     this.loadComponent(route).then(component => {
    //         if (this.shouldComponentRender(route.name, isUrlEqual)) {
    //             this.render(component);
    //         }
    //     }).catch(error => {
    //         console.warn('Error loading component:', error);
    //     });
    // }
    
    // async loadComponent(route) {
    //     if (route.component) {
    //         return Promise.resolve(route.component);
    //     }
        
    //     return import(route.path).then(module => {
    //         const componentName = route.name.toUpperCase();
    //         if (typeof module.default === 'function') {
    //             if (!customElements.get(componentName)) {
    //                 customElements.define(componentName, module.default);
    //             }
    //         }
    
    //         // Save and reuse the component
    //         const existingChild = this.children && this.children[0] && this.children[0].tagName === componentName;
    //         route.component = existingChild ? this.children[0] : document.createElement(componentName);
    //         return route.component;
    //     });
    // }
    

    shouldComponentRender(name, isUrlEqual = true) {
        if (!this.children || !this.children.length) return true;
        return !isUrlEqual || this.children[0].tagName !== name.toUpperCase();
    }

    render(component) {
        // clear previous content
        this.innerHTML = '';
        this.appendChild(component);
    }

    renderNotFound() {
        // Implement your custom logic to render a "Not Found" component
        this.innerHTML = `<h1>404: Not Found</h1>`; // Example
    }
}

customElements.define('web-components', Router);