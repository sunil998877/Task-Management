"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function Dashboard() {
    const [input, setInput] = useState("");
    const [operation, setOperation] = useState("uppercase");
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks");
            
            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON response received from /api/tasks:", text);
                return;
            }

            if (!res.ok) {
                console.error("API error:", data.error);
                return;
            }

            setTasks(data.tasks || []);
        } catch (e) {
            console.error("Failed to fetch tasks:", e);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 2000);
        return () => clearInterval(interval);
    }, []);

    const createTask = async () => {
        if (!input.trim()) {
            alert("Please enter a word first!");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input, operation }),
            });

            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to create task");
                } else {
                    throw new Error(`Server error (${res.status}). Please check your Vercel logs.`);
                }
            }

            setInput("");
            await fetchTasks();
        } catch (e) {
            alert(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTask = async (id) => {
        try {
            const res = await fetch(`/api/tasks?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await fetchTasks();
            }
        } catch (e) {
            console.error("Failed to delete task:", e);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                router.push("/auth/login");
                router.refresh();
            }
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    const getStatusClass = (status) => {
        if (status === "pending") return styles.statusPending;
        if (status === "running") return styles.statusRunning;
        if (status === "success" || status === "completed") return styles.statusSuccess;
        return "";
    };

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.logo}>TaskHub</div>
                <div className={styles.profileSection}>
                    <div className={styles.userAvatar}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </nav>

            <h1 className={styles.header}>Task Processing Hub</h1>

            <div className={styles.glassCard}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Input Text</label>
                    <input
                        className={styles.input}
                        placeholder="Enter something to process..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createTask()}
                        autoComplete="off"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Operation</label>
                    <select
                        className={styles.select}
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                    >
                        <option value="uppercase">Uppercase Converter</option>
                        <option value="lowercase">Lowercase Converter</option>
                        <option value="reverse">Reverse String</option>
                        <option value="wordcount">Word Count Analyzer</option>
                    </select>
                </div>

                <button
                    className={styles.button}
                    onClick={createTask}
                    disabled={isLoading || !input.trim()}
                >
                    <div className={styles.buttonContent}>
                        {isLoading && <div className={styles.loader} />}
                        <span>{isLoading ? "Queuing Task..." : "Execute Task"}</span>
                    </div>
                </button>
            </div>

            <ul className={styles.taskList}>
                {tasks.map((t) => (
                    <li key={t._id} className={styles.taskItem}>
                        <div className={styles.taskContent}>
                            <div className={styles.taskInput}>"{t.input}"</div>
                            <div className={styles.taskMeta}>
                                <span className={styles.taskOperation}>
                                    {t.operation || 'Standard Processing'}
                                </span>
                                <span className={`${styles.statusBadge} ${getStatusClass(t.status)}`}>
                                    {t.status}
                                </span>
                            </div>
                        </div>
                        <div className={styles.taskActions} >
                            <button
                                className={styles.deleteBtn}
                                onClick={() => deleteTask(t._id)}
                                title="Delete Task"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                            </button>
                        </div>
                        {t.result && (
                            <div className={styles.taskResult}>
                                {t.result}
                            </div>
                        )}
                    </li>
                ))}

                {tasks.length === 0 && (
                    <div className={styles.emptyState}>
                        No tasks found. Submit a job above to see the magic happen!
                    </div>
                )}
            </ul>
        </div>
    );
}
