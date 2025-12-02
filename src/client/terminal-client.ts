import { TerminalController } from "../terminal/terminal";

document.addEventListener("DOMContentLoaded", () => {
  try {
    new TerminalController();
  } catch (error) {
    console.error("Failed to initialize terminal:", error);
    const errorEl = document.getElementById("terminal-output");
    if (errorEl) {
      errorEl.innerHTML = `<div class="output-line output-error">Failed to initialize terminal: ${error}</div>`;
    }
  }
});
