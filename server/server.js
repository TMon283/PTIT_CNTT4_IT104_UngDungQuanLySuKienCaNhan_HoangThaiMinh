const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');
let db = {};

function loadDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
  } catch (error) {
    console.error('Error loading database:', error);
    db = { users: [], boards: [], lists: [], tasks: [], tags: [] };
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function getNextUserId() {
  if (db.users.length === 0) return 1;
  const maxId = Math.max(...db.users.map(u => Number(u.id)));
  return maxId + 1;
}

function getNextBoardId(userId) {
  const userBoards = db.boards.filter(b => Number(b.user_id) === Number(userId));
  if (userBoards.length === 0) return 101;
  const maxId = Math.max(...userBoards.map(b => Number(b.id)));
  return maxId + 1;
}

function getNextListId(boardId) {
  const boardLists = db.lists.filter(l => Number(l.board_id) === Number(boardId));
  if (boardLists.length === 0) return 201;
  const maxId = Math.max(...boardLists.map(l => Number(l.id)));
  return maxId + 1;
}

function getNextTaskId(listId) {
  const listTasks = db.tasks.filter(t => Number(t.list_id) === Number(listId));
  if (listTasks.length === 0) return 301;
  const maxId = Math.max(...listTasks.map(t => Number(t.id)));
  return maxId + 1;
}

function getNextTagId(taskId) {
  const taskTags = db.tags.filter(tag => Number(tag.task_id) === Number(taskId));
  if (taskTags.length === 0) return 401;
  const maxId = Math.max(...taskTags.map(tag => Number(tag.id)));
  return maxId + 1;
}

loadDatabase();

app.get('/users', (req, res) => {
  res.json(db.users);
});

app.post('/users', (req, res) => {
  const newUser = {
    id: getNextUserId(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);
  saveDatabase();
  res.status(201).json(newUser);
});

app.get('/boards', (req, res) => {
  res.json(db.boards);
});

app.get('/boards/:id', (req, res) => {
  const board = db.boards.find(b => Number(b.id) === Number(req.params.id));
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json(board);
});

app.post('/boards', (req, res) => {
  const newBoard = {
    id: getNextBoardId(req.body.user_id),
    ...req.body,
    created_at: new Date().toISOString()
  };
  db.boards.push(newBoard);
  saveDatabase();
  res.status(201).json(newBoard);
});

app.patch('/boards/:id', (req, res) => {
  const boardIndex = db.boards.findIndex(b => Number(b.id) === Number(req.params.id));
  if (boardIndex === -1) return res.status(404).json({ error: 'Board not found' });
  
  db.boards[boardIndex] = { ...db.boards[boardIndex], ...req.body };
  saveDatabase();
  res.json(db.boards[boardIndex]);
});

app.delete('/boards/:id', (req, res) => {
  const boardIndex = db.boards.findIndex(b => Number(b.id) === Number(req.params.id));
  if (boardIndex === -1) return res.status(404).json({ error: 'Board not found' });
  
  const boardId = Number(req.params.id);
  db.lists = db.lists.filter(l => Number(l.board_id) !== boardId);
  db.tasks = db.tasks.filter(t => {
    const taskList = db.lists.find(l => Number(l.id) === Number(t.list_id));
    return taskList && Number(taskList.board_id) !== boardId;
  });
  
  db.boards.splice(boardIndex, 1);
  saveDatabase();
  res.status(204).send();
});

app.get('/lists', (req, res) => {
  res.json(db.lists);
});

app.get('/lists/:id', (req, res) => {
  const list = db.lists.find(l => Number(l.id) === Number(req.params.id));
  if (!list) return res.status(404).json({ error: 'List not found' });
  res.json(list);
});

app.post('/lists', (req, res) => {
  const newList = {
    id: getNextListId(req.body.board_id),
    ...req.body,
    created_at: new Date().toISOString()
  };
  db.lists.push(newList);
  saveDatabase();
  res.status(201).json(newList);
});

app.patch('/lists/:id', (req, res) => {
  const listIndex = db.lists.findIndex(l => Number(l.id) === Number(req.params.id));
  if (listIndex === -1) return res.status(404).json({ error: 'List not found' });
  
  db.lists[listIndex] = { ...db.lists[listIndex], ...req.body };
  saveDatabase();
  res.json(db.lists[listIndex]);
});

app.delete('/lists/:id', (req, res) => {
  const listIndex = db.lists.findIndex(l => Number(l.id) === Number(req.params.id));
  if (listIndex === -1) return res.status(404).json({ error: 'List not found' });
  
  const listId = Number(req.params.id);
  db.tasks = db.tasks.filter(t => Number(t.list_id) !== listId);
  
  db.lists.splice(listIndex, 1);
  saveDatabase();
  res.status(204).send();
});

app.get('/tasks', (req, res) => {
  res.json(db.tasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = db.tasks.find(t => Number(t.id) === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/tasks', (req, res) => {
  const newTask = {
    id: getNextTaskId(req.body.list_id),
    ...req.body,
    created_at: new Date().toISOString()
  };
  db.tasks.push(newTask);
  saveDatabase();
  res.status(201).json(newTask);
});

app.patch('/tasks/:id', (req, res) => {
  const taskIndex = db.tasks.findIndex(t => Number(t.id) === Number(req.params.id));
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
  
  db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...req.body };
  saveDatabase();
  res.json(db.tasks[taskIndex]);
});

app.delete('/tasks/:id', (req, res) => {
  const taskIndex = db.tasks.findIndex(t => Number(t.id) === Number(req.params.id));
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
  
  const taskId = Number(req.params.id);
  db.tags = db.tags.filter(tag => Number(tag.task_id) !== taskId);
  
  db.tasks.splice(taskIndex, 1);
  saveDatabase();
  res.status(204).send();
});

app.get('/tags', (req, res) => {
  res.json(db.tags);
});

app.get('/tags/:id', (req, res) => {
  const tag = db.tags.find(tag => Number(tag.id) === Number(req.params.id));
  if (!tag) return res.status(404).json({ error: 'Tag not found' });
  res.json(tag);
});

app.post('/tags', (req, res) => {
  const newTag = {
    id: getNextTagId(req.body.task_id),
    ...req.body
  };
  db.tags.push(newTag);
  saveDatabase();
  res.status(201).json(newTag);
});

app.patch('/tags/:id', (req, res) => {
  const tagIndex = db.tags.findIndex(tag => Number(tag.id) === Number(req.params.id));
  if (tagIndex === -1) return res.status(404).json({ error: 'Tag not found' });
  
  db.tags[tagIndex] = { ...db.tags[tagIndex], ...req.body };
  saveDatabase();
  res.json(db.tags[tagIndex]);
});

app.delete('/tags/:id', (req, res) => {
  const tagIndex = db.tags.findIndex(tag => Number(tag.id) === Number(req.params.id));
  if (tagIndex === -1) return res.status(404).json({ error: 'Tag not found' });
  
  db.tags.splice(tagIndex, 1);
  saveDatabase();
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
