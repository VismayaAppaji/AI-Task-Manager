import { useEffect, useMemo, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:8081";

const initialTask = {
  title: "",
  description: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "TODO",
};

function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [tasks, setTasks] = useState([]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [task, setTask] = useState(initialTask);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [editingTask, setEditingTask] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setPage("dashboard");
      getTasks(token);
    }
  }, []);

  // =========================
  // HELPERS
  // =========================

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
  };

  // =========================
  // LOGIN
  // =========================

  const login = async () => {
    if (!loginData.email || !loginData.password) {
      showMessage("Please enter your email and password.", "error");
      return;
    }

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Login failed.", "error");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setPage("dashboard");
      clearMessage();

      getTasks(data.token);
    } catch (error) {
      console.error(error);
      showMessage("Cannot connect to backend.", "error");
    }
  };

  

  // REGISTER
const register = async () => {
  try {
    const response = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    const text = await response.text();

    if (!response.ok) {
  console.log("Registration error:", response.status, text);
  setMessage(text || `Registration failed (${response.status})`);
  return;
}
    setMessage(
      text || "Registration successful. Please login."
    );

    setPage("login");

    setRegisterData({
      name: "",
      email: "",
      password: "",
    });

  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to backend");
  }
};

  // =========================
  // GET TASKS
  // =========================

  const getTasks = async (authToken = token) => {
    try {
      const response = await fetch(`${API}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        showMessage("Failed to load your tasks.", "error");
        return;
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      showMessage("Cannot connect to backend.", "error");
    }
  };

  // =========================
  // CREATE TASK
  // =========================

  const createTask = async () => {
    if (!task.title.trim()) {
      showMessage("Please enter a task title.", "error");
      return;
    }

    try {
      const response = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(
          data.message || "Task creation failed.",
          "error"
        );
        return;
      }

      setTasks((current) => [...current, data]);
      setTask(initialTask);
      setAiResult(null);

      showMessage("Task created successfully.", "success");
    } catch (error) {
      console.error(error);
      showMessage("Cannot connect to backend.", "error");
    }
  };

  // =========================
  // AI GENERATION
  // =========================

  const generateWithAI = async () => {
    if (!task.title.trim()) {
      showMessage("Enter a task title first.", "error");
      return;
    }

    try {
      setAiLoading(true);
      clearMessage();
      setAiResult(null);

      const response = await fetch(
        `${API}/api/ai/generate-task`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: task.title,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(
          data.message || "AI generation failed.",
          "error"
        );
        return;
      }

      setAiResult(data);

      setTask((current) => ({
        ...current,
        description: data.description,
      }));

      showMessage(
        "AI generated your task details.",
        "success"
      );
    } catch (error) {
      console.error(error);
      showMessage("Cannot connect to AI backend.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const startEditing = (taskToEdit) => {
    setEditingTask({
      id: taskToEdit.id,
      title: taskToEdit.title || "",
      description: taskToEdit.description || "",
      dueDate: taskToEdit.dueDate || "",
      priority: taskToEdit.priority || "MEDIUM",
      status: taskToEdit.status || "TODO",
    });

    clearMessage();
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditLoading(false);
  };

  const saveEditedTask = async () => {
    if (!editingTask?.title.trim()) {
      showMessage("Task title cannot be empty.", "error");
      return;
    }

    try {
      setEditLoading(true);

      const response = await fetch(
        `${API}/api/tasks/${editingTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editingTask.title,
            description: editingTask.description,
            dueDate: editingTask.dueDate || null,
            priority: editingTask.priority,
            status: editingTask.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showMessage(
          data.message || "Failed to update task.",
          "error"
        );
        return;
      }

      setTasks((current) =>
        current.map((item) =>
          item.id === editingTask.id ? data : item
        )
      );

      setEditingTask(null);

      showMessage("Task updated successfully.", "success");
    } catch (error) {
      console.error(error);
      showMessage("Cannot connect to backend.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        showMessage("Delete failed.", "error");
        return;
      }

      setTasks((current) =>
        current.filter((item) => item.id !== id)
      );

      showMessage("Task deleted successfully.", "success");
    } catch (error) {
      console.error(error);
      showMessage("Delete failed.", "error");
    }
  };

  // =========================
  // STATUS
  // =========================

  const changeStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API}/api/tasks/${id}/status?status=${status}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        showMessage("Status update failed.", "error");
        return;
      }

      const updatedTask = await response.json();

      setTasks((current) =>
        current.map((item) =>
          item.id === id ? updatedTask : item
        )
      );
    } catch (error) {
      console.error(error);
      showMessage("Status update failed.", "error");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
    setPage("login");
    setTask(initialTask);
    setAiResult(null);
    clearMessage();
  };

  // =========================
  // STATS
  // =========================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (item) => item.status === "DONE"
  ).length;

  const inProgressTasks = tasks.filter(
    (item) => item.status === "IN_PROGRESS"
  ).length;

  const todoTasks = tasks.filter(
    (item) => item.status === "TODO"
  ).length;

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const priorityColor = (priority) => {
    if (priority === "HIGH")
      return "bg-rose-50 text-rose-600 ring-rose-100";

    if (priority === "LOW")
      return "bg-emerald-50 text-emerald-600 ring-emerald-100";

    return "bg-amber-50 text-amber-600 ring-amber-100";
  };

  const statusColor = (status) => {
    if (status === "DONE")
      return "bg-emerald-50 text-emerald-700";

    if (status === "IN_PROGRESS")
      return "bg-blue-50 text-blue-700";

    return "bg-slate-100 text-slate-600";
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.id - a.id);
  }, [tasks]);

  // =========================
  // AUTH SCREEN
  // =========================

  if (page === "login" || page === "register") {
    const isRegister = page === "register";

    return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
        <div className="relative flex min-h-screen overflow-hidden">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl" />
            <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-300/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-200/10 blur-3xl" />
          </div>

          {/* Left branding panel */}
          <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#11131d] p-12 text-white lg:flex">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-xl shadow-lg shadow-violet-500/25">
                  ✦
                </div>

                <div>
                  <div className="font-semibold tracking-tight">
                    TaskFlow
                  </div>
                  <div className="text-xs text-slate-400">
                    AI Workspace
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-lg">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-violet-200 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                AI-powered productivity
              </div>

              <h2 className="font-[Space_Grotesk] text-5xl font-semibold leading-[1.08] tracking-[-2px]">
                Turn ideas into
                <span className="block bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                  organized action.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
                Plan your work, let AI handle the busywork,
                and keep every important task in one focused
                workspace.
              </p>

              <div className="mt-9 grid grid-cols-3 gap-3">
                {[
                  ["AI", "Assisted"],
                  ["CRUD", "Tasks"],
                  ["JWT", "Secure"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                  >
                    <div className="text-lg font-semibold">
                      {value}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 text-xs text-slate-600">
              Built for focused work.
            </div>
          </div>

          {/* Auth form */}
          <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg">
                  ✦
                </div>
                <div className="font-semibold">
                  TaskFlow AI
                </div>
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/90 p-7 shadow-[0_30px_80px_rgba(25,28,45,0.10)] backdrop-blur-xl sm:p-9">
                <div className="mb-8">
                  <div className="mb-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.5px] text-violet-600">
                    {isRegister
                      ? "Get started"
                      : "Welcome back"}
                  </div>

                  <h1 className="font-[Space_Grotesk] text-3xl font-semibold tracking-[-1px]">
                    {isRegister
                      ? "Create your account"
                      : "Welcome back"}
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {isRegister
                      ? "Build your workspace and start managing tasks smarter."
                      : "Sign in to continue to your personal workspace."}
                  </p>
                </div>

                {isRegister && (
                  <div className="mb-5">
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                      Full name
                    </label>

                    <input
                      type="text"
                      placeholder="Your name"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    />
                  </div>
                )}

                <div className="mb-5">
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Email address
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={
                      isRegister
                        ? registerData.email
                        : loginData.email
                    }
                    onChange={(e) => {
                      if (isRegister) {
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        });
                      } else {
                        setLoginData({
                          ...loginData,
                          email: e.target.value,
                        });
                      }
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder={
                      isRegister
                        ? "Create a password"
                        : "••••••••"
                    }
                    value={
                      isRegister
                        ? registerData.password
                        : loginData.password
                    }
                    onChange={(e) => {
                      if (isRegister) {
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        });
                      } else {
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        isRegister ? register() : login();
                      }
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <button
                  onClick={isRegister ? register : login}
                  className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25 active:translate-y-0"
                >
                  {isRegister
                    ? "Create account"
                    : "Sign in"}

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>

                {message && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-center text-xs ${
                      messageType === "error"
                        ? "border-rose-100 bg-rose-50 text-rose-600"
                        : "border-emerald-100 bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div className="mt-7 text-center text-sm text-slate-500">
                  {isRegister
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    className="font-semibold text-violet-600 hover:text-violet-700"
                    onClick={() => {
                      clearMessage();
                      setPage(
                        isRegister ? "login" : "register"
                      );
                    }}
                  >
                    {isRegister
                      ? "Sign in"
                      : "Create one"}
                  </button>
                </div>
              </div>

              <p className="mt-5 text-center text-[11px] text-slate-400">
                Secure workspace • AI assisted • Built with React
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/5 bg-[#11131d] text-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-lg shadow-lg shadow-violet-500/20">
            ✦
          </div>

          <div>
            <div className="font-[Space_Grotesk] text-sm font-semibold">
              TaskFlow
            </div>
            <div className="text-[10px] text-slate-500">
              AI Workspace
            </div>
          </div>
        </div>

        <div className="px-4 pt-7">
          <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[1.5px] text-slate-600">
            Workspace
          </div>

          <div className="space-y-1">
            <div className="flex cursor-default items-center gap-3 rounded-xl bg-violet-500/10 px-3 py-3 text-sm font-medium text-white">
              <span className="text-violet-400">▦</span>
              Dashboard
            </div>

            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500">
              <span>✓</span>
              My Tasks
            </div>

            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500">
              <span>✦</span>
              AI Assistant
            </div>
          </div>
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4 rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              ✦
            </div>

            <div className="text-xs font-semibold">
              AI Powered
            </div>

            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Turn simple ideas into structured tasks.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <span>↪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-64">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8">
            <div>
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[2px] text-violet-500">
                Personal workspace
              </div>

              <h1 className="font-[Space_Grotesk] text-xl font-semibold tracking-tight sm:text-2xl">
                Good to see you back 👋
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-xs font-semibold">
                  Visu
                </div>
                <div className="text-[10px] text-slate-400">
                  Personal workspace
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
                V
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
          {/* MOBILE BRAND */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
              ✦
            </div>
            <div>
              <div className="text-sm font-semibold">
                TaskFlow
              </div>
              <div className="text-[9px] text-slate-400">
                AI Workspace
              </div>
            </div>
          </div>

          {/* STATS */}
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              {
                label: "Total tasks",
                value: totalTasks,
                icon: "▦",
                color: "violet",
              },
              {
                label: "In progress",
                value: inProgressTasks,
                icon: "◷",
                color: "blue",
              },
              {
                label: "Completed",
                value: completedTasks,
                icon: "✓",
                color: "emerald",
              },
              {
                label: "To do",
                value: todoTasks,
                icon: "○",
                color: "amber",
              },
            ].map((stat) => {
              const styles = {
                violet:
                  "bg-violet-50 text-violet-600",
                blue: "bg-blue-50 text-blue-600",
                emerald:
                  "bg-emerald-50 text-emerald-600",
                amber:
                  "bg-amber-50 text-amber-600",
              };

              return (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(30,35,60,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${styles[stat.color]}`}
                    >
                      {stat.icon}
                    </div>

                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-300">
                      Live
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] text-slate-400">
                      {stat.label}
                    </div>

                    <div className="mt-1 font-[Space_Grotesk] text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* PROGRESS */}
          <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(30,35,60,0.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400">
                  Productivity
                </div>

                <h2 className="mt-1 font-[Space_Grotesk] text-lg font-semibold">
                  Your completion progress
                </h2>
              </div>

              <div className="text-2xl font-semibold text-violet-600">
                {completionRate}%
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                style={{
                  width: `${completionRate}%`,
                }}
              />
            </div>
          </section>

          {/* CREATE + AI */}
          <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_0.75fr]">
            {/* CREATE CARD */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(30,35,60,0.05)] sm:p-7">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-[2px] text-violet-500">
                    New task
                  </div>

                  <h2 className="font-[Space_Grotesk] text-2xl font-semibold tracking-tight">
                    Create something productive
                  </h2>

                  <p className="mt-2 max-w-lg text-xs leading-6 text-slate-400">
                    Add the essentials yourself or let AI
                    transform your idea into a structured task.
                  </p>
                </div>

                <div className="hidden rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-violet-600 sm:block">
                  ✦ AI ASSISTED
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Task title
                  </label>

                  <input
                    value={task.title}
                    onChange={(e) =>
                      setTask({
                        ...task,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Prepare final client presentation"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={generateWithAI}
                  disabled={aiLoading}
                  className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 text-sm font-semibold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100 disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-md shadow-violet-500/20">
                    ✦
                  </span>

                  {aiLoading
                    ? "Generating task details..."
                    : "Generate with AI"}

                  {!aiLoading && (
                    <span className="ml-auto mr-4 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Description
                  </label>

                  <textarea
                    value={task.description}
                    onChange={(e) =>
                      setTask({
                        ...task,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe what needs to be done..."
                    className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                {aiResult && (
                  <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/20">
                      ✦
                    </div>

                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-violet-400">
                        AI estimate
                      </div>

                      <div className="mt-1 text-sm font-semibold text-violet-800">
                        {aiResult.estimatedTime}
                      </div>
                    </div>

                    <div className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                      ✓
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                      Due date
                    </label>

                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) =>
                        setTask({
                          ...task,
                          dueDate: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                      Priority
                    </label>

                    <select
                      value={task.priority}
                      onChange={(e) =>
                        setTask({
                          ...task,
                          priority: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">
                        Medium
                      </option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={createTask}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171923] text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <span className="text-lg">＋</span>
                  Add task
                </button>

                {message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-center text-xs ${
                      messageType === "error"
                        ? "border-rose-100 bg-rose-50 text-rose-600"
                        : "border-emerald-100 bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* AI CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-[#181525] p-7 text-white shadow-xl shadow-violet-900/10">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl shadow-xl shadow-violet-900/30">
                  ✦
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[2px] text-violet-300">
                  Intelligent assistant
                </div>

                <h2 className="mt-3 font-[Space_Grotesk] text-3xl font-semibold leading-tight tracking-[-1px]">
                  Let AI handle
                  <span className="block text-violet-300">
                    the busywork.
                  </span>
                </h2>

                <p className="mt-5 text-xs leading-7 text-slate-400">
                  Give your task a simple title and Gemini
                  generates a useful description and effort
                  estimate in seconds.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Smart task descriptions",
                    "Effort estimation",
                    "Faster task creation",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-xs text-slate-300"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Powered by
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    Gemini AI
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TASKS */}
          <section className="mt-9">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[2px] text-violet-500">
                  Workspace
                </div>

                <h2 className="mt-1 font-[Space_Grotesk] text-2xl font-semibold tracking-tight">
                  My tasks
                </h2>
              </div>

              <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                {tasks.length}{" "}
                {tasks.length === 1 ? "task" : "tasks"}
              </div>
            </div>

            {sortedTasks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-xl text-violet-500">
                  ✓
                </div>

                <h3 className="mt-5 font-[Space_Grotesk] text-lg font-semibold">
                  Your workspace is clear
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-400">
                  Create your first task above and start
                  turning your plans into progress.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sortedTasks.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(30,35,60,0.04)] transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ring-1 ${priorityColor(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>

                      <div className="flex gap-1 opacity-60 transition group-hover:opacity-100">
                        <button
                          onClick={() =>
                            startEditing(item)
                          }
                          title="Edit task"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                        >
                          ✎
                        </button>

                        <button
                          onClick={() =>
                            deleteTask(item.id)
                          }
                          title="Delete task"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-5 font-[Space_Grotesk] text-base font-semibold leading-6 text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-xs leading-6 text-slate-400">
                      {item.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>◷</span>
                      {item.dueDate || "No due date"}
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          changeStatus(
                            item.id,
                            e.target.value
                          )
                        }
                        className={`h-9 w-full rounded-lg border-none px-3 text-[10px] font-semibold outline-none ${statusColor(
                          item.status
                        )}`}
                      >
                        <option value="TODO">
                          To Do
                        </option>
                        <option value="IN_PROGRESS">
                          In Progress
                        </option>
                        <option value="DONE">
                          Completed
                        </option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* EDIT MODAL */}
      {editingTask && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={cancelEditing}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[2px] text-violet-500">
                  Edit task
                </div>

                <h2 className="mt-2 font-[Space_Grotesk] text-2xl font-semibold tracking-tight">
                  Update your task
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Make changes and save when you're ready.
                </p>
              </div>

              <button
                onClick={cancelEditing}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Task title
                </label>

                <input
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      title: e.target.value,
                    })
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Description
                </label>

                <textarea
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  className="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Due date
                  </label>

                  <input
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Priority
                  </label>

                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">
                      Medium
                    </option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Status
                </label>

                <select
                  value={editingTask.status}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      status: e.target.value,
                    })
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="DONE">
                    Completed
                  </option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={cancelEditing}
                  disabled={editLoading}
                  className="h-11 rounded-xl bg-slate-100 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEditedTask}
                  disabled={editLoading}
                  className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {editLoading
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;