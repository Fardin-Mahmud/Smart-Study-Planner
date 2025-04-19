import { useState, useEffect } from "react";

const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("studyTasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTask] = useState("");
  const [today, setToday] = useState(getTodayDate());

  useEffect(() => {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, date: today, done: false }]);
      setNewTask("");
    }
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const todayTasks = tasks.filter((task) => task.date === today);

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: "#e6f0fa" }}
    >
      <div className="card shadow-lg" style={{ width: "100%", maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center">
          <h2 className="fw-bold mb-0">📘 Smart Study Planner</h2>
          <small className="text-light">Your daily productivity buddy</small>
        </div>

        <div className="card-body bg-white">
          <div className="mb-4">
            <div className="row g-2">
              <div className="col-md-4">
                <input
                  type="date"
                  className="form-control"
                  value={today}
                  onChange={(e) => setToday(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter a study task"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
              </div>
              <div className="col-md-3 d-grid">
                <button className="btn btn-success" onClick={addTask}>
                  ➕ Add
                </button>
              </div>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center text-muted">✅ No tasks for today!</div>
          ) : (
            <ul className="list-group">
              {todayTasks.map((task, index) => (
                <li
                  key={index}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    task.done ? "list-group-item-success text-decoration-line-through" : ""
                  }`}
                  onClick={() => toggleTask(tasks.indexOf(task))}
                  style={{ cursor: "pointer" }}
                >
                  {task.text}
                  <span
                    className={`badge rounded-pill ${
                      task.done ? "bg-success" : "bg-warning text-dark"
                    }`}
                  >
                    {task.done ? "Done" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-footer bg-light text-center small">
          💡 Tip: Click a task to mark it as done. <br />
          <span className="text-muted">
            Made with ❤️ by <strong>Fardin</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
