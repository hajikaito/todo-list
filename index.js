let tasks = [];
let currentSort = 'none';

// LocalStorageからデータを読み込む
function loadTasks() {
    const savedTasks = localStorage.getItem('todoTasks');
    const savedSort = localStorage.getItem('todoSort');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if (savedSort) {
        currentSort = savedSort;
        // ソートボタンのアクティブ状態を復元
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = Array.from(document.querySelectorAll('.sort-btn')).find(btn => {
            if (currentSort === 'none' && btn.textContent.includes('並び替えなし')) return true;
            if (currentSort === 'deadline' && btn.textContent.includes('期限順')) return true;
            if (currentSort === 'name' && btn.textContent.includes('名前順')) return true;
            return false;
        });
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}

// LocalStorageにデータを保存
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
    localStorage.setItem('todoSort', currentSort);
}

// タスクを追加
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('タスクを入力してください');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        deadline: deadlineInput.value,
        completed: false,
        order: tasks.filter(t => !t.completed).length
    };

    tasks.push(task);
    taskInput.value = '';
    deadlineInput.value = '';
    saveTasks();
    renderTasks();
}

// Enterキーでタスク追加
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// タスクを完了/未完了に切り替え
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// タスクを削除
function deleteTask(id) {
    if (confirm('このタスクを削除してもよろしいですか？')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

// 期限が過ぎているかチェック
function isOverdue(deadline) {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
}

// タスクをソート
function sortTasks(sortType) {
    currentSort = sortType;
    
    // ボタンのアクティブ状態を更新
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    saveTasks();
    renderTasks();
}

// タスクを表示
function renderTasks() {
    const todoContainer = document.getElementById('todoItems');
    const doneContainer = document.getElementById('doneItems');

    const todoTasks = tasks.filter(t => !t.completed);
    const doneTasks = tasks.filter(t => t.completed);

    // ソート処理
    if (currentSort === 'deadline') {
        todoTasks.sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
        doneTasks.sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
    } else if (currentSort === 'name') {
        todoTasks.sort((a, b) => a.text.localeCompare(b.text, 'ja'));
        doneTasks.sort((a, b) => a.text.localeCompare(b.text, 'ja'));
    } else {
        todoTasks.sort((a, b) => a.order - b.order);
    }

    // やることリストを表示
    if (todoTasks.length === 0) {
        todoContainer.innerHTML = '<div class="empty-message">タスクを追加してください</div>';
    } else {
        todoContainer.innerHTML = todoTasks.map(task => `
            <div class="item">
                <div class="checkbox" onclick="toggleTask(${task.id})"></div>
                <div class="item-content">
                    <div class="item-text">${escapeHtml(task.text)}</div>
                    ${task.deadline ? `<div class="item-deadline ${isOverdue(task.deadline) ? 'overdue' : ''}">${formatDate(task.deadline)}</div>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">削除</button>
            </div>
        `).join('');
    }

    // やり終えたことリストを表示
    if (doneTasks.length === 0) {
        doneContainer.innerHTML = '<div class="empty-message">完了したタスクはありません</div>';
    } else {
        doneContainer.innerHTML = doneTasks.map(task => `
            <div class="item">
                <div class="checkbox checked" onclick="toggleTask(${task.id})"></div>
                <div class="item-content">
                    <div class="item-text completed">${escapeHtml(task.text)}</div>
                    ${task.deadline ? `<div class="item-deadline">${formatDate(task.deadline)}</div>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">削除</button>
            </div>
        `).join('');
    }
}

// HTMLエスケープ（XSS対策）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 日付をフォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// 初期化
loadTasks();
renderTasks();