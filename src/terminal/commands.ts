import { VirtualFileSystem } from "./filesystem";

export interface CommandResult {
  output: string;
  error?: string;
  newPath?: string;
}

export type CommandHandler = (
  args: string[],
  flags: Record<string, boolean | string>,
  fs: VirtualFileSystem,
  currentPath: string
) => CommandResult;

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
  },
};

export function executeCommand(
  command: string,
  args: string[],
  flags: Record<string, boolean | string>,
  fs: VirtualFileSystem,
  currentPath: string
): CommandResult {
  const handler = commands[command];

  if (!handler) {
    return { error: `pk2sh: command not found: ${command}` };
  }

  return handler(args, flags, fs, currentPath);
}
