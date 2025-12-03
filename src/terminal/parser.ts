export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, boolean | string>;
}

export interface CommandChain {
  commands: ParsedCommand[];
  operators: ("&&" | "||" | ";")[];
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  if (!trimmed) {
    return { command: "", args: [], flags: {} };
  }

  const tokens = tokenize(trimmed);
  const command = tokens[0] || "";
  const args: string[] = [];
  const flags: Record<string, boolean | string> = {};

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith("--")) {
      // Long flag: --flag or --flag=value
      const [flagName, value] = token.slice(2).split("=", 2);
      flags[flagName] = value !== undefined ? value : true;
    } else if (token.startsWith("-") && token.length > 1 && token !== "-") {
      // Short flags: -la or -l -a
      const flagChars = token.slice(1);

      if (flagChars.includes("=")) {
        // Handle -flag=value format
        const [flagPart, value] = flagChars.split("=", 2);
        for (const char of flagPart) {
          flags[char] = true;
        }
        if (value) {
          flags[flagPart] = value;
        }
      } else {
        // Split individual flags
        for (const char of flagChars) {
          flags[char] = true;
        }
      }
    } else {
      // Regular argument
      args.push(token);
    }
  }

  return { command, args, flags };
}

export function parseCommandChain(input: string): CommandChain {
  const trimmed = input.trim();

  // If no operators, return single command
  if (!containsOperatorOutsideQuotes(trimmed)) {
    const parsed = parseCommand(trimmed);
    return {
      commands: [parsed],
      operators: [],
    };
  }

  const commands: ParsedCommand[] = [];
  const operators: ("&&" | "||" | ";")[] = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const nextChar = trimmed[i + 1];

    // Handle quotes
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = "";
      current += char;
    } else if (!inQuotes && char === "&" && nextChar === "&") {
      // Found &&
      const cmd = current.trim();
      if (cmd) {
        commands.push(parseCommand(cmd));
        operators.push("&&");
      }
      current = "";
      i++; // Skip next &
    } else if (!inQuotes && char === "|" && nextChar === "|") {
      // Found ||
      const cmd = current.trim();
      if (cmd) {
        commands.push(parseCommand(cmd));
        operators.push("||");
      }
      current = "";
      i++; // Skip next |
    } else if (!inQuotes && char === ";") {
      // Found ;
      const cmd = current.trim();
      if (cmd) {
        commands.push(parseCommand(cmd));
        operators.push(";");
      }
      current = "";
    } else {
      current += char;
    }
  }

  // Add final command
  const cmd = current.trim();
  if (cmd) {
    commands.push(parseCommand(cmd));
  }

  return { commands, operators };
}

function containsOperatorOutsideQuotes(input: string): boolean {
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
    } else if (!inQuotes) {
      if ((char === "&" && nextChar === "&") || (char === "|" && nextChar === "|") || char === ";") {
        return true;
      }
    }
  }

  return false;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
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
