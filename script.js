// Inisialisasi Data dari localStorage
let tasks = JSON.parse(localStorage.getItem('taskHub_tasks')) || [];
let courses = JSON.parse(localStorage.getItem('taskHub_courses')) || ['Algorithms', 'JavaScript', 'Basic Programming'];

let currentTab = 'dashboard'; // 'dashboard' atau 'archive'
let isSortedByDeadline = false;
let currentCompleteTaskId = null; // Menyimpan ID tugas yang sedang ditandai selesai

// DOM Elements
const taskContainer = document.getElementById('taskContainer');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const sortBtn = document.getElementById('sortBtn');

// Set Tanggal & Sapaan Otomatis
function setHeaderDate() {
    const today = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    document.getElementById('currentDateDisplay').textContent = today.toLocaleDateString('en-GB', options);

    const hour = today.getHours();
    let greeting = "Good Evening";
    if(hour < 12) greeting = "Good Morning";
    else if(hour < 18) greeting = "Good Afternoon";
    document.getElementById('greetingMsg').textContent = `${greeting}, Mate!`;
}
setHeaderDate();

// Render Dropdown Courses
function renderCourseOptions() {
    // Dropdown di Halaman Utama
    courseFilter.innerHTML = '<option value="All courses">All courses</option>';
    courses.forEach(course => {
        courseFilter.innerHTML += `<option value="${course}">${course}</option>`;
    });

    // Dropdown di Form Pop-up
    const inputCourse = document.getElementById('inputCourse');
    inputCourse.innerHTML = '';
    courses.forEach(course => {
        inputCourse.innerHTML += `<option value="${course}">${course}</option>`;
    });
    inputCourse.innerHTML += `<option value="_add_new_">+ Add new course...</option>`;
}
renderCourseOptions();

// Event Listener Tambah Mata Kuliah Baru
document.getElementById('inputCourse').addEventListener('change', function(e) {
    const newCourseInput = document.getElementById('inputNewCourse');
    if (e.target.value === '_add_new_') {
        newCourseInput.classList.remove('hidden');
        newCourseInput.required = true;
    } else {
        newCourseInput.classList.add('hidden');
        newCourseInput.required = false;
    }
});

// Format Tanggal untuk Label Card (Today, Tomorrow, Date)
function formatTaskDate(dateString) {
    const taskDate = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    taskDate.setHours(0,0,0,0);

    if (taskDate.getTime() === today.getTime()) return "Today";
    if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    
    return taskDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------
// [ALGORITMA BAB 3]: 1. LINEAR SEARCH
// Mencari data secara linier dari array berdasarkan judul tugas
// ---------------------------------------------------------
function linearSearch(arr, keyword) {
    if (!keyword) return arr;
    let result = [];
    let lowerKeyword = keyword.toLowerCase();
    for (let i = 0; i < arr.length; i++) {
        // Syarat Selection/If
        if (arr[i].title.toLowerCase().includes(lowerKeyword)) {
            result.push(arr[i]);
        }
    }
    return result;
}

// ---------------------------------------------------------
// [ALGORITMA BAB 3]: 2. BUBBLE SORT
// Mengurutkan array berdasarkan deadline terdekat
// ---------------------------------------------------------
function bubbleSort(arr) {
    let sortedArr = [...arr]; // Copy array agar tidak merusak aslinya
    let n = sortedArr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            let dateA = new Date(sortedArr[j].date + 'T' + sortedArr[j].time);
            let dateB = new Date(sortedArr[j+1].date + 'T' + sortedArr[j+1].time);
            
            // Tukar posisi jika dateA lebih besar (lebih lama) dari dateB
            if (dateA > dateB) {
                let temp = sortedArr[j];
                sortedArr[j] = sortedArr[j+1];
                sortedArr[j+1] = temp;
            }
        }
    }
    return sortedArr;
}

// ---------------------------------------------------------
// [ALGORITMA BAB 3]: 3. MULTIPLE FILTERING & SEQUENCE
// ---------------------------------------------------------
function renderTasks() {
    taskContainer.innerHTML = '';

    // A. SEQUENCE: Ambil nilai filter saat ini
    const selectedCourse = courseFilter.value;
    const searchKeyword = searchInput.value;

    // B. MULTIPLE FILTERING (Selection/If-Else)
    // Filter 1: Status (Dashboard/Archive) & Filter 2: Course
    let filteredTasks = tasks.filter(task => {
        const matchTab = currentTab === 'dashboard' ? task.status === 'active' : task.status === 'done';
        const matchCourse = selectedCourse === 'All courses' || task.course === selectedCourse;
        return matchTab && matchCourse;
    });

    // C. PENCARIAN (Linear Search)
    filteredTasks = linearSearch(filteredTasks, searchKeyword);

    // D. PENGURUTAN (Bubble Sort)
    if (isSortedByDeadline) {
        filteredTasks = bubbleSort(filteredTasks);
    }

    if (filteredTasks.length === 0) taskContainer.innerHTML = '<p class="empty-msg">No tasks found.</p>';

    // E. LOOPING (Perulangan Mencetak UI Card)
    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `card`;
        card.style.backgroundColor = task.color;

        const dateLabel = formatTaskDate(task.date);
        const linkHTML = task.taskLink 
            ? `<a href="${task.taskLink}" target="_blank" class="link-icon" title="Task link"><img src="icon-link.svg" alt="Link Soal"></a>` : '';
        const resultLinkHTML = (task.resultLink && currentTab === 'archive') 
            ? `<a href="${task.resultLink}" target="_blank" class="link-icon" title="Result link"><img src="icon-result.svg" alt="Link Hasil"></a>` : '';

        const markDoneBtn = currentTab === 'dashboard' 
            ? `<button class="mark-done-btn" onclick="openCompleteModal(${task.id})">Mark done</button>`
            : `<button class="mark-done-btn done" disabled>Done</button>`;

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="card-date">${dateLabel}</div>
                    <div class="card-time">${task.time} WIB</div>
                </div>
                <div class="card-actions">
                    ${markDoneBtn}
                    <button class="icon-btn" onclick="deleteTask(${task.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
            <h3 class="card-title">${task.title}</h3>
            <p class="card-note">${task.note || ''}</p>
            <div class="card-footer">
                <span class="course-badge">${task.course}</span>
                <div class="links">
                    ${linkHTML}
                    ${resultLinkHTML}
                </div>
            </div>
        `;
        taskContainer.appendChild(card);
    });
}

// Fitur Delete
window.deleteTask = function(id) {
    if(confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveData();
    }
};

// Navigasi Tabs (Dashboard vs Archive)
document.getElementById('tab-dashboard').addEventListener('click', function() {
    currentTab = 'dashboard';
    this.classList.add('active');
    document.getElementById('tab-archive').classList.remove('active');
    renderTasks();
});

document.getElementById('tab-archive').addEventListener('click', function() {
    currentTab = 'archive';
    this.classList.add('active');
    document.getElementById('tab-dashboard').classList.remove('active');
    renderTasks();
});

// Event Listeners Filter & Search
searchInput.addEventListener('input', renderTasks);
courseFilter.addEventListener('change', renderTasks);
sortBtn.addEventListener('click', () => {
    isSortedByDeadline = !isSortedByDeadline;
    sortBtn.style.backgroundColor = isSortedByDeadline ? "#111" : "white";
    sortBtn.style.color = isSortedByDeadline ? "white" : "#111";
    renderTasks();
});

// ----------------- MODAL NEW TASK -----------------
const newTaskModal = document.getElementById('newTaskModal');
document.getElementById('openNewTaskBtn').addEventListener('click', () => newTaskModal.classList.add('active'));
document.getElementById('closeNewTaskBtn').addEventListener('click', () => newTaskModal.classList.remove('active'));
document.getElementById('cancelNewTaskBtn').addEventListener('click', () => newTaskModal.classList.remove('active'));

document.getElementById('newTaskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let courseVal = document.getElementById('inputCourse').value;
    if (courseVal === '_add_new_') {
        courseVal = document.getElementById('inputNewCourse').value;
        if (!courses.includes(courseVal)) {
            courses.push(courseVal); // Simpan matkul baru
        }
    }

    const newTask = {
        id: Date.now(),
        title: document.getElementById('inputTaskName').value,
        course: courseVal,
        date: document.getElementById('inputDate').value,
        time: document.getElementById('inputTime').value,
        note: document.getElementById('inputNote').value,
        taskLink: document.getElementById('inputTaskLink').value,
        color: document.getElementById('inputColor').value,
        status: 'active',
        resultLink: null
    };

    tasks.push(newTask);
    renderCourseOptions();
    saveData();
    newTaskModal.classList.remove('active');
    this.reset();
    document.getElementById('inputNewCourse').classList.add('hidden');
    document.getElementById('inputNewCourse').required = false;
});

// ----------------- MODAL COMPLETE TASK -----------------
const completeModal = document.getElementById('completeTaskModal');

window.openCompleteModal = function(id) {
    currentCompleteTaskId = id;
    document.getElementById('completeTaskForm').reset();
    completeModal.classList.add('active');
};

document.getElementById('closeCompleteBtn').addEventListener('click', () => completeModal.classList.remove('active'));
document.getElementById('cancelCompleteBtn').addEventListener('click', () => completeModal.classList.remove('active'));

document.getElementById('completeTaskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const resLink = document.getElementById('inputResultLink').value;
    
    // Update status tugas menjadi 'done' dan simpan link
    let taskIndex = tasks.findIndex(t => t.id === currentCompleteTaskId);
    if(taskIndex !== -1) {
        tasks[taskIndex].status = 'done';
        tasks[taskIndex].resultLink = resLink;
        saveData();
    }
    
    completeModal.classList.remove('active');
    this.reset();
});

// Simpan ke localStorage & Update UI
function saveData() {
    localStorage.setItem('taskHub_tasks', JSON.stringify(tasks));
    localStorage.setItem('taskHub_courses', JSON.stringify(courses));
    renderTasks();
}

// Inisialisasi awal
renderTasks();