import { fetchData } from './profile.js';
window.login = login;
window.logout = logout;

async function login() {
    const identifier = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const credentials = btoa(`${identifier}:${password}`);

    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `{ user { id } }`
            })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        console.log(response);

        const jwt = await response.json();
        localStorage.setItem('jwt', jwt);
        start();
        fetchData()
        

    } catch (error) {
        document.getElementById('error-message').innerText = error.message;
    }
}

function logout() {
    localStorage.removeItem('jwt');
    const body = document.getElementById('body');
    body.innerHTML = `
         <div id="login-section" class="login-container">
        <h1>Login</h1>
        <form onsubmit="event.preventDefault(); login();">
            <input type="text" id="username" placeholder="Username or Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <div id="error-message"></div>
    </div>
        `
}
function start() {
    const token = localStorage.getItem('jwt')
    if (token) {
        const body = document.getElementById('body');
        body.innerHTML = `
        <div id="profile-section" class="profile-container" >
        <header>
            <h1>Student Profile</h1>
            <button onclick="logout()" class="logout-btn">Logout</button>
        </header>
        <main>
           
            <section id="user-info" class="card">
                <h2>Basic Information</h2>
                <div id="user-details"></div>
            </section>
            <section id="Best-skills" class="card">
                <h2>Best skills</h2>
                <svg id="xp-graph" width="900" height="400"></svg>
              </section>
              
            <section id="audit-stats" class="card">
                <h2>Audit Statistics</h2>
                <svg id="audit-graph" width="700" height="400">
                    
                </svg>
            </section>
        </main>
    </div>
        `
    } else {
        const body = document.getElementById('body');
        body.innerHTML = `
         <div id="login-section" class="login-container">
        <h1>Login</h1>
        <form onsubmit="event.preventDefault(); login();">
            <input type="text" id="username" placeholder="Username or Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
            <div id="error-message"></div>
        </div>
        `
    }

}
start()
