// Global variable to store current issues for filtering
let allIssues = [];

// 1. Handle Login
function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === "admin" && pass === "admin123") {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        fetchAllIssues(); // Initial API call
    } else {
        alert("Invalid Username or Password");
    }
}

// 2. Fetch All Issues from API
async function fetchAllIssues() {
    showLoading();
    try {
        const response = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const data = await response.json();
        allIssues = data.data; // Storing API response
        renderIssues(allIssues);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// 3. Render Cards with Challenge Border
function renderIssues(data) {
    const container = document.getElementById('issue-container');
    const countDisplay = document.getElementById('count-display');
    
    container.innerHTML = ""; 
    countDisplay.innerText = data.length;

    data.forEach(issue => {
        // CHALLENGE: Border logic based on status
        const borderColor = issue.status === 'open' ? 'border-t-green-500' : 'border-t-purple-500';
        
        const card = document.createElement('div');
        card.className = `card bg-base-100 shadow-md border border-gray-200 border-t-4 ${borderColor} cursor-pointer hover:shadow-lg transition-all`;
        card.onclick = () => fetchSingleIssue(issue._id); // Using API ID
        
        card.innerHTML = `
            <div class="card-body p-4">
                <div class="flex justify-between items-start mb-2">
                    <span class="badge badge-sm badge-outline uppercase">${issue.label}</span>
                    <span class="badge badge-xs ${getPriorityClass(issue.priority)}">${issue.priority}</span>
                </div>
                <h2 class="card-title text-sm font-bold line-clamp-1">${issue.title}</h2>
                <p class="text-xs text-gray-500 mb-4 line-clamp-2">${issue.description}</p>
                <div class="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                    <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
                    <span class="font-bold text-gray-600 underline">${issue.author}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 4. Tab Filtering with API Data
function filterIssues(status, btn) {
    updateTabUI(btn);
    showLoading();

    setTimeout(() => {
        const filtered = status === 'all' 
            ? allIssues 
            : allIssues.filter(i => i.status === status);
        renderIssues(filtered);
    }, 300);
}

// 5. Fetch Single Issue for Modal
async function fetchSingleIssue(id) {
    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const result = await response.json();
        const issue = result.data;
        
        const content = document.getElementById('modal-content');
        content.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <span class="badge ${issue.status === 'open' ? 'badge-success' : 'badge-secondary'} text-white text-xs capitalize">${issue.status}</span>
                <span class="text-xs text-gray-400">#${issue._id}</span>
            </div>
            <h3 class="font-bold text-2xl mb-4">${issue.title}</h3>
            <p class="py-4 text-gray-600 leading-relaxed border-t border-b mb-4">${issue.description}</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><p class="text-gray-400">Author</p> <p class="font-bold">${issue.author}</p></div>
                <div><p class="text-gray-400">Priority</p> <span class="badge badge-warning">${issue.priority}</span></div>
            </div>
        `;
        document.getElementById('issue_modal').showModal();
    } catch (error) {
        console.error("Error fetching single issue:", error);
    }
}

// Helper: Search Functionality
async function handleSearch(searchText) {
    if(!searchText) {
        renderIssues(allIssues);
        return;
    }
    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`);
        const data = await response.json();
        renderIssues(data.data);
    } catch (error) {
        console.error("Search failed:", error);
    }
}

// UI Helpers
function showLoading() {
    document.getElementById('issue-container').innerHTML = '<div class="col-span-full flex justify-center py-20"><span class="loading loading-spinner loading-lg text-indigo-600"></span></div>';
}

function getPriorityClass(priority) {
    if(priority === 'High') return 'badge-error';
    if(priority === 'Medium') return 'badge-warning';
    return 'badge-ghost';
}

function updateTabUI(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('btn-active', 'bg-indigo-600', 'text-white');
        b.classList.add('bg-white', 'text-gray-600');
    });
    btn.classList.add('btn-active', 'bg-indigo-600', 'text-white');
}