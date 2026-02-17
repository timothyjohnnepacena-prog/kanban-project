'use client';
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  const API = 'http://localhost:8080';

  const fetchData = async () => {
    try {
      const [tRes, lRes] = await Promise.all([
        fetch(`${API}/tasks`),
        fetch(`${API}/logs`)
      ]);
      if (tRes.ok && lRes.ok) {
        setTasks(await tRes.json());
        setLogs(await lRes.json());
        setIsOnline(true);
      }
    } catch (err) {
      setIsOnline(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setTitle('');
    fetchData();
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // 1. Exit immediately if dropped in a void
    if (!destination) return;
    
    // 2. Prevent update if dropped in the same spot
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // 3. PURE LOCAL REORDER (No Async/Await here)
    const newTasks = [...tasks];
    const draggedTask = newTasks.find(t => t._id === draggableId);
    
    // Filter out the old task
    const remainingTasks = newTasks.filter(t => t._id !== draggableId);
    
    // Get column tasks and other tasks
    const columnTasks = remainingTasks.filter(t => t.status === destination.droppableId);
    const otherTasks = remainingTasks.filter(t => t.status !== destination.droppableId);
    
    // Insert into the new local index
    columnTasks.splice(destination.index, 0, { ...draggedTask, status: destination.droppableId });
    
    // Update local state instantly - this allows the animation to finish cleanly
    setTasks([...otherTasks, ...columnTasks]);

    // 4. FIRE AND FORGET SYNC (Don't wait for this!)
    const targetTask = columnTasks[destination.index + 1];
    
    fetch(`${API}/tasks/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: destination.droppableId, 
        targetId: targetTask ? targetTask._id : null 
      }),
    }).catch(err => {
      console.error("Sync error, rolling back...", err);
      fetchData(); // Rollback only if the database fails
    });
  };

  const getColStyle = (col) => {
    switch(col) {
      case 'todo': return { bg: 'bg-blue-100/70', border: 'border-blue-300', text: 'text-blue-800', bar: 'bg-blue-600' };
      case 'in-progress': return { bg: 'bg-amber-100/70', border: 'border-amber-300', text: 'text-amber-800', bar: 'bg-amber-600' };
      case 'done': return { bg: 'bg-emerald-100/70', border: 'border-emerald-300', text: 'text-emerald-800', bar: 'bg-emerald-600' };
    }
  };

  return (
    <div className="h-screen bg-[#ecf7f1] text-[#1e293b] font-sans flex flex-col overflow-hidden">
      <header className="bg-white border-b-4 border-emerald-200 px-10 py-6 shrink-0 shadow-md z-20">
        <div className="w-full flex justify-between items-center gap-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">KANBAN <span className="text-emerald-600">PRO</span></h1>
          <form onSubmit={addTask} className="flex flex-1 max-w-3xl gap-4">
            <input className="flex-1 px-6 py-4 rounded-2xl border-4 border-emerald-100 text-xl font-bold" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Type task..." />
            <button className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-[0_8px_0_rgb(5,150,105)] uppercase">Add</button>
          </form>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="flex flex-1 overflow-hidden p-8 gap-8 w-full h-full">
          <div className="flex-[3] grid grid-cols-3 gap-8 h-full">
            {['todo', 'in-progress', 'done'].map((col) => {
              const style = getColStyle(col);
              return (
                <Droppable droppableId={col} key={col}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className={`${style.bg} rounded-[2.5rem] border-4 ${style.border} flex flex-col overflow-hidden shadow-2xl`}
                    >
                      <div className="p-8 flex justify-between items-center bg-white/40 border-b-4 border-inherit">
                        <h2 className={`uppercase text-sm font-black tracking-[0.25em] ${style.text}`}>{col}</h2>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {tasks.filter(t => t.status === col).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-7 rounded-3xl shadow-md border-2 border-slate-200 flex items-center relative overflow-hidden"
                              >
                                <div className={`absolute left-0 top-0 bottom-0 w-3 ${style.bar}`}></div>
                                <div className="text-slate-300 mr-4">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                </div>
                                <p className="text-xl font-bold text-slate-800 break-words w-full">{task.title}</p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>

          <aside className="flex-1 max-w-[450px] bg-white rounded-[2.5rem] border-4 border-emerald-100 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b-4 bg-emerald-50/30 font-black text-2xl">LIVE FEED</div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/20">
              {logs.map((log) => (
                <div key={log._id} className="p-6 rounded-[1.5rem] bg-white border-2 border-slate-200 shadow-sm text-sm font-bold">{log.details}</div>
              ))}
            </div>
          </aside>
        </main>
      </DragDropContext>
    </div>
  );
}