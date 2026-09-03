import { spawn, execSync } from "child_process";

console.log("=================================================");
console.log("🌴 Starting TRACE // GOA Fullstack Dev Environment");
console.log("   Backend:  http://localhost:3000");
console.log("   Frontend: http://localhost:5173");
console.log("=================================================");

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

// Ensure ports 3000 and 5173 are free before starting
const freePort = (port: number) => {
  try {
    if (isWin) {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
      const lines = output.trim().split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0" && !isNaN(Number(pid))) {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
            console.log(`[DevRunner] Cleared lingering process (PID ${pid}) on port ${port}`);
          } catch {}
        }
      }
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: "ignore" });
    }
  } catch {}
};

freePort(3000);
freePort(5173);

// Start Backend Server
const serverProcess = spawn(npmCmd, ["run", "server"], {
  stdio: "inherit",
  shell: isWin,
  env: { ...process.env, PORT: "3000" },
});

// Start Frontend Client (Vite)
const clientProcess = spawn(npmCmd, ["run", "client"], {
  stdio: "inherit",
  shell: isWin,
});

const killProcess = (proc: any) => {
  if (!proc || !proc.pid) return;
  if (isWin) {
    try {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: "ignore" });
    } catch {}
  } else {
    try {
      proc.kill("SIGTERM");
    } catch {}
  }
};

const cleanup = () => {
  killProcess(serverProcess);
  killProcess(clientProcess);
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

