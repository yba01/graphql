import Router from "./router.js";
import API from "./useful.js";
export class Login extends HTMLElement {
    constructor() {
        super()
        this.Api = new API(this)
        this.Router = new Router()
    }
    connectedCallback() {
        this.renderHTML()
        this.setupLoginHandler();
    }
    renderHTML() {
        this.innerHTML = `
            <div class="login-container" id="login">
                <div class="top">
                    <header>Login</header>
                </div>
                <form method="post" id="loginForm">
                    <div class="input-box"> 
                        <input type="text" class="input-field" name="UsernameOrEmail" placeholder="Username or Email">
                        <i class="bx bx-user"></i>
                    </div>
                    <div class="input-box">
                        <input type="password" class="input-field" name="Password" placeholder="Password">
                        <i class="bx bx-lock"></i>
                    </div>
                    <div class="input-box">
                        <input type="submit" id="submit_login" class="submit" value="Sign In">
                    </div>                       
                </form>
            </div>
        `;
    }
    setupLoginHandler() {
        this.Api.checkUserInput('#loginForm',  (error, result) => {
            if (error) {
                console.error('Login Failed:', error);
            } else {
                localStorage.setItem('userData', JSON.stringify(result.data));
                this.Router.route("#home", true);

            }
    //         .then(result => {
    //                 localStorage.setItem('userData', JSON.stringify(result.data));
    //                 // Retrieve and check
    //                 const storedData = localStorage.getItem('userData');
    //                 console.log(storedData)
    //                 if (storedData) {
    //                     this.Router.route("#home", true);
    //                 } else {
    //                     console.error('Login failed');
    //                 }
    //         })
    //         .catch(error => {
    //             console.error('Login failed:', error);
    //         });
         })
    }
}
customElements.define('login-page', Login);