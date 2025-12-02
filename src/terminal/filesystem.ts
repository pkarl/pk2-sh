import { AliasManager } from "./aliases";

export interface VFSNode {
  type: "file" | "directory";
  name: string;
  content?: string;
  children?: Map<string, VFSNode>;
  permissions: string;
  created: Date;
  modified: Date;
}

export class VirtualFileSystem {
  private root: VFSNode;
  private aliasManager: AliasManager;

  constructor() {
    this.root = this.createDirectoryNode("");
    this.aliasManager = new AliasManager();

    // Essential directories
    this.createNestedDirectory("/bin");
    this.createNestedDirectory("/sbin");
    this.createNestedDirectory("/boot");
    this.createNestedDirectory("/lib");
    this.createNestedDirectory("/lib64");

    // Configuration
    this.createNestedDirectory("/etc/init.d");
    this.createNestedDirectory("/etc/systemd");
    this.createNestedDirectory("/etc/network");
    this.createNestedDirectory("/etc/ssh");

    // User directories
    this.createNestedDirectory("/home/visitor");
    this.createNestedDirectory("/root");

    // Variable data
    this.createNestedDirectory("/var/log");
    this.createNestedDirectory("/var/tmp");
    this.createNestedDirectory("/var/cache");
    this.createNestedDirectory("/var/www");
    this.createNestedDirectory("/var/mail");

    // User programs
    this.createNestedDirectory("/usr/bin");
    this.createNestedDirectory("/usr/sbin");
    this.createNestedDirectory("/usr/lib");
    this.createNestedDirectory("/usr/local/bin");
    this.createNestedDirectory("/usr/local/lib");
    this.createNestedDirectory("/usr/local/share");
    this.createNestedDirectory("/usr/share/doc");
    this.createNestedDirectory("/usr/share/man");

    // Other standard directories
    this.createNestedDirectory("/tmp");
    this.createNestedDirectory("/opt");
    this.createNestedDirectory("/mnt");
    this.createNestedDirectory("/proc");
    this.createNestedDirectory("/sys");
    this.createNestedDirectory("/dev");
    this.createNestedDirectory("/srv");
  }

  private createDirectoryNode(name: string): VFSNode {
    return {
      type: "directory",
      name,
      children: new Map(),
      permissions: "drwxr-xr-x",
      created: new Date(),
      modified: new Date(),
    };
  }

  private createFileNode(name: string, content: string = ""): VFSNode {
    return {
      type: "file",
      name,
      content,
      permissions: "-rw-r--r--",
      created: new Date(),
      modified: new Date(),
    };
  }

  private createNestedDirectory(path: string): VFSNode {
    const parts = path.split("/").filter((p) => p !== "");
    let current = this.root;

    for (const part of parts) {
      if (!current.children!.has(part)) {
        const newNode = this.createDirectoryNode(part);
        current.children!.set(part, newNode);
      }
      current = current.children!.get(part)!;
    }

    return current;
  }

  /**
   * Register a new alias in the alias manager
   * @param alias - The alias to register
   * @param path - The path it expands to
   */
  setAlias(alias: string, path: string): void {
    this.aliasManager.setAlias(alias, path);
  }

  /**
   * Look up an alias in the alias manager
   * @param alias - The alias to look up
   * @returns The expanded path or undefined
   */
  getAlias(alias: string): string | undefined {
    return this.aliasManager.getAlias(alias);
  }

  /**
   * Expand an alias in a path
   * @param path - The path potentially containing an alias
   * @returns The expanded path
   */
  expandAlias(path: string): string {
    return this.aliasManager.expandAlias(path);
  }

  /**
   * Reverse expand a path to an alias if possible
   * @param path - The path to convert to an alias
   * @returns The aliased version or original path
   */
  reverseExpandAlias(path: string): string {
    return this.aliasManager.reverseExpandAlias(path);
  }

  resolvePath(currentPath: string, targetPath: string): string {
    // Expand aliases first
    targetPath = this.expandAlias(targetPath);

    // If absolute path, use it directly
    if (targetPath.startsWith("/")) {
      currentPath = targetPath;
    } else {
      // Relative path - build from current
      if (currentPath !== "/") {
        currentPath += "/" + targetPath;
      } else {
        currentPath = "/" + targetPath;
      }
    }

    // Normalize path: handle . and ..
    const parts = currentPath.split("/").filter((p) => p !== "");
    const normalized: string[] = [];

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

  getNode(path: string): VFSNode | null {
    if (path === "/") return this.root;

    const parts = path.split("/").filter((p) => p !== "");
    let current = this.root;

    for (const part of parts) {
      if (current.type !== "directory" || !current.children) {
        return null;
      }
      const next = current.children.get(part);
      if (!next) return null;
      current = next;
    }

    return current;
  }

  createDirectory(path: string): boolean {
    const parts = path.split("/").filter((p) => p !== "");
    if (parts.length === 0) return false;

    const name = parts[parts.length - 1];
    const parentPath = "/" + parts.slice(0, -1).join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "directory") {
      return false;
    }

    if (parent.children!.has(name)) {
      return false; // Already exists
    }

    parent.children!.set(name, this.createDirectoryNode(name));
    parent.modified = new Date();
    return true;
  }

  createFile(path: string, content: string = ""): boolean {
    const parts = path.split("/").filter((p) => p !== "");
    if (parts.length === 0) return false;

    const name = parts[parts.length - 1];
    const parentPath = "/" + parts.slice(0, -1).join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "directory") {
      return false;
    }

    if (parent.children!.has(name)) {
      return false; // Already exists
    }

    parent.children!.set(name, this.createFileNode(name, content));
    parent.modified = new Date();
    return true;
  }

  listDirectory(path: string): VFSNode[] {
    const node = this.getNode(path);
    if (!node || node.type !== "directory" || !node.children) {
      return [];
    }

    // Create special directory entries for . and ..
    const entries: VFSNode[] = [];

    // Add . (current directory)
    entries.push({
      type: "directory",
      name: ".",
      children: new Map(),
      permissions: "drwxr-xr-x",
      created: node.created,
      modified: node.modified,
    });

    // Add .. (parent directory) - in root, .. points to itself
    entries.push({
      type: "directory",
      name: "..",
      children: new Map(),
      permissions: "drwxr-xr-x",
      created: this.root.created,
      modified: this.root.modified,
    });

    // Add regular directory contents
    entries.push(...Array.from(node.children.values()));

    return entries;
  }

  changeDirectory(
    currentPath: string,
    targetPath: string
  ): string | { error: string } {
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

  deleteNode(path: string): boolean {
    if (path === "/") return false;

    const parts = path.split("/").filter((p) => p !== "");
    const name = parts[parts.length - 1];
    const parentPath = "/" + parts.slice(0, -1).join("/");

    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== "directory") {
      return false;
    }

    const hasChild = parent.children!.has(name);
    if (hasChild) {
      parent.children!.delete(name);
      parent.modified = new Date();
      return true;
    }

    return false;
  }

  readFile(path: string): string | null {
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
  getPathDisplay(currentPath: string): string {
    return this.reverseExpandAlias(currentPath);
  }
}
