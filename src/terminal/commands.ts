import { VirtualFileSystem } from "./filesystem";

export interface CommandResult {
  output: string;
  error?: string;
  newPath?: string;
  exit?: boolean;
}

export type CommandHandler = (
  args: string[],
  flags: Record<string, boolean | string>,
  fs: VirtualFileSystem,
  currentPath: string,
  context?: CommandContext
) => CommandResult | Promise<CommandResult>;

export interface CommandContext {
  commandHistory: string[];
  envVars: Map<string, string>;
  startTime: Date;
  clearHistory?: () => void;
}

function padRight(str: string, width: number): string {
  return str + " ".repeat(Math.max(0, width - str.length));
}

function formatDate(date: Date): string {
  const now = new Date();
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
    "Dec",
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

function formatFullDate(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  const dayName = days[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const year = date.getFullYear();
  const timezone = "UTC";
  
  return `${dayName} ${month} ${day} ${hours}:${minutes}:${seconds} ${timezone} ${year}`;
}

function formatUptime(startTime: Date): string {
  const now = new Date();
  const diff = now.getTime() - startTime.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `up ${days} day${days > 1 ? "s" : ""}, ${hours % 24}:${String(minutes % 60).padStart(2, "0")}`;
  } else if (hours > 0) {
    return `up ${hours}:${String(minutes % 60).padStart(2, "0")}`;
  } else {
    return `up ${minutes} min`;
  }
}

export const commands: Record<string, CommandHandler> = {
  pwd: (args, flags, fs, currentPath) => {
    return {
      output: currentPath,
    };
  },

  ls: (args, flags, fs, currentPath) => {
    const targetPath =
      args.length > 0 ? fs.resolvePath(currentPath, args[0]) : currentPath;
    const nodes = fs.listDirectory(targetPath);

    if (nodes.length === 0) {
      return { output: "" };
    }

    const showLong = flags["l"];
    const showHidden = flags["a"];

    if (showLong) {
      // Long format
      let output = "";
      for (const node of nodes) {
        if (!showHidden && node.name.startsWith(".")) continue;

        const permissions = node.permissions;
        const size = String(node.content?.length || 0).padStart(5, " ");
        const dateStr = formatDate(node.modified);
        // Don't add / suffix to . and ..
        const name =
          node.type === "directory" && node.name !== "." && node.name !== ".."
            ? node.name + "/"
            : node.name;

        output +=
          `${permissions} user group ${size} ${dateStr} ${name}` + "\n";
      }
      return { output: output.trimEnd() };
    } else {
      // Short format
      let output = "";
      for (const node of nodes) {
        if (!showHidden && node.name.startsWith(".")) continue;

        // Don't add / suffix to . and ..
        const name =
          node.type === "directory" && node.name !== "." && node.name !== ".."
            ? node.name + "/"
            : node.name;
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
        // Create all parent directories
        let current = "";
        for (const part of parts) {
          current = current === "" ? "/" + part : current + "/" + part;
          fs.createDirectory(current);
        }
      } else {
        // Only create the final directory
        if (!fs.createDirectory(fullPath)) {
          return {
            error: `mkdir: cannot create directory '${path}': File exists`,
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
      const node = fs.getNode(fullPath);

      if (!node) {
        return { error: `cat: ${arg}: No such file or directory` };
      }

      if (node.type === "directory") {
        return { error: `cat: ${arg}: Is a directory` };
      }

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
          error: `rm: cannot remove '${arg}': Is a directory`,
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
    const output = `Ubuntu Server Terminal Emulator - Available Commands

FILE OPERATIONS:
  ls [path]        List directory contents (-l long, -a all)
  cd [path]        Change directory
  pwd              Print working directory
  mkdir [dir]      Make directory (-p for parents)
  touch [file]     Create empty file
  cat [file]       Display file contents
  cp src dest      Copy files (-r recursive)
  mv src dest      Move/rename files
  rm [file]        Remove file (-r for directories)
  head [file]      Show first lines (-n count)
  tail [file]      Show last lines (-n count)
  wc [file]        Word/line/byte count (-l -w -c)
  find [path]      Find files (-name pattern, -type f/d)
  file [file]      Determine file type
  stat [file]      Display file status
  diff f1 f2       Compare files

TEXT PROCESSING:
  echo [text]      Print text
  grep pat file    Search in files (-i -n -v -c)
  sort [file]      Sort lines (-r -n -u)
  uniq [file]      Remove duplicates (-c -d -u)
  cut [file]       Cut columns (-d delim -f fields)
  rev [file]       Reverse lines
  tac [file]       Reverse file

SYSTEM INFORMATION:
  whoami           Display current user
  hostname         Display hostname
  uname            System info (-a for all)
  date             Display date/time
  id               Display user/group IDs
  uptime           System uptime
  ps               Process list (aux for all)
  top              System monitor
  free             Memory info (-h human readable)
  df               Disk space (-h human readable)
  du [path]        Directory usage (-h -s)
  lscpu            CPU information
  lsblk            Block devices
  arch             Machine architecture
  nproc            Number of processors

ENVIRONMENT:
  env              Show environment variables
  printenv [var]   Print environment variable
  export [var=val] Set environment variable
  history          Command history

COMMAND INFO:
  which [cmd]      Locate command
  whereis [cmd]    Locate command files
  type [cmd]       Display command type
  man [cmd]        Manual pages
  alias            Show aliases

NETWORKING (simulated):
  ifconfig         Network interfaces
  ip [addr|route]  IP configuration
  ping [host]      Test connectivity
  netstat          Network statistics
  ss               Socket statistics
  curl [url]       HTTP client
  wget [url]       Download files
  ssh [host]       SSH client
  scp              Secure copy

SYSTEM ADMIN (simulated):
  sudo [cmd]       Run as superuser
  chmod mode file  Change permissions
  chown user file  Change ownership
  mount            Show mounts
  fdisk -l         Disk partitions
  systemctl        Service management
  apt              Package management

UTILITIES:
  clear            Clear terminal
  exit/logout      Exit terminal
  cal              Calendar
  seq [n]          Print sequence
  expr             Evaluate expression
  factor [n]       Prime factors
  basename [path]  Strip directory
  dirname [path]   Strip filename
  realpath [path]  Resolve path

Type 'man <command>' for more details on specific commands.`;

    return { output };
  },

  echo: (args, flags, fs, currentPath) => {
    const output = args.join(" ");
    return { output };
  },

  whoami: (args, flags, fs, currentPath) => {
    return { output: "visitor" };
  },

  hostname: (args, flags, fs, currentPath) => {
    const hostnameContent = fs.readFile("/etc/hostname");
    return { output: hostnameContent?.trim() || "pk2-server" };
  },

  uname: (args, flags, fs, currentPath) => {
    const sysname = "Linux";
    const nodename = fs.readFile("/etc/hostname")?.trim() || "pk2-server";
    const release = "5.15.0-generic";
    const version = "#1 SMP Ubuntu";
    const machine = "x86_64";
    const processor = "x86_64";
    const platform = "x86_64";
    const os = "GNU/Linux";

    if (flags["a"]) {
      return { output: `${sysname} ${nodename} ${release} ${version} ${machine} ${processor} ${platform} ${os}` };
    }
    if (flags["s"]) return { output: sysname };
    if (flags["n"]) return { output: nodename };
    if (flags["r"]) return { output: release };
    if (flags["v"]) return { output: version };
    if (flags["m"]) return { output: machine };
    if (flags["p"]) return { output: processor };
    if (flags["i"]) return { output: platform };
    if (flags["o"]) return { output: os };
    
    return { output: sysname };
  },

  date: (args, flags, fs, currentPath) => {
    return { output: formatFullDate(new Date()) };
  },

  id: (args, flags, fs, currentPath) => {
    return { output: "uid=1000(visitor) gid=1000(visitor) groups=1000(visitor),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev)" };
  },

  env: (args, flags, fs, currentPath, context) => {
    if (!context?.envVars) {
      return { output: "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOME=/home/visitor\nUSER=visitor\nSHELL=/bin/bash\nPWD=" + currentPath };
    }
    let output = "";
    for (const [key, value] of context.envVars) {
      output += `${key}=${value}\n`;
    }
    return { output: output.trimEnd() };
  },

  printenv: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return commands.env(args, flags, fs, currentPath, context);
    }
    const varName = args[0];
    const value = context?.envVars?.get(varName);
    if (value) {
      return { output: value };
    }
    const defaults: Record<string, string> = {
      PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      HOME: "/home/visitor",
      USER: "visitor",
      SHELL: "/bin/bash",
      PWD: currentPath,
    };
    if (defaults[varName]) {
      return { output: defaults[varName] };
    }
    return { output: "" };
  },

  export: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return commands.env(args, flags, fs, currentPath, context);
    }
    return { output: "" };
  },

  history: (args, flags, fs, currentPath, context) => {
    if (flags["c"]) {
      context?.clearHistory?.();
      return { output: "" };
    }
    if (!context?.commandHistory || context.commandHistory.length === 0) {
      return { output: "" };
    }
    let output = "";
    const history = context.commandHistory;
    const start = Math.max(0, history.length - 20);
    for (let i = start; i < history.length; i++) {
      output += `  ${String(i + 1).padStart(4, " ")}  ${history[i]}\n`;
    }
    return { output: output.trimEnd() };
  },

  which: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "" };
    }
    const cmd = args[0];
    const availableCommands = Object.keys(commands);
    if (availableCommands.includes(cmd)) {
      return { output: `/usr/bin/${cmd}` };
    }
    return { error: `which: no ${cmd} in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)` };
  },

  whereis: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "" };
    }
    const cmd = args[0];
    const availableCommands = Object.keys(commands);
    if (availableCommands.includes(cmd)) {
      return { output: `${cmd}: /usr/bin/${cmd}` };
    }
    return { output: `${cmd}:` };
  },

  cp: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "cp: missing file operand" };
    }
    const recursive = flags["r"] || flags["R"];
    const source = fs.resolvePath(currentPath, args[0]);
    const dest = fs.resolvePath(currentPath, args[1]);
    
    const sourceNode = fs.getNode(source);
    if (!sourceNode) {
      return { error: `cp: cannot stat '${args[0]}': No such file or directory` };
    }
    
    if (sourceNode.type === "directory" && !recursive) {
      return { error: `cp: -r not specified; omitting directory '${args[0]}'` };
    }
    
    if (sourceNode.type === "file") {
      const content = fs.readFile(source) || "";
      if (!fs.createFile(dest, content)) {
        const destNode = fs.getNode(dest);
        if (destNode?.type === "directory") {
          const fileName = source.split("/").pop() || "";
          fs.createFile(dest + "/" + fileName, content);
        }
      }
    }
    
    return { output: "" };
  },

  mv: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "mv: missing file operand" };
    }
    const source = fs.resolvePath(currentPath, args[0]);
    const dest = fs.resolvePath(currentPath, args[1]);
    
    const sourceNode = fs.getNode(source);
    if (!sourceNode) {
      return { error: `mv: cannot stat '${args[0]}': No such file or directory` };
    }
    
    if (sourceNode.type === "file") {
      const content = fs.readFile(source) || "";
      const destNode = fs.getNode(dest);
      if (destNode?.type === "directory") {
        const fileName = source.split("/").pop() || "";
        fs.createFile(dest + "/" + fileName, content);
      } else {
        fs.createFile(dest, content);
      }
      fs.deleteNode(source);
    } else {
      return { error: `mv: cannot move '${args[0]}': Directory move not supported` };
    }
    
    return { output: "" };
  },

  head: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "head: missing file operand" };
    }
    const lines = typeof flags["n"] === "string" ? parseInt(flags["n"], 10) : 10;
    const filePath = fs.resolvePath(currentPath, args[0]);
    const content = fs.readFile(filePath);
    
    if (content === null) {
      return { error: `head: cannot open '${args[0]}' for reading: No such file or directory` };
    }
    
    const fileLines = content.split("\n");
    return { output: fileLines.slice(0, lines).join("\n") };
  },

  tail: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "tail: missing file operand" };
    }
    const lines = typeof flags["n"] === "string" ? parseInt(flags["n"], 10) : 10;
    const filePath = fs.resolvePath(currentPath, args[0]);
    const content = fs.readFile(filePath);
    
    if (content === null) {
      return { error: `tail: cannot open '${args[0]}' for reading: No such file or directory` };
    }
    
    const fileLines = content.split("\n");
    return { output: fileLines.slice(-lines).join("\n") };
  },

  wc: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "wc: missing file operand" };
    }
    
    let totalLines = 0;
    let totalWords = 0;
    let totalBytes = 0;
    let output = "";
    
    for (const arg of args) {
      const filePath = fs.resolvePath(currentPath, arg);
      const content = fs.readFile(filePath);
      
      if (content === null) {
        return { error: `wc: ${arg}: No such file or directory` };
      }
      
      const lines = content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
      const words = content.split(/\s+/).filter(w => w.length > 0).length;
      const bytes = content.length;
      
      totalLines += lines;
      totalWords += words;
      totalBytes += bytes;
      
      if (flags["l"]) {
        output += `${lines} ${arg}\n`;
      } else if (flags["w"]) {
        output += `${words} ${arg}\n`;
      } else if (flags["c"]) {
        output += `${bytes} ${arg}\n`;
      } else {
        output += `  ${String(lines).padStart(6, " ")} ${String(words).padStart(6, " ")} ${String(bytes).padStart(6, " ")} ${arg}\n`;
      }
    }
    
    if (args.length > 1) {
      if (flags["l"]) {
        output += `${totalLines} total`;
      } else if (flags["w"]) {
        output += `${totalWords} total`;
      } else if (flags["c"]) {
        output += `${totalBytes} total`;
      } else {
        output += `  ${String(totalLines).padStart(6, " ")} ${String(totalWords).padStart(6, " ")} ${String(totalBytes).padStart(6, " ")} total`;
      }
    }
    
    return { output: output.trimEnd() };
  },

  exit: (args, flags, fs, currentPath) => {
    return { output: "logout", exit: true };
  },

  logout: (args, flags, fs, currentPath) => {
    return { output: "logout", exit: true };
  },

  uptime: (args, flags, fs, currentPath, context) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const uptimeStr = context?.startTime ? formatUptime(context.startTime) : "up 0 min";
    return { output: ` ${hours}:${minutes}:${seconds} ${uptimeStr},  1 user,  load average: 0.00, 0.00, 0.00` };
  },

  df: (args, flags, fs, currentPath) => {
    const human = flags["h"];
    if (human) {
      return { output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   12G   35G  26% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
/dev/sda2       100G   45G   50G  48% /home` };
    }
    return { output: `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 12582912  36700160  26% /
tmpfs            2097152        0   2097152   0% /dev/shm
/dev/sda2      104857600 47185920  52428800  48% /home` };
  },

  du: (args, flags, fs, currentPath) => {
    const targetPath = args.length > 0 ? fs.resolvePath(currentPath, args[0]) : currentPath;
    const human = flags["h"];
    const summary = flags["s"];
    
    const node = fs.getNode(targetPath);
    if (!node) {
      return { error: `du: cannot access '${args[0] || "."}': No such file or directory` };
    }
    
    if (summary) {
      return { output: human ? "4.0K\t" + targetPath : "4\t" + targetPath };
    }
    
    return { output: human ? "4.0K\t" + targetPath : "4\t" + targetPath };
  },

  free: (args, flags, fs, currentPath) => {
    const human = flags["h"];
    if (human) {
      return { output: `              total        used        free      shared  buff/cache   available
Mem:          3.8Gi       1.2Gi       1.5Gi        64Mi       1.1Gi       2.3Gi
Swap:         2.0Gi          0B       2.0Gi` };
    }
    return { output: `              total        used        free      shared  buff/cache   available
Mem:        4000000     1200000     1500000       64000     1100000     2300000
Swap:       2097152           0     2097152` };
  },

  ps: (args, flags, fs, currentPath) => {
    const aux = flags["a"] || flags["aux"];
    if (aux) {
      return { output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 169936 11200 ?        Ss   00:00   0:01 /sbin/init
root         2  0.0  0.0      0     0 ?        S    00:00   0:00 [kthreadd]
visitor   1000  0.0  0.1  21464  5120 pts/0    Ss   00:00   0:00 -bash
visitor   1001  0.0  0.0  38384  3456 pts/0    R+   00:00   0:00 ps aux` };
    }
    return { output: `  PID TTY          TIME CMD
 1000 pts/0    00:00:00 bash
 1001 pts/0    00:00:00 ps` };
  },

  top: (args, flags, fs, currentPath, context) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const uptimeStr = context?.startTime ? formatUptime(context.startTime) : "up 0 min";
    return { output: `top - ${hours}:${minutes}:${seconds} ${uptimeStr},  1 user,  load average: 0.00, 0.00, 0.00
Tasks:   4 total,   1 running,   3 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.3 us,  0.1 sy,  0.0 ni, 99.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   3906.2 total,   1536.0 free,   1200.0 used,   1170.2 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   2400.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  169936  11200   8320 S   0.0   0.3   0:01.00 init
 1000 visitor   20   0   21464   5120   3456 S   0.0   0.1   0:00.10 bash
 1001 visitor   20   0   38384   3456   2944 R   0.0   0.1   0:00.00 top` };
  },

  htop: (args, flags, fs, currentPath, context) => {
    return commands.top(args, flags, fs, currentPath, context);
  },

  chmod: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "chmod: missing operand" };
    }
    const node = fs.getNode(fs.resolvePath(currentPath, args[1]));
    if (!node) {
      return { error: `chmod: cannot access '${args[1]}': No such file or directory` };
    }
    return { output: "" };
  },

  chown: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "chown: missing operand" };
    }
    const node = fs.getNode(fs.resolvePath(currentPath, args[1]));
    if (!node) {
      return { error: `chown: cannot access '${args[1]}': No such file or directory` };
    }
    return { output: "" };
  },

  grep: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "grep: missing pattern or file operand" };
    }
    
    const pattern = args[0];
    const ignoreCase = flags["i"];
    const lineNumbers = flags["n"];
    const invertMatch = flags["v"];
    const countOnly = flags["c"];
    
    let output = "";
    let matchCount = 0;
    
    for (let i = 1; i < args.length; i++) {
      const filePath = fs.resolvePath(currentPath, args[i]);
      const content = fs.readFile(filePath);
      
      if (content === null) {
        return { error: `grep: ${args[i]}: No such file or directory` };
      }
      
      const lines = content.split("\n");
      const regex = new RegExp(pattern, ignoreCase ? "i" : "");
      
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const matches = regex.test(line);
        const shouldInclude = invertMatch ? !matches : matches;
        
        if (shouldInclude) {
          matchCount++;
          if (!countOnly) {
            const prefix = args.length > 2 ? `${args[i]}:` : "";
            const linePrefix = lineNumbers ? `${lineNum + 1}:` : "";
            output += `${prefix}${linePrefix}${line}\n`;
          }
        }
      }
    }
    
    if (countOnly) {
      return { output: String(matchCount) };
    }
    
    return { output: output.trimEnd() };
  },

  sort: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "sort: missing file operand" };
    }
    
    const reverse = flags["r"];
    const numeric = flags["n"];
    const unique = flags["u"];
    
    let allLines: string[] = [];
    
    for (const arg of args) {
      const filePath = fs.resolvePath(currentPath, arg);
      const content = fs.readFile(filePath);
      
      if (content === null) {
        return { error: `sort: cannot read: ${arg}: No such file or directory` };
      }
      
      allLines = allLines.concat(content.split("\n").filter(l => l.length > 0));
    }
    
    if (numeric) {
      allLines.sort((a, b) => parseFloat(a) - parseFloat(b));
    } else {
      allLines.sort();
    }
    
    if (reverse) {
      allLines.reverse();
    }
    
    if (unique) {
      allLines = [...new Set(allLines)];
    }
    
    return { output: allLines.join("\n") };
  },

  uniq: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "uniq: missing file operand" };
    }
    
    const countPrefix = flags["c"];
    const onlyDuplicates = flags["d"];
    const onlyUnique = flags["u"];
    
    const filePath = fs.resolvePath(currentPath, args[0]);
    const content = fs.readFile(filePath);
    
    if (content === null) {
      return { error: `uniq: ${args[0]}: No such file or directory` };
    }
    
    const lines = content.split("\n");
    const result: string[] = [];
    let prevLine = "";
    let count = 0;
    
    for (const line of lines) {
      if (line === prevLine) {
        count++;
      } else {
        if (prevLine !== "" || count > 0) {
          const isDuplicate = count > 1;
          if ((!onlyDuplicates && !onlyUnique) || 
              (onlyDuplicates && isDuplicate) || 
              (onlyUnique && !isDuplicate)) {
            if (countPrefix) {
              result.push(`${String(count).padStart(7, " ")} ${prevLine}`);
            } else {
              result.push(prevLine);
            }
          }
        }
        prevLine = line;
        count = 1;
      }
    }
    
    if (prevLine !== "") {
      const isDuplicate = count > 1;
      if ((!onlyDuplicates && !onlyUnique) || 
          (onlyDuplicates && isDuplicate) || 
          (onlyUnique && !isDuplicate)) {
        if (countPrefix) {
          result.push(`${String(count).padStart(7, " ")} ${prevLine}`);
        } else {
          result.push(prevLine);
        }
      }
    }
    
    return { output: result.join("\n") };
  },

  find: (args, flags, fs, currentPath) => {
    const searchPath = args.length > 0 ? fs.resolvePath(currentPath, args[0]) : currentPath;
    const namePattern = typeof flags["name"] === "string" ? flags["name"] : null;
    const typeFilter = typeof flags["type"] === "string" ? flags["type"] : null;
    
    const results: string[] = [];
    
    function searchDir(path: string) {
      const node = fs.getNode(path);
      if (!node) return;
      
      if (node.type === "directory" && node.children) {
        for (const [name, child] of node.children) {
          const childPath = path === "/" ? `/${name}` : `${path}/${name}`;
          
          let matchesName = true;
          if (namePattern) {
            const regex = new RegExp("^" + namePattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
            matchesName = regex.test(name);
          }
          
          let matchesType = true;
          if (typeFilter) {
            if (typeFilter === "f") matchesType = child.type === "file";
            else if (typeFilter === "d") matchesType = child.type === "directory";
          }
          
          if (matchesName && matchesType) {
            results.push(childPath);
          }
          
          if (child.type === "directory") {
            searchDir(childPath);
          }
        }
      }
    }
    
    results.push(searchPath);
    searchDir(searchPath);
    
    return { output: results.join("\n") };
  },

  diff: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "diff: missing operand" };
    }
    
    const file1 = fs.resolvePath(currentPath, args[0]);
    const file2 = fs.resolvePath(currentPath, args[1]);
    
    const content1 = fs.readFile(file1);
    const content2 = fs.readFile(file2);
    
    if (content1 === null) {
      return { error: `diff: ${args[0]}: No such file or directory` };
    }
    if (content2 === null) {
      return { error: `diff: ${args[1]}: No such file or directory` };
    }
    
    if (content1 === content2) {
      return { output: "" };
    }
    
    const lines1 = content1.split("\n");
    const lines2 = content2.split("\n");
    let output = "";
    
    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      if (lines1[i] !== lines2[i]) {
        if (lines1[i] && !lines2[i]) {
          output += `${i + 1}d${i}\n< ${lines1[i]}\n`;
        } else if (!lines1[i] && lines2[i]) {
          output += `${i}a${i + 1}\n> ${lines2[i]}\n`;
        } else {
          output += `${i + 1}c${i + 1}\n< ${lines1[i]}\n---\n> ${lines2[i]}\n`;
        }
      }
    }
    
    return { output: output.trimEnd() };
  },

  file: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "file: missing file operand" };
    }
    
    let output = "";
    for (const arg of args) {
      const filePath = fs.resolvePath(currentPath, arg);
      const node = fs.getNode(filePath);
      
      if (!node) {
        output += `${arg}: cannot open (No such file or directory)\n`;
      } else if (node.type === "directory") {
        output += `${arg}: directory\n`;
      } else {
        const content = node.content || "";
        if (content.length === 0) {
          output += `${arg}: empty\n`;
        } else if (content.startsWith("#!/")) {
          output += `${arg}: script, ASCII text executable\n`;
        } else {
          output += `${arg}: ASCII text\n`;
        }
      }
    }
    
    return { output: output.trimEnd() };
  },

  stat: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "stat: missing operand" };
    }
    
    const filePath = fs.resolvePath(currentPath, args[0]);
    const node = fs.getNode(filePath);
    
    if (!node) {
      return { error: `stat: cannot stat '${args[0]}': No such file or directory` };
    }
    
    const size = node.content?.length || 0;
    const type = node.type === "directory" ? "directory" : "regular file";
    
    return { output: `  File: ${args[0]}
  Size: ${size}        Blocks: 8          IO Block: 4096   ${type}
Device: 801h/2049d      Inode: 12345       Links: 1
Access: ${node.permissions}  Uid: ( 1000/ visitor)   Gid: ( 1000/ visitor)
Access: ${formatFullDate(node.modified)}
Modify: ${formatFullDate(node.modified)}
Change: ${formatFullDate(node.modified)}
 Birth: -` };
  },

  ln: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "ln: missing file operand" };
    }
    return { error: "ln: symbolic links not supported in virtual filesystem" };
  },

  man: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "What manual page do you want?" };
    }
    
    const cmd = args[0];
    const manPages: Record<string, string> = {
      ls: "LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs.\n\n       -a     do not ignore entries starting with .\n       -l     use a long listing format",
      cd: "CD(1)\n\nNAME\n       cd - change the working directory\n\nSYNOPSIS\n       cd [dir]\n\nDESCRIPTION\n       Change the current directory to dir.",
      pwd: "PWD(1)\n\nNAME\n       pwd - print name of current/working directory\n\nSYNOPSIS\n       pwd\n\nDESCRIPTION\n       Print the full filename of the current working directory.",
      cat: "CAT(1)\n\nNAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [FILE]...\n\nDESCRIPTION\n       Concatenate FILE(s) to standard output.",
      grep: "GREP(1)\n\nNAME\n       grep - print lines that match patterns\n\nSYNOPSIS\n       grep [OPTION]... PATTERNS [FILE]...\n\nDESCRIPTION\n       grep searches for PATTERNS in each FILE.\n\n       -i     ignore case\n       -n     print line numbers\n       -v     invert match\n       -c     count matches",
    };
    
    if (manPages[cmd]) {
      return { output: manPages[cmd] };
    }
    
    if (Object.keys(commands).includes(cmd)) {
      return { output: `${cmd.toUpperCase()}(1)\n\nNAME\n       ${cmd} - ${cmd} command\n\nDESCRIPTION\n       No manual entry for ${cmd}. Try 'help' for available commands.` };
    }
    
    return { error: `No manual entry for ${cmd}` };
  },

  alias: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "alias ll='ls -la'\nalias la='ls -A'\nalias l='ls -CF'" };
    }
    return { output: "" };
  },

  type: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "type: missing argument" };
    }
    
    const cmd = args[0];
    const builtins = ["cd", "pwd", "echo", "export", "alias", "type", "exit", "logout", "history"];
    
    if (builtins.includes(cmd)) {
      return { output: `${cmd} is a shell builtin` };
    }
    
    if (Object.keys(commands).includes(cmd)) {
      return { output: `${cmd} is /usr/bin/${cmd}` };
    }
    
    return { error: `type: ${cmd}: not found` };
  },

  true: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  false: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  yes: (args, flags, fs, currentPath) => {
    const text = args.length > 0 ? args.join(" ") : "y";
    let output = "";
    for (let i = 0; i < 20; i++) {
      output += text + "\n";
    }
    return { output: output.trimEnd() };
  },

  sleep: (args, flags, fs, currentPath) => {
    const seconds = parseFloat(args[0] || "0");
    if (isNaN(seconds) || seconds < 0) {
      return { error: "sleep: invalid time interval" };
    }
    if (seconds === 0) {
      return { output: "" };
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ output: "" });
      }, seconds * 1000);
    });
  },

  tty: (args, flags, fs, currentPath) => {
    return { output: "/dev/pts/0" };
  },

  groups: (args, flags, fs, currentPath) => {
    return { output: "visitor adm cdrom sudo dip plugdev" };
  },

  users: (args, flags, fs, currentPath) => {
    return { output: "visitor" };
  },

  w: (args, flags, fs, currentPath, context) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const uptimeStr = context?.startTime ? formatUptime(context.startTime) : "up 0 min";
    return { output: ` ${hours}:${minutes}:${seconds} ${uptimeStr},  1 user,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
visitor  pts/0    -                00:00    0.00s  0.00s  0.00s -bash` };
  },

  last: (args, flags, fs, currentPath) => {
    return { output: `visitor  pts/0        -                Mon Dec  2 00:00   still logged in
reboot   system boot  5.15.0-generic   Mon Dec  2 00:00   still running

wtmp begins Mon Dec  2 00:00:00 2024` };
  },

  dmesg: (args, flags, fs, currentPath) => {
    return { output: `[    0.000000] Linux version 5.15.0-generic (buildd@lcy02-amd64-001)
[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.15.0-generic root=/dev/sda1
[    0.000000] BIOS-provided physical RAM map:
[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable
[    0.001000] Initializing cgroup subsys cpuset
[    0.002000] Initializing cgroup subsys cpu
[    0.003000] Linux version 5.15.0-generic compiled with gcc-11` };
  },

  lsb_release: (args, flags, fs, currentPath) => {
    if (flags["a"]) {
      return { output: `Distributor ID: Ubuntu
Description:    Ubuntu 22.04.3 LTS
Release:        22.04
Codename:       jammy` };
    }
    return { output: "Ubuntu 22.04.3 LTS" };
  },

  arch: (args, flags, fs, currentPath) => {
    return { output: "x86_64" };
  },

  nproc: (args, flags, fs, currentPath) => {
    return { output: "4" };
  },

  lscpu: (args, flags, fs, currentPath) => {
    return { output: `Architecture:            x86_64
CPU op-mode(s):          32-bit, 64-bit
Address sizes:           48 bits physical, 48 bits virtual
Byte Order:              Little Endian
CPU(s):                  4
On-line CPU(s) list:     0-3
Vendor ID:               GenuineIntel
Model name:              Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz
CPU family:              6
Model:                   142
Thread(s) per core:      2
Core(s) per socket:      2
Socket(s):               1
Stepping:                10
CPU max MHz:             4000.0000
CPU min MHz:             400.0000` };
  },

  ifconfig: (args, flags, fs, currentPath) => {
    return { output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>
        ether 00:00:00:00:00:00  txqueuelen 1000  (Ethernet)
        RX packets 1000  bytes 100000 (100.0 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 500  bytes 50000 (50.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 100  bytes 10000 (10.0 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 100  bytes 10000 (10.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0` };
  },

  ip: (args, flags, fs, currentPath) => {
    if (args.length === 0 || args[0] === "addr" || args[0] === "a") {
      return { output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:00:00:00:00:00 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86400sec preferred_lft 86400sec
    inet6 fe80::1/64 scope link
       valid_lft forever preferred_lft forever` };
    }
    if (args[0] === "route" || args[0] === "r") {
      return { output: `default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100` };
    }
    return { output: "Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\nOBJECT := { addr | route | link }" };
  },

  ping: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "ping: usage error: Destination address required" };
    }
    const host = args[0];
    return { output: `PING ${host} (127.0.0.1) 56(84) bytes of data.
64 bytes from ${host} (127.0.0.1): icmp_seq=1 ttl=64 time=0.050 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=2 ttl=64 time=0.045 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=3 ttl=64 time=0.048 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2000ms
rtt min/avg/max/mdev = 0.045/0.047/0.050/0.002 ms` };
  },

  netstat: (args, flags, fs, currentPath) => {
    return { output: `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN
tcp6       0      0 :::22                   :::*                    LISTEN
udp        0      0 0.0.0.0:68              0.0.0.0:*` };
  },

  ss: (args, flags, fs, currentPath) => {
    return { output: `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port
tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*
tcp    LISTEN  0       128      127.0.0.1:631          0.0.0.0:*
tcp    LISTEN  0       128      [::]:22                [::]:*` };
  },

  curl: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "curl: try 'curl --help' for more information" };
    }
    return { output: `curl: (6) Could not resolve host: ${args[0]}
Note: This is a simulated terminal. Network requests are not supported.` };
  },

  wget: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "wget: missing URL" };
    }
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace("T", " ");
    return { output: `--${timestamp}--  ${args[0]}
Resolving ${args[0]}... failed: Name or service not known.
wget: unable to resolve host address '${args[0]}'
Note: This is a simulated terminal. Network requests are not supported.` };
  },

  ssh: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface] ... destination" };
    }
    return { output: `ssh: connect to host ${args[0]} port 22: Connection refused
Note: This is a simulated terminal. SSH connections are not supported.` };
  },

  scp: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "usage: scp [-346BCpqrTv] ... source ... target" };
    }
    return { output: `scp: Connection refused
Note: This is a simulated terminal. SCP transfers are not supported.` };
  },

  systemctl: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "systemctl: command required" };
    }
    if (args[0] === "status") {
      return { output: `System is running in simulated mode.
Note: This is a simulated terminal. systemctl is not fully functional.` };
    }
    return { output: `Note: This is a simulated terminal. systemctl operations are not supported.` };
  },

  service: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "Usage: service <service> <action>" };
    }
    return { output: `Note: This is a simulated terminal. Service management is not supported.` };
  },

  sudo: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return { error: "usage: sudo -h | -K | -k | -V\nusage: sudo [-ABbEHnPS] [-C num] [-g group] [-h host] [-p prompt] [-T timeout] [-u user] [VAR=value] [-i|-s] [<command>]" };
    }
    const subCommand = args[0];
    const subArgs = args.slice(1);
    
    if (commands[subCommand]) {
      return commands[subCommand](subArgs, flags, fs, currentPath, context);
    }
    
    return { error: `sudo: ${subCommand}: command not found` };
  },

  su: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. User switching is not supported." };
  },

  passwd: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Password changes are not supported." };
  },

  useradd: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. User management is not supported." };
  },

  userdel: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. User management is not supported." };
  },

  groupadd: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Group management is not supported." };
  },

  apt: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "apt 2.4.10 (amd64)\nUsage: apt [options] command" };
    }
    return { output: `Note: This is a simulated terminal. Package management is not supported.` };
  },

  "apt-get": (args, flags, fs, currentPath) => {
    return commands.apt(args, flags, fs, currentPath);
  },

  dpkg: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Package management is not supported." };
  },

  snap: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Snap package management is not supported." };
  },

  reboot: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. System reboot is not supported." };
  },

  shutdown: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. System shutdown is not supported." };
  },

  poweroff: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. System poweroff is not supported." };
  },

  mount: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: `/dev/sda1 on / type ext4 (rw,relatime)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
/dev/sda2 on /home type ext4 (rw,relatime)` };
    }
    return { output: "Note: This is a simulated terminal. Mount operations are not supported." };
  },

  umount: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Unmount operations are not supported." };
  },

  fdisk: (args, flags, fs, currentPath) => {
    if (flags["l"]) {
      return { output: `Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors
Disk model: Virtual Disk
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt

Device       Start       End   Sectors  Size Type
/dev/sda1     2048 104857599 104855552   50G Linux filesystem
/dev/sda2 104857600 209715166 104857567   50G Linux filesystem` };
    }
    return { output: "Note: This is a simulated terminal. Disk partitioning is not supported." };
  },

  blkid: (args, flags, fs, currentPath) => {
    return { output: `/dev/sda1: UUID="12345678-1234-1234-1234-123456789abc" TYPE="ext4" PARTUUID="abcd1234-01"
/dev/sda2: UUID="87654321-4321-4321-4321-cba987654321" TYPE="ext4" PARTUUID="abcd1234-02"` };
  },

  lsblk: (args, flags, fs, currentPath) => {
    return { output: `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0   100G  0 disk
├─sda1   8:1    0    50G  0 part /
└─sda2   8:2    0    50G  0 part /home` };
  },

  tar: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Archive operations are not supported." };
  },

  gzip: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Compression is not supported." };
  },

  gunzip: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Decompression is not supported." };
  },

  zip: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Compression is not supported." };
  },

  unzip: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Decompression is not supported." };
  },

  basename: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "basename: missing operand" };
    }
    const path = args[0];
    const parts = path.split("/").filter(p => p !== "");
    return { output: parts[parts.length - 1] || "/" };
  },

  dirname: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "dirname: missing operand" };
    }
    const path = args[0];
    const parts = path.split("/").filter(p => p !== "");
    if (parts.length <= 1) {
      return { output: path.startsWith("/") ? "/" : "." };
    }
    return { output: "/" + parts.slice(0, -1).join("/") };
  },

  realpath: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "realpath: missing operand" };
    }
    return { output: fs.resolvePath(currentPath, args[0]) };
  },

  readlink: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "readlink: missing operand" };
    }
    if (flags["f"]) {
      return { output: fs.resolvePath(currentPath, args[0]) };
    }
    return { output: "" };
  },

  seq: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "seq: missing operand" };
    }
    
    let start = 1;
    let end = 1;
    let step = 1;
    
    if (args.length === 1) {
      end = parseInt(args[0], 10);
    } else if (args.length === 2) {
      start = parseInt(args[0], 10);
      end = parseInt(args[1], 10);
    } else {
      start = parseInt(args[0], 10);
      step = parseInt(args[1], 10);
      end = parseInt(args[2], 10);
    }
    
    const result: number[] = [];
    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        result.push(i);
      }
    } else if (step < 0) {
      for (let i = start; i >= end; i += step) {
        result.push(i);
      }
    }
    
    return { output: result.join("\n") };
  },

  printf: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "" };
    }
    let format = args[0];
    const values = args.slice(1);
    
    format = format.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    
    let result = format;
    let valueIndex = 0;
    result = result.replace(/%[sd]/g, () => {
      return values[valueIndex++] || "";
    });
    
    return { output: result };
  },

  test: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "" };
    }
    
    if (args[0] === "-e" || args[0] === "-f" || args[0] === "-d") {
      if (args.length < 2) return { output: "" };
      const path = fs.resolvePath(currentPath, args[1]);
      const node = fs.getNode(path);
      if (args[0] === "-e") return { output: "" };
      if (args[0] === "-f") return { output: "" };
      if (args[0] === "-d") return { output: "" };
    }
    
    return { output: "" };
  },

  "[": (args, flags, fs, currentPath) => {
    const newArgs = args.slice(0, -1);
    return commands.test(newArgs, flags, fs, currentPath);
  },

  expr: (args, flags, fs, currentPath) => {
    if (args.length < 3) {
      return { error: "expr: syntax error" };
    }
    
    const a = parseInt(args[0], 10);
    const op = args[1];
    const b = parseInt(args[2], 10);
    
    switch (op) {
      case "+": return { output: String(a + b) };
      case "-": return { output: String(a - b) };
      case "*": return { output: String(a * b) };
      case "/": return b !== 0 ? { output: String(Math.floor(a / b)) } : { error: "expr: division by zero" };
      case "%": return b !== 0 ? { output: String(a % b) } : { error: "expr: division by zero" };
      default: return { error: "expr: syntax error" };
    }
  },

  bc: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. bc calculator is not fully supported." };
  },

  cal: (args, flags, fs, currentPath) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    
    let output = `    ${months[month]} ${year}\n`;
    output += "Su Mo Tu We Th Fr Sa\n";
    
    let line = "   ".repeat(firstDay);
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day === today ? `${String(day).padStart(2, " ")}` : String(day).padStart(2, " ");
      line += dayStr + " ";
      if ((firstDay + day) % 7 === 0) {
        output += line.trimEnd() + "\n";
        line = "";
      }
    }
    if (line) {
      output += line.trimEnd();
    }
    
    return { output: output.trimEnd() };
  },

  factor: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "factor: missing operand" };
    }
    
    const n = parseInt(args[0], 10);
    if (isNaN(n) || n < 1) {
      return { error: `factor: '${args[0]}' is not a valid positive integer` };
    }
    
    const factors: number[] = [];
    let num = n;
    for (let i = 2; i * i <= num; i++) {
      while (num % i === 0) {
        factors.push(i);
        num /= i;
      }
    }
    if (num > 1) {
      factors.push(num);
    }
    
    return { output: `${n}: ${factors.join(" ")}` };
  },

  rev: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "" };
    }
    
    const filePath = fs.resolvePath(currentPath, args[0]);
    const content = fs.readFile(filePath);
    
    if (content === null) {
      return { error: `rev: ${args[0]}: No such file or directory` };
    }
    
    const reversed = content.split("\n").map(line => line.split("").reverse().join("")).join("\n");
    return { output: reversed };
  },

  tac: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "tac: missing file operand" };
    }
    
    const filePath = fs.resolvePath(currentPath, args[0]);
    const content = fs.readFile(filePath);
    
    if (content === null) {
      return { error: `tac: ${args[0]}: No such file or directory` };
    }
    
    const reversed = content.split("\n").reverse().join("\n");
    return { output: reversed };
  },

  cut: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "cut: you must specify a list of bytes, characters, or fields" };
    }
    
    const delimiter = typeof flags["d"] === "string" ? flags["d"] : "\t";
    const fields = typeof flags["f"] === "string" ? flags["f"] : null;
    
    if (!fields) {
      return { error: "cut: you must specify a list of fields" };
    }
    
    const filePath = fs.resolvePath(currentPath, args[args.length - 1]);
    const content = fs.readFile(filePath);
    
    if (content === null) {
      return { error: `cut: ${args[args.length - 1]}: No such file or directory` };
    }
    
    const fieldNums = fields.split(",").map(f => parseInt(f, 10) - 1);
    const lines = content.split("\n");
    const result = lines.map(line => {
      const parts = line.split(delimiter);
      return fieldNums.map(f => parts[f] || "").join(delimiter);
    });
    
    return { output: result.join("\n") };
  },

  tr: (args, flags, fs, currentPath) => {
    if (args.length < 2) {
      return { error: "tr: missing operand" };
    }
    return { output: "Note: tr requires stdin input which is not supported in this terminal." };
  },

  xargs: (args, flags, fs, currentPath) => {
    return { output: "Note: xargs requires stdin input which is not supported in this terminal." };
  },

  tee: (args, flags, fs, currentPath) => {
    return { output: "Note: tee requires stdin input which is not supported in this terminal." };
  },

  time: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return { output: "" };
    }
    
    const cmd = args[0];
    const cmdArgs = args.slice(1);
    
    if (commands[cmd]) {
      const result = commands[cmd](cmdArgs, flags, fs, currentPath, context);
      const output = result.output || "";
      return { output: `${output}\n\nreal    0m0.001s\nuser    0m0.000s\nsys     0m0.001s` };
    }
    
    return { error: `time: ${cmd}: command not found` };
  },

  watch: (args, flags, fs, currentPath) => {
    return { output: "Note: watch requires continuous execution which is not supported in this terminal." };
  },

  crontab: (args, flags, fs, currentPath) => {
    if (flags["l"]) {
      return { output: "no crontab for visitor" };
    }
    return { output: "Note: This is a simulated terminal. Crontab management is not supported." };
  },

  at: (args, flags, fs, currentPath) => {
    return { output: "Note: This is a simulated terminal. Job scheduling is not supported." };
  },

  jobs: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  fg: (args, flags, fs, currentPath) => {
    return { error: "fg: no current job" };
  },

  bg: (args, flags, fs, currentPath) => {
    return { error: "bg: no current job" };
  },

  kill: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]" };
    }
    return { output: "" };
  },

  killall: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "killall: no process name specified" };
    }
    return { output: "" };
  },

  pkill: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "pkill: no matching criteria specified" };
    }
    return { output: "" };
  },

  pgrep: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "pgrep: no matching criteria specified" };
    }
    return { output: "1000" };
  },

  nice: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return { output: "0" };
    }
    const cmd = args[0];
    const cmdArgs = args.slice(1);
    if (commands[cmd]) {
      return commands[cmd](cmdArgs, flags, fs, currentPath, context);
    }
    return { error: `nice: ${cmd}: command not found` };
  },

  nohup: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return { error: "nohup: missing operand" };
    }
    return { output: "nohup: Note: This is a simulated terminal. nohup is not fully functional." };
  },

  timeout: (args, flags, fs, currentPath, context) => {
    if (args.length < 2) {
      return { error: "timeout: missing operand" };
    }
    const cmd = args[1];
    const cmdArgs = args.slice(2);
    if (commands[cmd]) {
      return commands[cmd](cmdArgs, flags, fs, currentPath, context);
    }
    return { error: `timeout: ${cmd}: command not found` };
  },

  source: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { error: "source: filename argument required" };
    }
    return { output: "" };
  },

  ".": (args, flags, fs, currentPath) => {
    return commands.source(args, flags, fs, currentPath);
  },

  set: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  unset: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  read: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  declare: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  local: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  return: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  break: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  continue: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  shift: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  getopts: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  eval: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  exec: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  trap: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  wait: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  hash: (args, flags, fs, currentPath) => {
    return { output: "hash: hash table empty" };
  },

  enable: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  builtin: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return { output: "" };
    }
    const cmd = args[0];
    const cmdArgs = args.slice(1);
    if (commands[cmd]) {
      return commands[cmd](cmdArgs, flags, fs, currentPath, context);
    }
    return { error: `builtin: ${cmd}: not a shell builtin` };
  },

  command: (args, flags, fs, currentPath, context) => {
    if (args.length === 0) {
      return { output: "" };
    }
    const cmd = args[0];
    const cmdArgs = args.slice(1);
    if (commands[cmd]) {
      return commands[cmd](cmdArgs, flags, fs, currentPath, context);
    }
    return { error: `command: ${cmd}: command not found` };
  },

  compgen: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  complete: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  shopt: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  ulimit: (args, flags, fs, currentPath) => {
    if (flags["a"]) {
      return { output: `core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 15738
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 15738
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited` };
    }
    return { output: "unlimited" };
  },

  umask: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: "0022" };
    }
    return { output: "" };
  },

  times: (args, flags, fs, currentPath) => {
    return { output: "0m0.000s 0m0.000s\n0m0.000s 0m0.000s" };
  },

  fc: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  bind: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  dirs: (args, flags, fs, currentPath) => {
    return { output: currentPath };
  },

  pushd: (args, flags, fs, currentPath) => {
    if (args.length === 0) {
      return { output: currentPath };
    }
    const result = fs.changeDirectory(currentPath, args[0]);
    if (typeof result === "string") {
      return { output: result, newPath: result };
    }
    return { error: result.error };
  },

  popd: (args, flags, fs, currentPath) => {
    return { output: currentPath };
  },

  disown: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  suspend: (args, flags, fs, currentPath) => {
    return { error: "suspend: cannot suspend a login shell" };
  },

  mapfile: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  readarray: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  coproc: (args, flags, fs, currentPath) => {
    return { output: "" };
  },

  let: (args, flags, fs, currentPath) => {
    return { output: "" };
  },
};

export function executeCommand(
  command: string,
  args: string[],
  flags: Record<string, boolean | string>,
  fs: VirtualFileSystem,
  currentPath: string,
  context?: CommandContext
): CommandResult | Promise<CommandResult> {
  const handler = commands[command];

  if (!handler) {
    return { error: `pk2sh: command not found: ${command}` };
  }

  return handler(args, flags, fs, currentPath, context);
}
