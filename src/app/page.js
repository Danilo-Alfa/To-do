'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, GripVertical, Check, X, Folder, FolderOpen, ArrowLeft, Settings } from 'lucide-react';

const ProjectTodoList = () => {
  // Função para carregar dados do localStorage
  const loadFromLocalStorage = (key, defaultValue) => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error(`Erro ao carregar ${key} do localStorage:`, error);
      }
    }
    return defaultValue;
  };

  // Estados inicializados com valores vazios primeiro
  const [folders, setFolders] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [currentFolder, setCurrentFolder] = useState(null); // null = view all folders
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Carregar dados do localStorage após montar o componente
  useEffect(() => {
    const loadedFolders = loadFromLocalStorage('todoFolders', []);
    const loadedTasks = loadFromLocalStorage('todoTasks', []);
    setFolders(loadedFolders);
    setTasks(loadedTasks);
  }, []);

  // Salvar pastas no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined' && folders.length >= 0) {
      try {
        localStorage.setItem('todoFolders', JSON.stringify(folders));
      } catch (error) {
        console.error('Erro ao salvar pastas:', error);
      }
    }
  }, [folders]);

  // Salvar tarefas no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length >= 0) {
      try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Erro ao salvar tarefas:', error);
      }
    }
  }, [tasks]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Frontend",
    notes: "",
    folderId: null
  });

  const [newFolder, setNewFolder] = useState({
    name: "",
    description: "",
    color: "blue"
  });

  const categories = ["Design", "Frontend", "Backend", "Testes", "Deploy", "Outros"];
  const folderColors = [
    { name: "blue", class: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "green", class: "bg-green-100 text-green-800 border-green-200" },
    { name: "purple", class: "bg-purple-100 text-purple-800 border-purple-200" },
    { name: "red", class: "bg-red-100 text-red-800 border-red-200" },
    { name: "yellow", class: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { name: "indigo", class: "bg-indigo-100 text-indigo-800 border-indigo-200" }
  ];

  // Filter tasks based on current folder and search
  const getFilteredTasks = () => {
    let filtered = tasks;

    if (currentFolder) {
      filtered = filtered.filter(task => task.folderId === currentFolder.id);
    }

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const addFolder = () => {
    if (newFolder.name.trim()) {
      const folder = {
        id: Date.now(),
        ...newFolder
      };
      setFolders([...folders, folder]);
      setNewFolder({ name: "", description: "", color: "blue" });
      setIsAddingFolder(false);
    }
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        folderId: currentFolder ? currentFolder.id : newTask.folderId,
        ...newTask,
        completed: false
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", description: "", category: "Frontend", notes: "", folderId: null });
      setIsAddingTask(false);
    }
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const updateFolder = (id, updates) => {
    setFolders(folders.map(folder =>
      folder.id === id ? { ...folder, ...updates } : folder
    ));
    if (currentFolder && currentFolder.id === id) {
      setCurrentFolder({ ...currentFolder, ...updates });
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const deleteFolder = (id) => {
    // Delete folder and all its tasks
    setTasks(tasks.filter(task => task.folderId !== id));
    setFolders(folders.filter(folder => folder.id !== id));
    if (currentFolder && currentFolder.id === id) {
      setCurrentFolder(null);
    }
  };

  const toggleComplete = (id) => {
    updateTask(id, { completed: !tasks.find(t => t.id === id).completed });
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (!draggedTask) return;

    const filteredTasks = getFilteredTasks();
    const dragIndex = filteredTasks.findIndex(t => t.id === draggedTask.id);
    if (dragIndex === dropIndex) return;

    const newTasks = [...filteredTasks];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(dropIndex, 0, draggedTask);

    const updatedTasks = [...tasks];
    newTasks.forEach((task, index) => {
      const originalIndex = updatedTasks.findIndex(t => t.id === task.id);
      if (originalIndex !== -1) {
        updatedTasks[originalIndex] = { ...task };
      }
    });

    setTasks(updatedTasks);
    setDraggedTask(null);
  };

  const getFolderStats = (folderId) => {
    const folderTasks = tasks.filter(task => task.folderId === folderId);
    const completed = folderTasks.filter(task => task.completed).length;
    return {
      total: folderTasks.length,
      completed,
      pending: folderTasks.length - completed
    };
  };

  const TaskCard = ({ task, index }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, index)}
      className={`bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-200 cursor-move transform hover:-translate-y-1 ${
        task.completed ? 'opacity-75 bg-gray-50' : ''
      } ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 mt-1">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleComplete(task.id)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              <div className="flex gap-2 mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  task.category === 'Design' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200/50' :
                  task.category === 'Frontend' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200/50' :
                  task.category === 'Backend' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50' :
                  task.category === 'Testes' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200/50' :
                  task.category === 'Deploy' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50' :
                  'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200/50'
                }`}>
                  {task.category}
                </span>
                {!currentFolder && (
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {folders.find(f => f.id === task.folderId)?.name}
                  </span>
                )}
              </div>
              {task.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>Notas:</strong> {task.notes}
                </div>
              )}
            </div>

            <div className="flex gap-1 ml-2">
              <button
                onClick={() => setEditingTask(task)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FolderCard = ({ folder }) => {
    const stats = getFolderStats(folder.id);
    const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    const colorClass = folderColors.find(c => c.name === folder.color)?.class || folderColors[0].class;

    return (
      <div
        className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${colorClass}`}
        onClick={() => setCurrentFolder(folder)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <FolderOpen className="w-8 h-8" />
            <div>
              <h3 className="font-semibold text-lg">{folder.name}</h3>
              <p className="text-sm opacity-80">{folder.description}</p>
            </div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingFolder(folder);
              }}
              className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Excluir a pasta "${folder.name}" e todas suas tarefas?`)) {
                  deleteFolder(folder.id);
                }
              }}
              className="p-1 opacity-60 hover:opacity-100 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{stats.completed} de {stats.total} tarefas</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-black bg-opacity-20 rounded-full h-2">
            <div
              className="bg-current h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {currentFolder && (
              <button
                onClick={() => setCurrentFolder(null)}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {currentFolder ? currentFolder.name : "To do"}
              </h1>
              {currentFolder && (
                <p className="text-gray-600 text-sm">{currentFolder.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!currentFolder && (
              <button
                onClick={() => setIsAddingFolder(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Folder className="w-4 h-4" />
                Nova Pasta
              </button>
            )}
            {currentFolder && (
              <button
                onClick={() => setIsAddingTask(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                Nova Tarefa
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {(currentFolder || filteredTasks.length > 0) && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={currentFolder ? "Buscar tarefas nesta pasta..." : "Buscar em todas as tarefas..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md"
              />
            </div>
          </div>
        )}

        {/* Add Folder Form */}
        {isAddingFolder && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
            <h3 className="font-medium text-gray-900 mb-3">Nova Pasta</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome da pasta"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Descrição da pasta"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor da pasta:</label>
                <div className="flex gap-2">
                  {folderColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setNewFolder({ ...newFolder, color: color.name })}
                      className={`w-8 h-8 rounded-full border-2 ${color.class} ${
                        newFolder.color === color.name ? 'ring-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addFolder}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Criar Pasta
                </button>
                <button
                  onClick={() => {
                    setIsAddingFolder(false);
                    setNewFolder({ name: "", description: "", color: "blue" });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Task Form */}
        {isAddingTask && currentFolder && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
            <h3 className="font-medium text-gray-900 mb-3">Nova Tarefa em: {currentFolder.name}</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título da tarefa"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Descrição"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <textarea
                placeholder="Notas (opcional)"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Adicionar
                </button>
                <button
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTask({ title: "", description: "", category: "Frontend", notes: "", folderId: null });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="font-medium text-gray-900 mb-4">Editar Tarefa</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={editingTask.category}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={editingTask.folderId}
                  onChange={(e) => setEditingTask({ ...editingTask, folderId: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
                <textarea
                  value={editingTask.notes}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      updateTask(editingTask.id, editingTask);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Folder Modal */}
        {editingFolder && (
          <div className="fixed inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-medium text-gray-900 mb-4">Editar Pasta</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={editingFolder.description}
                  onChange={(e) => setEditingFolder({ ...editingFolder, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor da pasta:</label>
                  <div className="flex gap-2">
                    {folderColors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setEditingFolder({ ...editingFolder, color: color.name })}
                        className={`w-8 h-8 rounded-full border-2 ${color.class} ${
                          editingFolder.color === color.name ? 'ring-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      updateFolder(editingFolder.id, editingFolder);
                      setEditingFolder(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingFolder(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {!currentFolder ? (
          // Folders view
          <div>
            {folders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma pasta criada ainda.</p>
                <p className="text-sm">Clique em &quot;Nova Pasta&quot; para começar a organizar suas tarefas!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map(folder => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Tasks view within folder
          <div>
            {/* Statistics for current folder */}
            {(() => {
              const stats = getFolderStats(currentFolder.id);
              return (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-blue-600">Total de Tarefas</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-green-600">Concluídas</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                    <div className="text-sm text-orange-600">Pendentes</div>
                  </div>
                </div>
              );
            })()}

            {/* Task List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhuma tarefa encontrada nesta pasta.' : 'Nenhuma tarefa nesta pasta ainda. Adicione uma nova tarefa!'}
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))
              )}
            </div>

            {/* Progress Bar for current folder */}
            {(() => {
              const stats = getFolderStats(currentFolder.id);
              const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
              return stats.total > 0 ? (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progresso da Pasta: {currentFolder.name}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ProjectTodoList;
