// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const formError = document.getElementById('form-error');
const userGreeting = document.getElementById('user-greeting');

// Job DOM Elements
const jobForm = document.getElementById('job-form');
const jobCompany = document.getElementById('job-company');
const jobPosition = document.getElementById('job-position');
const jobStatus = document.getElementById('job-status');
const editJobId = document.getElementById('edit-job-id');
const jobFormMsg = document.getElementById('job-form-msg');
const submitJobBtn = document.getElementById('submit-job-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const jobsContainer = document.getElementById('jobs-container');
const jobCount = document.getElementById('job-count');

// State
const API_URL = '/api/v1';
let currentToken = localStorage.getItem('token');
let currentUserName = localStorage.getItem('userName');

// Initialization
function init() {
    if (currentToken && currentUserName) {
        showDashboard();
    } else {
        showAuth();
    }
}

// ---------------------------------
// UI Navigation
// ---------------------------------
function showAuth() {
    authView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    document.title = "Jobs API - Login";
}

function showDashboard() {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    userGreeting.innerHTML = `Welcome, <span style="color:var(--primary)">${currentUserName}</span>`;
    document.title = "Dashboard - Jobs API";
    fetchJobs();
}

function switchAuthTab(type) {
    formError.classList.add('hidden');
    if (type === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function showMessage(element, message, isError = true) {
    element.textContent = message;
    element.className = isError ? 'error-msg' : 'success-msg';
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 4000);
}

// ---------------------------------
// Event Listeners for UI
// ---------------------------------
tabLogin.addEventListener('click', () => switchAuthTab('login'));
tabRegister.addEventListener('click', () => switchAuthTab('register'));
document.getElementById('logout-btn').addEventListener('click', logout);
cancelEditBtn.addEventListener('click', resetJobForm);

// ---------------------------------
// Auth Logic (Login / Reg / Logout)
// ---------------------------------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = 'Connecting... <i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            handleLoginSuccess(data.token, data.user.name);
        } else {
            showMessage(formError, data.msg || 'Login failed');
            btn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right ml-2"></i>';
        }
    } catch (error) {
        showMessage(formError, 'Network error. Please try again later.');
        btn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right ml-2"></i>';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = 'Creating... <i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('register-name').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            handleLoginSuccess(data.token, data.user.name);
        } else {
            showMessage(formError, data.msg || 'Registration failed');
            btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus ml-2"></i>';
        }
    } catch (error) {
        showMessage(formError, 'Network error. Please try again later.');
        btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus ml-2"></i>';
    }
});

function handleLoginSuccess(token, name) {
    currentToken = token;
    currentUserName = name;
    localStorage.setItem('token', token);
    localStorage.setItem('userName', name);
    
    // Clear forms
    loginForm.reset();
    registerForm.reset();
    document.querySelectorAll('.auth-form button').forEach(btn => {
        if(btn.closest('#login-form')) btn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right ml-2"></i>';
        if(btn.closest('#register-form')) btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus ml-2"></i>';
    });
    
    showDashboard();
}

function logout() {
    currentToken = null;
    currentUserName = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    
    // Clear jobs UI
    jobsContainer.innerHTML = '';
    
    showAuth();
}

// ---------------------------------
// Jobs API Logic
// ---------------------------------

// Helper to handle API requests with Auth Header
async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
        ...(options.headers || {})
    };
    
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });
    
    // If token expired / invalid
    if (response.status === 401) {
        logout();
        throw new Error('Session expired');
    }
    
    return response;
}

// GET all jobs
async function fetchJobs() {
    try {
        const response = await fetchWithAuth('/jobs');
        const data = await response.json();
        
        if (response.ok) {
            renderJobs(data.jobs);
            jobCount.textContent = `${data.count} Total`;
        }
    } catch (error) {
        if(currentToken) console.error('Error fetching jobs:', error);
    }
}

// POST / PATCH Job Action
jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const companyDate = jobCompany.value;
    const positionData = jobPosition.value;
    const statusData = jobStatus.value;
    const isEdit = editJobId.value !== '';
    
    const method = isEdit ? 'PATCH' : 'POST';
    const url = isEdit ? `/jobs/${editJobId.value}` : '/jobs';
    
    submitJobBtn.disabled = true;
    submitJobBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetchWithAuth(url, {
            method: method,
            body: JSON.stringify({ company: companyDate, position: positionData, status: statusData })
        });
        
        if (response.ok) {
            showMessage(jobFormMsg, isEdit ? 'Job updated successfully!' : 'Job added successfully!', false);
            resetJobForm();
            fetchJobs(); // Refresh grid
        } else {
            const data = await response.json();
            showMessage(jobFormMsg, data.msg || 'Failed to save job');
        }
    } catch (error) {
        showMessage(jobFormMsg, 'Network error while saving job');
    } finally {
        submitJobBtn.disabled = false;
        submitJobBtn.textContent = isEdit ? 'Update Job' : 'Add Job';
    }
});

// Delegated event listener for edit/delete buttons
jobsContainer.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
        const d = editBtn.dataset;
        triggerEdit(d.id, d.company, d.position, d.status);
    }
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        deleteJob(deleteBtn.dataset.id);
    }
});

// DEL Job
async function deleteJob(id) {
    if(!confirm('Are you sure you want to delete this job application?')) return;
    
    try {
        const response = await fetchWithAuth(`/jobs/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchJobs();
        } else {
            console.error('Failed to delete');
        }
    } catch(err) {
        console.error(err);
    }
}

// Set form to edit mode
function triggerEdit(id, company, position, status) {
    editJobId.value = id;
    jobCompany.value = company;
    jobPosition.value = position;
    jobStatus.value = status;
    
    submitJobBtn.textContent = 'Update Job';
    cancelEditBtn.classList.remove('hidden');
    
    // Smooth scroll to top form
    document.querySelector('.dashboard-content').scrollIntoView({ behavior: 'smooth' });
}

function resetJobForm() {
    jobForm.reset();
    editJobId.value = '';
    submitJobBtn.textContent = 'Add Job';
    cancelEditBtn.classList.add('hidden');
}


// ---------------------------------
// View Rendering
// ---------------------------------
function renderJobs(jobs) {
    if (jobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="no-jobs">
                <i class="fa-solid fa-folder-open"></i>
                <h3>No jobs found!</h3>
                <p>Start applying and tracking them here.</p>
            </div>
        `;
        return;
    }

    const html = jobs.map(job => {
        // format date safely
        const dateObj = new Date(job.createdAt);
        const dateStr = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'Recently';
        
        return `
            <div class="job-card status-${job.status}">
                <div class="job-company">${escapeHTML(job.company)}</div>
                <div class="job-position"><i class="fa-solid fa-user-tie"></i> ${escapeHTML(job.position)}</div>
                
                <div class="job-meta">
                    <span class="status-badge ${job.status}">${job.status}</span>
                    <span style="color:var(--text-muted); font-size:0.8rem">
                        <i class="fa-regular fa-calendar"></i> ${dateStr}
                    </span>
                </div>
                
                <div class="job-actions" style="margin-top: 1rem;">
                    <button class="btn-icon edit-btn" data-id="${job._id}" data-company="${escapeHTML(job.company)}" data-position="${escapeHTML(job.position)}" data-status="${job.status}" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${job._id}" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    jobsContainer.innerHTML = html;
}

// Basic XSS prevention for user input rendering
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Escape quotes for inline onclick arguments
function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Run on load
init();
