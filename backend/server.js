import { spawn } from "node:child_process";

const PORT = process.env.PORT || 3001;

const servidor = spawn(
  "npx",
  ["json-server", "db.json", "--port", String(PORT)],
  {
    stdio: "inherit",
    shell: true
  }
);

servidor.on("close", (codigo) => {
  console.log(`JSON Server finalizado con código: ${codigo}`);
});