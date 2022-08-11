const TASK_STATUS_COMPLETE = 1;
const TASK_STATUS_PENDING = 0;
const TASK_STATUS_CANCELED = 2;

Date.prototype.toDateInputValue = (function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
});

class Model {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [
    ];
  }

  genId() { return Math.floor(Math.random() * Date.now()); }

  addTask(newTaskName = '', newTaskDescription = '', newTaskDate = '', newTaskStatus = 1) {
    if (newTaskName === '') {
      newTaskName = 'Untitled Task';
    }
    if (newTaskDate === '') {
      newTaskDate = 'No Date';
    }

    const newTask = {
      id: this.genId(),
      taskName: newTaskName,
      taskDescription: newTaskDescription,
      date: newTaskDate,
      taskStatus: newTaskStatus,
      comments: {}
    };

    this.tasks.unshift(newTask);

    this.save();
  }

  editTask(id, updatedTitle = undefined, updatedText = undefined, updatedDate = undefined, updatedStatus = undefined) {
    let dataToChange = {};

    if (updatedTitle !== undefined) {
      dataToChange.taskName = updatedTitle;
    }
    if (updatedText !== undefined) {
      dataToChange.taskDescription = updatedText;
    }
    if (updatedDate !== undefined) {
      if (updatedDate === '') {
        dataToChange.date = 'No Date';
      } else {
        dataToChange.date = updatedDate;
      }
    }
    if (updatedStatus !== undefined) {
      dataToChange.taskStatus = updatedStatus;
    }

    this.tasks = this.tasks.map(task => task.id === id ? { ...task, ...dataToChange } : task);

    this.save();
  }

  removeTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.save();
  }

  addComment(task, text = 'Empty Comment') {
    const commentId = Math.floor(Math.random() * 999999);
    task.comments[commentId] = text;
    this.save();
  }

  removeComment(task, id) {
    Object.keys(task.comments).forEach(key => {
      console.log(key);
      console.log(id);
      if (key === id) {
        console.log(id);
        delete task.comments[id];
      }
    });
    this.save();
  }

  save() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('nightMode', app.nightMode);
  }

  findTask(id) {
    return this.tasks.filter(task => task.id === id)[0];
  }
}

class View {
  constructor() {
    this.taskList = document.getElementById('task-list');

    this.createTaskMenuContainer = document.getElementById('create-menu-container');

    this.createTaskSection = document.getElementById('create-task');
    this.createTaskSubmit = this.createTaskSection.querySelector('.create-task-submit');
    this.createTaskTitle = this.createTaskSection.querySelector('.create-task-title');
    this.createTaskDescription = this.createTaskSection.querySelector('.create-task-description');
    this.createTaskDate = this.createTaskSection.querySelector('.create-task-date');
    this.createTaskStatus = this.createTaskSection.querySelector('#create-task-status');
    this.createTaskCloseButton = this.createTaskSection.querySelector('.create-task-close');

    this.editTaskMenuContainer = document.getElementById('edit-menu-container');
    this.editTaskSection = document.getElementById('edit-task');
    this.editTaskSubmit = this.editTaskSection.querySelector('.edit-task-submit');
    this.editTaskRemove = this.editTaskSection.querySelector('.edit-task-remove');
    this.editTaskTitle = this.editTaskSection.querySelector('.edit-task-title');
    this.editTaskDescription = this.editTaskSection.querySelector('.edit-task-description');
    this.editTaskDate = this.editTaskSection.querySelector('.edit-task-date');
    this.editTaskStatus = this.editTaskSection.querySelector('#edit-task-status');
    this.editTaskCloseButton = this.editTaskSection.querySelector('.edit-task-close');

    this.commentSection = document.getElementById('add-comment');

    this.addCommentMenuContainer = document.getElementById('add-comment-container');
    this.commentSubmit = this.commentSection.querySelector(".add-comment-submit");
    this.commentField = this.commentSection.querySelector(".add-comment-field");
    this.commentCloseButton = this.commentSection.querySelector('.add-comment-close');

    this.changeStatusMenuContainer = document.getElementById('change-status-container');
    this.changeStatusSection = document.getElementById('change-status');
    this.changeStatusDropdown = this.changeStatusSection.querySelector("#change-status-dropdown");
    this.changeStatusSubmit = this.changeStatusSection.querySelector('.change-status-submit');
    this.changeStatusCloseButton = this.changeStatusSection.querySelector('.change-status-close');
  }

  showCreateTaskMenu() {
    this.createTaskTitle.value = '';
    this.createTaskTitle.focus();
    this.createTaskDescription.value = '';
    this.createTaskSection.querySelector('.menu-field-autogrow-wrapper').dataset.replicatedValue = '';
    this.createTaskDate.value = new Date().toDateInputValue();
    this.createTaskStatus.value = 0;
    this.createTaskMenuContainer.classList = 'menu-container menu-shown';
  }

  showEditTaskMenu(task) {
    this.editTaskTitle.value = task.taskName;
    this.editTaskTitle.focus();
    this.editTaskDescription.value = task.taskDescription;
    this.editTaskSection.querySelector('.menu-field-autogrow-wrapper').dataset.replicatedValue = task.taskDescription;
    this.editTaskDate.value = task.date === 'No Date' ? '' : task.date;
    this.editTaskStatus.value = task.taskStatus;
    this.editTaskMenuContainer.classList = 'menu-container menu-shown';
  }

  showAddCommentMenu() {
    this.commentField.value = '';
    this.commentField.focus();
    this.commentSection.querySelector('.menu-field-autogrow-wrapper').dataset.replicatedValue = '';
    this.addCommentMenuContainer.classList = 'menu-container menu-shown';
  }

  showChangeStatusMenu(task) {
    this.changeStatusDropdown.value = task.taskStatus;
    this.changeStatusDropdown.focus();
    this.changeStatusMenuContainer.classList = 'menu-container menu-shown';
  }

  closeCreateMenu() {
    this.createTaskMenuContainer.classList = 'menu-container menu-hidden';
  }

  closeEditMenu() {
    let clone = this.editTaskRemove.cloneNode(true);
    this.editTaskRemove.replaceWith(clone);
    this.editTaskRemove = clone;
    this.editTaskRemove.innerText = 'Remove Task';
    this.editTaskRemove.classList = 'btn btn-yellow menu-entry-button edit-task-remove';
    this.editTaskMenuContainer.classList = 'menu-container menu-hidden';
  }
  closeCommentMenu() {
    this.addCommentMenuContainer.classList = 'menu-container menu-hidden';
  }
  closeChangeStatusMenu() {
    this.changeStatusMenuContainer.classList = 'menu-container menu-hidden';
  }

  onRemoveTaskAttempted() {
    const clone = this.editTaskRemove.cloneNode(true);
    this.editTaskRemove.replaceWith(clone);
    this.editTaskRemove = clone;
    this.editTaskRemove.innerText = 'Confirm Remove';
    this.editTaskRemove.classList = 'btn btn-red menu-entry-button edit-task-remove';
  };

  render(tasks) {
    // Remove all tasks
    while (this.taskList.firstChild) {
      this.taskList.removeChild(this.taskList.lastChild);
    }

    // If no tasks, show menu
    if (tasks.length < 1) {
      document.querySelector('main').insertAdjacentHTML('beforeend', `
      <div id="no-tasks">
        <div class="no-tasks">
          <p>Tasks will appear here</p>
          <p>There are none at the moment.</p>
        </div>
      </div>`);
      return;
    }
    else {
      const noTasks = document.getElementById('no-tasks');
      if (noTasks != null) {
        noTasks.parentElement.removeChild(noTasks);
      }
    }

    // Task Sorting
    let sortedTasks = [];

    const tasksCompleted = tasks.filter(task => task.taskStatus === TASK_STATUS_COMPLETE);
    const tasksPending = tasks.filter(task => task.taskStatus === TASK_STATUS_PENDING);
    const tasksCanceled = tasks.filter(task => task.taskStatus === TASK_STATUS_CANCELED);

    tasksCompleted.forEach(task => sortedTasks.push(task));
    tasksPending.forEach(task => sortedTasks.push(task));
    tasksCanceled.forEach(task => sortedTasks.push(task));

    console.log(sortedTasks);

    // Add new tasks
    sortedTasks.forEach(task => {

      let circleColorClass = '';

      if (task.taskStatus === TASK_STATUS_COMPLETE) {
        circleColorClass = 'task-status-circle-green';
      } else if (task.taskStatus === TASK_STATUS_PENDING) {
        circleColorClass = 'task-status-circle-yellow';
      } else if (task.taskStatus === TASK_STATUS_CANCELED) {
        circleColorClass = 'task-status-circle-red';
      }

      const commentCount = Object.keys(task.comments).length;

      const hasTitle = task.taskName !== '';

      const hasDescription = task.taskDescription !== '';

      this.taskList.insertAdjacentHTML('beforeend', `
        <div id="task-${task.id}" class="task-card">
          <div>
            <div class="task-card-header">
              <div class="task-status-circle ${circleColorClass}"></div>
              <h1 class="task-title">${hasTitle ? task.taskName : 'Untitled Task'}</h1>
            </div>
            <div class="task-card-content">
              <div class="task-card-content-left">
                <p class="task-date">${task.date}</p>
                <pre class="task-description ${hasDescription ? '' : 'task-description-none'}">${hasDescription ? task.taskDescription : 'This task does not have a description.'}</pre>
              </div>
              <div class="task-card-content-right">
                <button class="btn btn-blue card-change-status">Change Status</button>
                <button class="btn btn-blue card-edit-task">Edit Task</button>
                <button class="btn btn-blue card-add-comment">Add Comment</button>
              </div>
            </div>
          </div>
          <div class="task-comments">
            <div class="task-comments-header">
              <p class="task-comments-header-text">${commentCount > 0 ? `Comments (${commentCount})` : ''}</p>
            </div>
            <div class="comment-container">
            </div>
          </div>
        </div>`
      );

      // Add comments
      const taskDiv = document.getElementById(`task-${task.id}`);
      const commentContainer = taskDiv.querySelector('.comment-container');

      Object.keys(task.comments).forEach(comment => {
        commentContainer.insertAdjacentHTML('beforeend', `
        <div class="comment" id="comment-${comment}">
          <pre class="comment-content">${task.comments[comment]}</pre>
          <button class="delete-button">
            <svg viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
            </svg>
          </button>
        </div>`);
      });
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.nightMode = JSON.parse(localStorage.getItem('nightMode')) || false;

    this.currentEditTaskId = -1;
    this.currentAddCommentTaskId = -1;
    this.currentChangeStatusId = -1;

    this.render();

    document.getElementById('create-task-button').addEventListener('click', () => {
      this.showCreateTaskMenu();
    });

    document.getElementById('night-mode-button').addEventListener('click', () => {
      this.nightMode = !this.nightMode;
      updateNightMode();
      this.model.save();
    });

    this.initializeCreateTaskMenu();
    this.initializeEditTaskMenu();
    this.initializeCommentMenu();
    this.initializeAddStatusMenu();

    const updateNightMode = () => {
      if (this.nightMode) {
        document.querySelector('body').classList = 'dark-mode';
      }
      else {
        document.querySelector('body').classList = '';
      }
    };
    updateNightMode();
  }

  render() {
    this.view.render(this.model.tasks);
    this.wireTaskCardButtons();
  }

  wireTaskCardButtons() {
    this.model.tasks.forEach(task => {

      const taskDiv = document.getElementById(`task-${task.id}`);
      const changeStatusButton = taskDiv.querySelector('.card-change-status');
      const editTaskButton = taskDiv.querySelector('.card-edit-task');
      const addCommentButton = taskDiv.querySelector('.card-add-comment');

      changeStatusButton.addEventListener('click', () => {
        this.showChangeStatusMenu(task.id);
      });
      editTaskButton.addEventListener('click', () => {
        this.showEditTaskMenu(task.id);
      });
      addCommentButton.addEventListener('click', () => {
        this.showAddCommentMenu(task.id);
      });

      const wireCommentDeleteButtons = () => {
        Object.keys(task.comments).forEach(commentId => {
          const comment = document.getElementById(`comment-${commentId}`);
          const delButton = comment.querySelector('.delete-button');
          delButton.addEventListener('click', () => {
            this.removeComment(task, commentId);
          });
        });
      };
      wireCommentDeleteButtons();
    });
  }

  initializeCreateTaskMenu() {
    const submitAction = () => {
      const statusOptions = document.querySelectorAll('#create-task-status option:checked');
      const statusValue = Number(Array.from(statusOptions).map(el => el.value));

      this.model.addTask(
        this.view.createTaskTitle.value,
        this.view.createTaskDescription.value,
        this.view.createTaskDate.value,
        statusValue,
      );

      this.closeCreateMenu();
      this.render();
    };

    this.view.createTaskSubmit.addEventListener('click', submitAction);
    this.view.createTaskCloseButton.addEventListener('click', () => {
      this.closeCreateMenu();
    });
  }

  initializeEditTaskMenu() {
    const submitAction = () => {
      if (this.currentEditTaskId === -1) { console.log('Cannot Submit Edit'); return; }
      const statusOptions = document.querySelectorAll('#edit-task-status option:checked');
      const statusValue = Number(Array.from(statusOptions).map(el => el.value));

      this.model.editTask(
        this.currentEditTaskId,
        this.view.editTaskTitle.value.trim(),
        this.view.editTaskDescription.value.trim(),
        this.view.editTaskDate.value.trim(),
        statusValue,
      );
      this.closeEditMenu();
      this.render();
    };

    this.view.editTaskSubmit.addEventListener('click', submitAction);

    this.view.editTaskRemove.addEventListener('click', () => {
      this.onRemoveTaskAttempted();
    });

    this.view.editTaskCloseButton.addEventListener('click', () => {
      this.closeEditMenu();
    });
  }

  initializeCommentMenu() {
    const submitAction = () => {
      if (this.currentAddCommentTaskId === -1) { console.log('Cannot Submit Comment'); return; }
      const task = this.model.findTask(this.currentAddCommentTaskId);
      if (task == null) { console.log('Task Not Found'); return; }
      this.model.addComment(task, this.view.commentField.value);
      this.closeCommentMenu();
      this.render();
    };

    this.view.commentSubmit.addEventListener('click', submitAction);
    this.view.commentCloseButton.addEventListener('click', () => {
      this.closeCommentMenu();
    });

  }

  initializeAddStatusMenu() {
    const submitAction = () => {
      if (this.currentChangeStatusId === -1) { console.log('Cannot Submit Status Change'); return; }
      const statusOptions = document.querySelectorAll('#change-status-dropdown option:checked');
      const statusValue = Number(Array.from(statusOptions).map(el => el.value));

      this.model.editTask(
        this.currentChangeStatusId,
        undefined,
        undefined,
        undefined,
        statusValue,
      );
      this.closeChangeStatusMenu();
      this.render();
    };

    this.view.changeStatusSubmit.addEventListener('click', submitAction);
    this.view.changeStatusCloseButton.addEventListener('click', () => {
      this.closeChangeStatusMenu();
    });
  }

  showCreateTaskMenu() {
    this.view.showCreateTaskMenu();
  };

  showEditTaskMenu(id) {
    this.currentEditTaskId = id;

    const task = this.model.findTask(id);
    if (task == null) { console.log('Invalid Task Edit'); return; }
    this.view.showEditTaskMenu(task);
  }

  onRemoveTaskAttempted() {
    if (this.currentEditTaskId === -1) { console.log('Cannot Remove'); return; }
    this.view.onRemoveTaskAttempted();
    this.view.editTaskRemove.addEventListener('click', () => {
      this.onRemoveTaskPressed();
    });
  }

  onRemoveTaskPressed() {
    this.removeTask(this.currentEditTaskId);
    this.closeEditMenu();
  }

  removeTask(id) {
    this.model.removeTask(id);
    this.render();
  };

  showAddCommentMenu(id) {
    this.currentAddCommentTaskId = id;
    const task = this.model.findTask(id);
    if (task == null) { console.log('Invalid Task Edit'); return; }
    this.view.showAddCommentMenu(task);
  }

  removeComment(task, id) {
    this.model.removeComment(task, id);
    this.render();
  }

  showChangeStatusMenu(id) {
    this.currentChangeStatusId = id;
    this.view.showChangeStatusMenu(this.model.findTask(id));
  }

  closeCreateMenu() {
    this.view.closeCreateMenu();
  }

  closeEditMenu() {
    this.currentEditTaskId = -1;

    this.view.closeEditMenu();

    this.view.editTaskRemove.addEventListener('click', () => {
      this.onRemoveTaskAttempted();

    });

  }

  closeCommentMenu() {
    this.currentAddCommentTaskId = -1;
    this.view.closeCommentMenu();
  }

  closeChangeStatusMenu() {
    this.currentChangeStatusId = -1;
    this.view.closeChangeStatusMenu();
  }
}

const app = new Controller(new Model(), new View());

