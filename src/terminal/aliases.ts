/**
 * AliasManager handles path aliases and expansions
 * Provides a centralized, extensible system for managing aliases like ~ for home directories
 */
export class AliasManager {
  private aliases: Map<string, string>;

  constructor() {
    this.aliases = new Map();
    this.initializeDefaultAliases();
  }

  /**
   * Initialize default aliases - can be extended by calling setAlias()
   */
  private initializeDefaultAliases(): void {
    this.setAlias("~", "/home/visitor");
    this.setAlias("~visitor", "/home/visitor");
  }

  /**
   * Register a new alias
   * @param alias - The alias string (e.g., "~", "~/bin")
   * @param path - The path it should expand to (e.g., "/home/visitor")
   */
  setAlias(alias: string, path: string): void {
    this.aliases.set(alias, path);
  }

  /**
   * Look up an alias
   * @param alias - The alias to look up
   * @returns The expanded path or undefined if not found
   */
  getAlias(alias: string): string | undefined {
    return this.aliases.get(alias);
  }

  /**
   * Expand an alias in a path
   * Handles both exact matches (~ → /home/visitor) and path-based (~/foo → /home/visitor/foo)
   * @param path - The path potentially containing an alias
   * @returns The expanded path
   */
  expandAlias(path: string): string {
    // Check if path starts with an alias
    // Sort by length descending to match longer aliases first (e.g., "~visitor" before "~")
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
  reverseExpandAlias(path: string): string {
    // Sort by length descending to match longer aliases first
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
  getAllAliases(): Map<string, string> {
    return new Map(this.aliases);
  }

  /**
   * Check if a string is an alias
   * @param str - The string to check
   * @returns True if the string is a registered alias
   */
  isAlias(str: string): boolean {
    return this.aliases.has(str);
  }
}
