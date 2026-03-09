

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

// 3. Cards 
function renderIssues(data) {
    const container = document.getElementById('issue-container');
    const countDisplay = document.getElementById('count-display');
    
    container.innerHTML = ""; 
    countDisplay.innerText = data.length;

    data.forEach(issue => {
        
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

// 4. Tab Filtering
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
    const modal = document.getElementById('issue_modal');
    const content = document.getElementById('modal-content');
    
        modal.showModal();
    content.innerHTML = '<div class="py-20 text-center"><span class="loading loading-spinner loading-lg text-indigo-600"></span></div>';

    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const result = await response.json();
        const issue = result.data;
        
        content.innerHTML = `
            <div class="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div class="flex items-center gap-5 mb-12">
                    <span class="px-8 py-2.5 rounded-full ${issue.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'} text-[12px] font-black uppercase tracking-[0.2em] border-2 border-white shadow-sm">${issue.status}</span>
                    <span class="text-[11px] font-bold text-slate-300 uppercase tracking-widest">ID: ${issue._id}</span>
                </div>
                
                <h3 class="font-[1000] text-5xl text-slate-900 mb-10 tracking-tighter leading-[1.1]">${issue.title}</h3>
                
                <div class="flex gap-4 mb-14">
                    <span class="px-6 py-3 bg-red-50 text-red-500 text-[11px] font-black rounded-2xl uppercase border border-red-100 tracking-widest">${issue.priority}</span>
                    <span class="px-6 py-3 bg-indigo-50 text-indigo-500 text-[11px] font-black rounded-2xl uppercase border border-indigo-100 tracking-widest">${issue.label}</span>
                </div>
                
                <div class="p-14 bg-slate-50 rounded-[40px] border border-slate-100 text-slate-600 text-[19px] leading-[1.8] mb-14 shadow-inner italic font-medium">
                    "${issue.description}"
                </div>
                
                <div class="grid grid-cols-2 gap-16 border-t pt-14 border-slate-100">
                    <div>
                        <p class="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-3">Reporter</p>
                        <p class="font-black text-slate-900 text-3xl tracking-tight">${issue.author}</p>
                    </div>
                    <div>
                        <p class="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-3">Posted On</p>
                        <p class="font-black text-slate-900 text-3xl tracking-tight">${new Date(issue.createdAt).toDateString()}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching single issue:", error);
        content.innerHTML = `<h2 class="text-3xl font-black text-red-500 text-center py-20 uppercase">Failed to Load</h2>`;
    }
}
// Search Functionality
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