import React, { useState, useEffect } from 'react';

function App() {
  const FILTER_MAP = {
    All: () => true,
    Active: (task) => !task.completed,
    Completed: (task) => task.completed,
  };
  const FILTER_NAMES = Object.keys(FILTER_MAP);

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [editingTask, setEditingTask] = useState(null);
  const [sortedByUserId, setSortedByUserId] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(response => response.json())
      .then(data => {
        const formattedData = data.map(item => ({
          id: item.id.toString(),
          name: item.title,
          completed: item.completed,
          userId: item.userId
        }));
        setTasks(formattedData);
      })
      .catch(error => console.error('Error fetching data:', error));

    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newTask = { id: Date.now(), name: event.target.elements.text.value, completed: false };
    setTasks([...tasks, newTask]);
    event.target.elements.text.value = '';
  };

  const handleToggle = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id? {...task, completed:!task.completed} : task
    );
    setTasks(updatedTasks);
  };

  const handleFilterChange = (name) => {
    setFilter(name);
  };

  const handleEdit = (id) => {
    const task = tasks.find(task => task.id === id);
    setEditingTask(task);
  };

  const handleEditInputChange = (event) => {
    setEditingTask({ ...editingTask, name: event.target.value });
  };

  const handleSaveEdit = (id, newName) => {
    const updatedTasks = tasks.map(task => 
      task.id === id? {...task, name: newName} : task
    );
    setTasks(updatedTasks);
    setEditingTask(null);
  };

  const handleDelete = (id) => {
    const updatedTasks = tasks.filter(task => task.id!== id);
    setTasks(updatedTasks);
  };

  const handleSortByUserId = () => {
    setSortedByUserId(!sortedByUserId);
  };

  const handleUserFilterChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const renderUsersDropdown = () => (
    <select value={selectedUser} onChange={handleUserFilterChange}>
      <option value="">All Users</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>{user.name}</option>
      ))}
    </select>
  );

  const renderTasks = tasks
    .filter(task => FILTER_MAP[filter](task))
    .filter(task => selectedUser === '' || task.userId.toString() === selectedUser)
    .sort((a, b) => sortedByUserId ? a.userId - b.userId : 0)
    .map((task) => (
      <li key={task.id} className="todo stack-small">
        <div className="c-cb">
          <input id={task.id} type="checkbox" checked={task.completed} onChange={() => handleToggle(task.id)} />
          <label className="todo-label" htmlFor={task.id}>
            {task.name} (User: {users.find(user => user.id === task.userId)?.name})
          </label>
        </div>
        <div className="btn-group">
          <button type="button" className="btn" onClick={() => handleEdit(task.id)}>
            Редактировать <span className="visually-hidden">{task.name}</span>
          </button>
          <button type="button" className="btn btn__danger" onClick={() => handleDelete(task.id)}>
            Удалить <span className="visually-hidden">{task.name}</span>
          </button>
        </div>
      </li>
    ));

  return (
    <div className="todoapp stack-large">
      <h1>Заметки</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="label-wrapper">
          <label htmlFor="new-todo-input" className="label__lg">
            Что нужно сделать?
          </label>
        </h2>
        <input
          type="text"
          id="new-todo-input"
          className="input input__lg"
          name="text"
          autoComplete="off"
        />
        <button type="submit" className="btn btn__primary btn__lg">
          Добавить
        </button>
      </form>
      <div className="filters btn-group stack-exception">
        {FILTER_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            className={`btn toggle-btn ${filter === name? 'is-active' : ''}`}
            onClick={() => handleFilterChange(name)}
          >
            <span className="visually-hidden">Показать </span>
            <span>{name}</span>
            <span className="visually-hidden"> задач</span>
          </button>
        ))}
      </div>
      <div className="btn-group stack-exception">
        <button
          type="button"
          className="btn toggle-btn"
          onClick={handleSortByUserId}
        >
          Сортировать по пользователю
        </button>
        {renderUsersDropdown()}
      </div>
      <ul role="list" className="todo-list stack-large stack-exception" aria-labelledby="list-heading">
        {renderTasks}
      </ul>
      {editingTask && (
        <div className="stack-small">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveEdit(editingTask.id, editingTask.name);
          }}>
            <div className="form-group">
              <label className="todo-label" htmlFor={editingTask.id}>
                Новое имя для {editingTask.name}
              </label>
              <input
                id={editingTask.id}
                className="todo-text"
                type="text"
                value={editingTask.name}
                onChange={handleEditInputChange}
              />
            </div>
            <div className="btn-group">
              <button type="button" className="btn todo-cancel" onClick={() => setEditingTask(null)}>
                Отмена
              </button>
              <button type="submit" className="btn btn__primary todo-edit">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
