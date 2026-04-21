document.addEventListener("DOMContentLoaded", () => {
    const todoForm = document.getElementById("todo-form");
    const todoInput = document.getElementById("todo-input");
    const todoList = document.getElementById("todo-list");
    const taskCountStr = document.getElementById("task-count");
    
    // Focus Mode Elements
    const focusOverlay = document.getElementById("focus-overlay");
    const focusTaskTitle = document.getElementById("focus-task-title");
    const btnExitFocus = document.getElementById("btn-exit-focus");
    const timeDisplay = document.getElementById("time-display");
    const btnStartTimer = document.getElementById("btn-start-timer");
    const btnStopTimer = document.getElementById("btn-stop-timer");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let focusTimer = null;
    let timeLeft = 25 * 60; // 25 minutes
    let isTimerRunning = false;

    // Initialize
    renderTasks();
    updateCount();

    // Event Listeners
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            addTask(text);
            todoInput.value = "";
        }
    });

    btnExitFocus.addEventListener("click", exitFocusMode);
    btnStartTimer.addEventListener("click", startTimer);
    btnStopTimer.addEventListener("click", stopTimer);

    function addTask(text) {
        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false
        };
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateCount();
    }

    function toggleTask(id) {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id, element) {
        element.classList.add("deleting");
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            updateCount();
        }, 300); // Wait for animation
    }

    function openFocusMode(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        focusTaskTitle.textContent = task.text;
        focusOverlay.classList.add("active");
        
        // Reset timer
        stopTimer();
        timeLeft = 25 * 60;
        updateTimerDisplay();
    }

    function exitFocusMode() {
        focusOverlay.classList.remove("active");
        stopTimer();
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        btnStartTimer.textContent = "Running...";
        btnStartTimer.style.opacity = "0.5";
        
        focusTimer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                stopTimer();
                // Play notification sound or logic here
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(focusTimer);
        isTimerRunning = false;
        btnStartTimer.textContent = "Start";
        btnStartTimer.style.opacity = "1";
    }

    function updateTimerDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${m}:${s}`;
    }

    function updateCount() {
        const pending = tasks.filter(t => !t.completed).length;
        taskCountStr.textContent = `${pending} Task${pending !== 1 ? 's' : ''}`;
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function renderTasks() {
        todoList.innerHTML = "";
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            
            const contentDiv = document.createElement("div");
            contentDiv.className = "todo-content";
            contentDiv.onclick = () => toggleTask(task.id);
            
            const checkbox = document.createElement("div");
            checkbox.className = "checkbox";
            const checkIcon = document.createElement("i");
            checkIcon.setAttribute("data-lucide", "check");
            checkbox.appendChild(checkIcon);
            
            const textSpan = document.createElement("span");
            textSpan.className = "todo-text";
            textSpan.textContent = task.text;
            
            contentDiv.appendChild(checkbox);
            contentDiv.appendChild(textSpan);
            
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "todo-actions";
            
            const focusBtn = document.createElement("button");
            focusBtn.className = "btn-action focus";
            focusBtn.title = "Focus Mode";
            focusBtn.onclick = (e) => {
                e.stopPropagation();
                openFocusMode(task.id);
            };
            const focusIcon = document.createElement("i");
            focusIcon.setAttribute("data-lucide", "target");
            focusBtn.appendChild(focusIcon);
            
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn-action delete";
            deleteBtn.title = "Delete Task";
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteTask(task.id, li);
            };
            const deleteIcon = document.createElement("i");
            deleteIcon.setAttribute("data-lucide", "trash-2");
            deleteBtn.appendChild(deleteIcon);
            
            actionsDiv.appendChild(focusBtn);
            if (!task.completed) {
                // Focus makes sense mostly on uncompleted tasks, though we show it for all 
                // We'll leave it simple for now, or hide. Showing is fine.
            }
            actionsDiv.appendChild(deleteBtn);
            
            li.appendChild(contentDiv);
            li.appendChild(actionsDiv);
            
            todoList.appendChild(li);
        });
        
        // Re-init lucide icons for dynamic content
        if(window.lucide) {
            lucide.createIcons();
        }
    }
});
