

let allIssues = [];

// 1. Login Part..........
function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === "admin" && pass === "admin123") {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        fetchAllIssues(); 
    } else {
        alert("Invalid Username or Password");
    }
}

