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
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        
        const data = await response.json();
        localStorage.setItem('jwt', data.jwt);
        window.location.href = 'profile.html';
    } catch (error) {
        document.getElementById('error-message').innerText = error.message;
    }
}

function logout() {
    localStorage.removeItem('jwt');
    window.location.href = 'index.html';
}