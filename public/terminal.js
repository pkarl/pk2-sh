"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/terminal/aliases.ts
  var AliasManager = class {
    constructor() {
      __publicField(this, "aliases");
      this.aliases = /* @__PURE__ */ new Map();
      this.initializeDefaultAliases();
    }
    /**
     * Initialize default aliases - can be extended by calling setAlias()
     */
    initializeDefaultAliases() {
      this.setAlias("~", "/home/visitor");
      this.setAlias("~visitor", "/home/visitor");
    }
    /**
     * Register a new alias
     * @param alias - The alias string (e.g., "~", "~/bin")
     * @param path - The path it should expand to (e.g., "/home/visitor")
     */
    setAlias(alias, path) {
      this.aliases.set(alias, path);
    }
    /**
     * Look up an alias
     * @param alias - The alias to look up
     * @returns The expanded path or undefined if not found
     */
    getAlias(alias) {
      return this.aliases.get(alias);
    }
    /**
     * Expand an alias in a path
     * Handles both exact matches (~ → /home/visitor) and path-based (~/foo → /home/visitor/foo)
     * @param path - The path potentially containing an alias
     * @returns The expanded path
     */
    expandAlias(path) {
      const sortedAliases = Array.from(this.aliases.entries()).sort(
        (a, b) => b[0].length - a[0].length
      );
      for (const [alias, aliasPath] of sortedAliases) {
        if (path === alias) {
          return aliasPath;
        }
        if (path.startsWith(alias + "/")) {
          return aliasPath + path.slice(alias.length);
        }
      }
      return path;
    }
    /**
     * Reverse expand a path back to an alias if possible
     * Converts /home/visitor → ~ or /home/visitor/foo → ~/foo
     * @param path - The path to potentially convert to an alias
     * @returns The aliased path, or the original path if no alias matches
     */
    reverseExpandAlias(path) {
      const sortedAliases = Array.from(this.aliases.entries()).sort(
        (a, b) => b[1].length - a[1].length
      );
      for (const [alias, aliasPath] of sortedAliases) {
        if (path === aliasPath) {
          return alias;
        }
        if (path.startsWith(aliasPath + "/")) {
          return alias + path.slice(aliasPath.length);
        }
      }
      return path;
    }
    /**
     * Get all registered aliases
     * @returns Map of all aliases
     */
    getAllAliases() {
      return new Map(this.aliases);
    }
    /**
     * Check if a string is an alias
     * @param str - The string to check
     * @returns True if the string is a registered alias
     */
    isAlias(str) {
      return this.aliases.has(str);
    }
  };

  // src/terminal/filesystem.ts
  var VirtualFileSystem = class {
    constructor() {
      __publicField(this, "root");
      __publicField(this, "aliasManager");
      this.root = this.createDirectoryNode("");
      this.aliasManager = new AliasManager();
      this.createNestedDirectory("/bin");
      this.createNestedDirectory("/sbin");
      this.createNestedDirectory("/boot");
      this.createNestedDirectory("/lib");
      this.createNestedDirectory("/lib64");
      this.createNestedDirectory("/etc/init.d");
      this.createNestedDirectory("/etc/systemd");
      this.createNestedDirectory("/etc/network");
      this.createNestedDirectory("/etc/ssh");
      this.createNestedDirectory("/home/visitor");
      this.createNestedDirectory("/root");
      this.createNestedDirectory("/var/log");
      this.createNestedDirectory("/var/tmp");
      this.createNestedDirectory("/var/cache");
      this.createNestedDirectory("/var/www");
      this.createNestedDirectory("/var/mail");
      this.createNestedDirectory("/usr/bin");
      this.createNestedDirectory("/usr/sbin");
      this.createNestedDirectory("/usr/lib");
      this.createNestedDirectory("/usr/local/bin");
      this.createNestedDirectory("/usr/local/lib");
      this.createNestedDirectory("/usr/local/share");
      this.createNestedDirectory("/usr/share/doc");
      this.createNestedDirectory("/usr/share/man");
      this.createNestedDirectory("/tmp");
      this.createNestedDirectory("/opt");
      this.createNestedDirectory("/mnt");
      this.createNestedDirectory("/proc");
      this.createNestedDirectory("/sys");
      this.createNestedDirectory("/dev");
      this.createNestedDirectory("/srv");
    }
    createDirectoryNode(name) {
      return {
        type: "directory",
        name,
        children: /* @__PURE__ */ new Map(),
        permissions: "drwxr-xr-x",
        created: /* @__PURE__ */ new Date(),
        modified: /* @__PURE__ */ new Date()
      };
    }
    createFileNode(name, content = "") {
      return {
        type: "file",
        name,
        content,
        permissions: "-rw-r--r--",
        created: /* @__PURE__ */ new Date(),
        modified: /* @__PURE__ */ new Date()
      };
    }
    createNestedDirectory(path) {
      const parts = path.split("/").filter((p) => p !== "");
      let current = this.root;
      for (const part of parts) {
        if (!current.children.has(part)) {
          const newNode = this.createDirectoryNode(part);
          current.children.set(part, newNode);
        }
        current = current.children.get(part);
      }
      return current;
    }
    /**
     * Register a new alias in the alias manager
     * @param alias - The alias to register
     * @param path - The path it expands to
     */
    setAlias(alias, path) {
      this.aliasManager.setAlias(alias, path);
    }
    /**
     * Look up an alias in the alias manager
     * @param alias - The alias to look up
     * @returns The expanded path or undefined
     */
    getAlias(alias) {
      return this.aliasManager.getAlias(alias);
    }
    /**
     * Expand an alias in a path
     * @param path - The path potentially containing an alias
     * @returns The expanded path
     */
    expandAlias(path) {
      return this.aliasManager.expandAlias(path);
    }
    /**
     * Reverse expand a path to an alias if possible
     * @param path - The path to convert to an alias
     * @returns The aliased version or original path
     */
    reverseExpandAlias(path) {
      return this.aliasManager.reverseExpandAlias(path);
    }
    resolvePath(currentPath, targetPath) {
      targetPath = this.expandAlias(targetPath);
      if (targetPath.startsWith("/")) {
        currentPath = targetPath;
      } else {
        if (currentPath !== "/") {
          currentPath += "/" + targetPath;
        } else {
          currentPath = "/" + targetPath;
        }
      }
      const parts = currentPath.split("/").filter((p) => p !== "");
      const normalized = [];
      for (const part of parts) {
        if (part === ".") {
          continue;
        } else if (part === "..") {
          normalized.pop();
        } else {
          normalized.push(part);
        }
      }
      return "/" + normalized.join("/");
    }
    getNode(path) {
      if (path === "/")
        return this.root;
      const parts = path.split("/").filter((p) => p !== "");
      let current = this.root;
      for (const part of parts) {
        if (current.type !== "directory" || !current.children) {
          return null;
        }
        const next = current.children.get(part);
        if (!next)
          return null;
        current = next;
      }
      return current;
    }
    createDirectory(path) {
      const parts = path.split("/").filter((p) => p !== "");
      if (parts.length === 0)
        return false;
      const name = parts[parts.length - 1];
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = this.getNode(parentPath);
      if (!parent || parent.type !== "directory") {
        return false;
      }
      if (parent.children.has(name)) {
        return false;
      }
      parent.children.set(name, this.createDirectoryNode(name));
      parent.modified = /* @__PURE__ */ new Date();
      return true;
    }
    createFile(path, content = "") {
      const parts = path.split("/").filter((p) => p !== "");
      if (parts.length === 0)
        return false;
      const name = parts[parts.length - 1];
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = this.getNode(parentPath);
      if (!parent || parent.type !== "directory") {
        return false;
      }
      if (parent.children.has(name)) {
        return false;
      }
      parent.children.set(name, this.createFileNode(name, content));
      parent.modified = /* @__PURE__ */ new Date();
      return true;
    }
    listDirectory(path) {
      const node = this.getNode(path);
      if (!node || node.type !== "directory" || !node.children) {
        return [];
      }
      const entries = [];
      entries.push({
        type: "directory",
        name: ".",
        children: /* @__PURE__ */ new Map(),
        permissions: "drwxr-xr-x",
        created: node.created,
        modified: node.modified
      });
      entries.push({
        type: "directory",
        name: "..",
        children: /* @__PURE__ */ new Map(),
        permissions: "drwxr-xr-x",
        created: this.root.created,
        modified: this.root.modified
      });
      entries.push(...Array.from(node.children.values()));
      return entries;
    }
    changeDirectory(currentPath, targetPath) {
      const newPath = this.resolvePath(currentPath, targetPath);
      const node = this.getNode(newPath);
      if (!node) {
        return { error: `cd: ${targetPath}: No such file or directory` };
      }
      if (node.type !== "directory") {
        return { error: `cd: ${targetPath}: Not a directory` };
      }
      return newPath;
    }
    deleteNode(path) {
      if (path === "/")
        return false;
      const parts = path.split("/").filter((p) => p !== "");
      const name = parts[parts.length - 1];
      const parentPath = "/" + parts.slice(0, -1).join("/");
      const parent = this.getNode(parentPath);
      if (!parent || parent.type !== "directory") {
        return false;
      }
      const hasChild = parent.children.has(name);
      if (hasChild) {
        parent.children.delete(name);
        parent.modified = /* @__PURE__ */ new Date();
        return true;
      }
      return false;
    }
    readFile(path) {
      const node = this.getNode(path);
      if (!node || node.type !== "file") {
        return null;
      }
      return node.content || "";
    }
    /**
     * Get a display-friendly version of a path
     * Converts paths to their alias equivalents if available
     * @param currentPath - The path to display
     * @returns The path or its alias equivalent
     */
    getPathDisplay(currentPath) {
      return this.reverseExpandAlias(currentPath);
    }
  };

  // src/terminal/parser.ts
  function parseCommand(input) {
    const trimmed = input.trim();
    if (!trimmed) {
      return { command: "", args: [], flags: {} };
    }
    const tokens = tokenize(trimmed);
    const command = tokens[0] || "";
    const args = [];
    const flags = {};
    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.startsWith("--")) {
        const [flagName, value] = token.slice(2).split("=", 2);
        flags[flagName] = value !== void 0 ? value : true;
      } else if (token.startsWith("-") && token.length > 1 && token !== "-") {
        const flagChars = token.slice(1);
        if (flagChars.includes("=")) {
          const [flagPart, value] = flagChars.split("=", 2);
          for (const char of flagPart) {
            flags[char] = true;
          }
          if (value) {
            flags[flagPart] = value;
          }
        } else {
          for (const char of flagChars) {
            flags[char] = true;
          }
        }
      } else {
        args.push(token);
      }
    }
    return { command, args, flags };
  }
  function tokenize(input) {
    const tokens = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const nextChar = input[i + 1];
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = "";
      } else if (!inQuotes && char === " ") {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }
    if (current) {
      tokens.push(current);
    }
    return tokens;
  }

  // src/terminal/commands.ts
  function formatDate(date) {
    const now = /* @__PURE__ */ new Date();
    const isThisYear = date.getFullYear() === now.getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, " ");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const year = date.getFullYear();
    if (isThisYear) {
      return `${month} ${day} ${hours}:${minutes}`;
    } else {
      return `${month} ${day}  ${year}`;
    }
  }
  var commands = {
    pwd: (args, flags, fs, currentPath) => {
      return {
        output: currentPath
      };
    },
    ls: (args, flags, fs, currentPath) => {
      const targetPath = args.length > 0 ? fs.resolvePath(currentPath, args[0]) : currentPath;
      const nodes = fs.listDirectory(targetPath);
      if (nodes.length === 0) {
        return { output: "" };
      }
      const showLong = flags["l"];
      const showHidden = flags["a"];
      if (showLong) {
        let output = "";
        for (const node of nodes) {
          if (!showHidden && node.name.startsWith("."))
            continue;
          const permissions = node.permissions;
          const size = String(node.content?.length || 0).padStart(5, " ");
          const dateStr = formatDate(node.modified);
          const name = node.type === "directory" && node.name !== "." && node.name !== ".." ? node.name + "/" : node.name;
          output += `${permissions} user group ${size} ${dateStr} ${name}
`;
        }
        return { output: output.trimEnd() };
      } else {
        let output = "";
        for (const node of nodes) {
          if (!showHidden && node.name.startsWith("."))
            continue;
          const name = node.type === "directory" && node.name !== "." && node.name !== ".." ? node.name + "/" : node.name;
          output += name + "\n";
        }
        return { output: output.trimEnd() };
      }
    },
    cd: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { newPath: "/home/visitor" };
      }
      const result = fs.changeDirectory(currentPath, args[0]);
      if (typeof result === "string") {
        return { newPath: result };
      } else {
        return { error: result.error };
      }
    },
    mkdir: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "mkdir: missing operand" };
      }
      const createParents = flags["p"];
      const paths = args;
      for (const path of paths) {
        const fullPath = fs.resolvePath(currentPath, path);
        const parts = fullPath.split("/").filter((p) => p !== "");
        if (createParents) {
          let current = "";
          for (const part of parts) {
            current = current === "" ? "/" + part : current + "/" + part;
            fs.createDirectory(current);
          }
        } else {
          if (!fs.createDirectory(fullPath)) {
            return {
              error: `mkdir: cannot create directory '${path}': File exists`
            };
          }
        }
      }
      return { output: "" };
    },
    touch: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "touch: missing operand" };
      }
      for (const arg of args) {
        const fullPath = fs.resolvePath(currentPath, arg);
        if (!fs.createFile(fullPath)) {
          return { error: `touch: cannot create '${arg}': File exists` };
        }
      }
      return { output: "" };
    },
    cat: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "cat: missing operand" };
      }
      let output = "";
      for (const arg of args) {
        const fullPath = fs.resolvePath(currentPath, arg);
        const content = fs.readFile(fullPath);
        if (content === null) {
          return { error: `cat: ${arg}: No such file or directory` };
        }
        output += content;
        if (!content.endsWith("\n") && args.indexOf(arg) < args.length - 1) {
          output += "\n";
        }
      }
      return { output: output.trimEnd() };
    },
    rm: (args, flags, fs, currentPath) => {
      if (args.length === 0) {
        return { error: "rm: missing operand" };
      }
      const recursive = flags["r"] || flags["R"];
      for (const arg of args) {
        const fullPath = fs.resolvePath(currentPath, arg);
        const node = fs.getNode(fullPath);
        if (!node) {
          return { error: `rm: cannot remove '${arg}': No such file or directory` };
        }
        if (node.type === "directory" && !recursive) {
          return {
            error: `rm: cannot remove '${arg}': Is a directory`
          };
        }
        if (!fs.deleteNode(fullPath)) {
          return { error: `rm: cannot remove '${arg}'` };
        }
      }
      return { output: "" };
    },
    clear: (args, flags, fs, currentPath) => {
      return { output: "__CLEAR__" };
    },
    help: (args, flags, fs, currentPath) => {
      const output = `Available commands:
  pwd              Print working directory
  ls [path]        List directory contents (use -l for long format, -a for all)
  cd [path]        Change directory
  mkdir [dir]      Make directory (use -p for parents)
  touch [file]     Create empty file
  cat [file]       Display file contents
  rm [file]        Remove file (use -r for directories)
  echo [text]      Print text
  clear            Clear terminal
  help             Show this help message`;
      return { output };
    },
    echo: (args, flags, fs, currentPath) => {
      const output = args.join(" ");
      return { output };
    }
  };
  function executeCommand(command, args, flags, fs, currentPath) {
    const handler = commands[command];
    if (!handler) {
      return { error: `pk2sh: command not found: ${command}` };
    }
    return handler(args, flags, fs, currentPath);
  }

  // src/terminal/terminal.ts
  var TerminalController = class {
    constructor() {
      __publicField(this, "filesystem");
      __publicField(this, "currentPath", "/home/visitor");
      __publicField(this, "commandHistory", []);
      __publicField(this, "historyIndex", 0);
      __publicField(this, "currentInput", "");
      __publicField(this, "multilineMode", false);
      __publicField(this, "multilineBuffer", []);
      __publicField(this, "outputElement");
      __publicField(this, "currentPromptLine", null);
      __publicField(this, "maxHistory", 100);
      this.filesystem = new VirtualFileSystem();
      this.outputElement = document.getElementById("terminal-output");
      if (!this.outputElement) {
        throw new Error("Terminal output element not found in DOM");
      }
      this.initialize();
    }
    initialize() {
      this.showPrompt();
      document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    }
    handleKeyDown(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        this.handleEnter();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.navigateHistory("up");
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.navigateHistory("down");
      } else if (event.key === "Backspace") {
        event.preventDefault();
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateInputDisplay();
      } else if (event.key === "Control" || event.key === "Ctrl") {
      } else if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        this.handleCtrlC();
      } else if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        this.clearOutput();
        this.showPrompt();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        this.currentInput += event.key;
        this.updateInputDisplay();
      }
    }
    handleEnter() {
      if (this.multilineMode) {
        if (this.currentInput.endsWith("\\")) {
          this.multilineBuffer.push(this.currentInput.slice(0, -1));
          this.currentInput = "";
          this.updateInputDisplay();
          this.updatePromptText("> ");
        } else {
          this.multilineBuffer.push(this.currentInput);
          const fullCommand = this.multilineBuffer.join(" ");
          this.multilineMode = false;
          this.multilineBuffer = [];
          this.currentInput = "";
          this.executeCommand(fullCommand);
          this.showPrompt();
        }
      } else {
        if (this.currentInput.endsWith("\\")) {
          this.multilineMode = true;
          this.multilineBuffer = [this.currentInput.slice(0, -1)];
          this.currentInput = "";
          this.updateInputDisplay();
          this.updatePromptText("> ");
        } else {
          if (this.currentInput.trim()) {
            this.addToHistory(this.currentInput);
          }
          this.executeCommand(this.currentInput);
          this.currentInput = "";
          this.showPrompt();
        }
      }
    }
    handleCtrlC() {
      if (this.multilineMode) {
        this.multilineMode = false;
        this.multilineBuffer = [];
        this.currentInput = "";
        this.updateInputDisplay();
        this.showPrompt();
      } else if (this.currentInput) {
        this.currentInput = "";
        this.updateInputDisplay();
        this.showPrompt();
      }
    }
    executeCommand(input) {
      if (!input.trim()) {
        return;
      }
      const parsed = parseCommand(input);
      const result = executeCommand(
        parsed.command,
        parsed.args,
        parsed.flags,
        this.filesystem,
        this.currentPath
      );
      if (result.error) {
        this.addOutput(result.error, "error");
      } else if (result.output) {
        if (result.output === "__CLEAR__") {
          this.clearOutput();
        } else {
          this.addOutput(result.output, "info");
        }
      }
      if (result.newPath) {
        this.currentPath = result.newPath;
      }
    }
    addOutput(text, type) {
      const line = document.createElement("div");
      line.className = `output-line output-${type}`;
      line.textContent = text;
      this.outputElement.appendChild(line);
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    clearOutput() {
      this.outputElement.innerHTML = "";
    }
    showPrompt() {
      this.currentInput = "";
      this.historyIndex = this.commandHistory.length;
      if (this.currentPromptLine) {
        const oldCursor = this.currentPromptLine.querySelector(".cursor");
        if (oldCursor) {
          oldCursor.remove();
        }
      }
      const promptLine = document.createElement("div");
      promptLine.className = "prompt-line";
      const promptSpan = document.createElement("span");
      promptSpan.className = "prompt-text";
      const displayPath = this.filesystem.getPathDisplay(this.currentPath);
      promptSpan.textContent = `visitor@terminal:${displayPath}$ `;
      const inputSpan = document.createElement("span");
      inputSpan.className = "input-text";
      inputSpan.textContent = "";
      const cursorSpan = document.createElement("span");
      cursorSpan.className = "cursor";
      cursorSpan.textContent = "_";
      promptLine.appendChild(promptSpan);
      promptLine.appendChild(inputSpan);
      promptLine.appendChild(cursorSpan);
      this.outputElement.appendChild(promptLine);
      this.currentPromptLine = promptLine;
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    updatePromptText(promptText) {
      if (this.currentPromptLine) {
        const promptSpan = this.currentPromptLine.querySelector(".prompt-text");
        if (promptSpan) {
          promptSpan.textContent = promptText + " ";
        }
      }
    }
    updateInputDisplay() {
      if (this.currentPromptLine) {
        const inputSpan = this.currentPromptLine.querySelector(".input-text");
        if (inputSpan) {
          inputSpan.textContent = this.currentInput;
        }
      }
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
    navigateHistory(direction) {
      if (direction === "up") {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.currentInput = this.commandHistory[this.historyIndex];
        }
      } else {
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.currentInput = this.commandHistory[this.historyIndex];
        } else if (this.historyIndex === this.commandHistory.length - 1) {
          this.historyIndex++;
          this.currentInput = "";
        }
      }
      this.updateInputDisplay();
    }
    addToHistory(command) {
      this.commandHistory.push(command);
      if (this.commandHistory.length > this.maxHistory) {
        this.commandHistory.shift();
      }
      this.historyIndex = this.commandHistory.length;
    }
  };

  // src/client/terminal-client.ts
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
})();
