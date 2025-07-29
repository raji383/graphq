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
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('profile-section').style.display = 'block';
        fetchData();
    } catch (error) {
        document.getElementById('error-message').innerText = error.message;
    }
}

function logout() {
    localStorage.removeItem('jwt');
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
}

