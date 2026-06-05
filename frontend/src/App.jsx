import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Calendar, 
  ListTodo, 
  X, 
  SlidersHorizontal,
  Loader2,
  PlayCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tasks`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (search) params.search = search;
      if (sortBy) params.sort = sortBy;

      const response = await axios.get(API_URL, { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTasks();
    }, 300); // Debounce search input
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, priorityFilter, sortBy]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
    setDueDate('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Handle Submit (Create or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    const payload = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null
    };

    try {
      if (editingTask) {
        // Edit Mode
        const response = await axios.put(`${API_URL}/${editingTask._id}`, payload);
        showToast('Task updated successfully');
      } else {
        // Create Mode
        const response = await axios.post(API_URL, payload);
        showToast('Task created successfully');
      }
      handleCloseModal();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      showToast('Error saving task', 'error');
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showToast('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Error deleting task', 'error');
      }
    }
  };

  // Toggle status (pending -> completed, completed -> pending)
  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await axios.put(`${API_URL}/${task._id}`, { status: nextStatus });
      showToast(nextStatus === 'completed' ? 'Task completed!' : 'Task active');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      showToast('Failed to update task status', 'error');
    }
  };

  // Calculate statistics (based on loaded list of ALL tasks, but for accurate stats we can calculate from total tasks)
  // To keep it simple, we fetch all tasks to calculate correct counters, or do a separate fetch or just calculate from the current tasks array.
  // Actually, calculating stats from the complete task list is best. To do that, we'll calculate based on tasks array when not filtered, 
  // or fetch stats. Let's do a simple calculation from the current tasks for simplicity, or fetch all tasks specifically.
  // Better yet, let's keep a separate local stats variable that recalculates when tasks change, or let's calculate counts.
  // Since this is a MERN app, doing client side filter is an option, but server side filter is robust.
  // Let's make stats show the counts of all tasks from db by doing a fast fetch of all tasks or calculating on the full task set.
  // We can calculate stats by fetching the full task list without filters on page load/actions.
  const [allTasksForStats, setAllTasksForStats] = useState([]);
  
  const fetchStats = async () => {
    try {
      const response = await axios.get(API_URL);
      setAllTasksForStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [tasks]);

  const stats = {
    total: allTasksForStats.length,
    completed: allTasksForStats.filter(t => t.status === 'completed').length,
    inProgress: allTasksForStats.filter(t => t.status === 'in-progress').length,
    pending: allTasksForStats.filter(t => t.status === 'pending').length
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <ListTodo size={36} className="logo-icon" />
          <div>
            <h1 className="app-title">TaskFlow</h1>
            <p className="app-subtitle">Elegant task management dashboard</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} /> New Task
        </button>
      </header>

      {/* Statistics Cards */}
      <section className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--primary)' }}>
            <ListTodo size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-completed)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-progress)' }}>
            <PlayCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-pending)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </section>

      {/* Filter and Action Controls */}
      <section className="action-bar">
        <div className="search-filter-group">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-input"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select-input"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="select-input"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueDate">Due Date</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </section>

      {/* Task List */}
      <main>
        {loading ? (
          <div className="loader-wrapper">
            <Loader2 className="loader" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card empty-state">
            <AlertCircle size={48} className="empty-icon" />
            <h3 className="empty-title">No tasks found</h3>
            <p className="empty-desc">Create a new task to get started or adjust your filters.</p>
          </div>
        ) : (
          <div className="tasks-container">
            {tasks.map((task) => (
              <div key={task._id} className="glass-card task-item">
                <div className="task-main-info">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleComplete(task)}
                    />
                    <span className="checkmark"></span>
                  </label>

                  <div className="task-details">
                    <h3 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                    
                    <div className="task-meta">
                      <span className={`meta-badge badge-status ${task.status}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      <span className={`meta-badge badge-priority ${task.priority}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="meta-badge badge-date" style={{ color: isOverdue(task) ? 'var(--priority-high)' : 'inherit' }}>
                          <Calendar size={12} style={{ marginRight: '4px' }} />
                          {formatDate(task.dueDate)}
                          {isOverdue(task) && ' (Overdue)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="task-actions">
                  <button className="action-btn" onClick={() => handleOpenEditModal(task)} title="Edit Task">
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn btn-delete" onClick={() => handleDeleteTask(task._id)} title="Delete Task">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Task Creation/Editing Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design homepage layout"
                  className="form-input"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context or details..."
                  className="form-input"
                  maxLength={1000}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="form-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
