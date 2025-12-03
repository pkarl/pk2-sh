import { VirtualFileSystem } from "./filesystem"
import { parseCommand, parseCommandChain } from "./parser"
import { executeCommand, CommandContext, CommandResult, commands } from "./commands"
import { FaviconManager } from "./faviconManager"

export class TerminalController {
  private filesystem: VirtualFileSystem
  private currentPath: string = "/home/visitor";
  private commandHistory: string[] = [];
  private historyIndex: number = 0;
  private currentInput: string = "";
  private multilineMode: boolean = false;
  private multilineBuffer: string[] = [];
  private outputElement: HTMLElement
  private mobileInput: HTMLInputElement | null = null
  private currentPromptLine: HTMLElement | null = null;
  private maxHistory: number = 100;
  private startTime: Date = new Date();
  private envVars: Map<string, string> = new Map();
  private isExited: boolean = false;
  private faviconManager: FaviconManager
  private tabCompletionState: {
    candidates: string[];
    currentIndex: number;
    originalInput: string;
    isActive: boolean;
  } = {
    candidates: [],
    currentIndex: -1,
    originalInput: "",
    isActive: false,
  };

  constructor() {
    this.filesystem = new VirtualFileSystem()
    this.outputElement = document.getElementById("terminal-output")!
    this.faviconManager = new FaviconManager()

    if (!this.outputElement) {
      throw new Error("Terminal output element not found in DOM")
    }

    this.initializeEnvVars()
    this.initialize()
  }

  private initializeEnvVars(): void {
    this.envVars.set("PATH", "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin")
    this.envVars.set("HOME", "/home/visitor")
    this.envVars.set("USER", "visitor")
    this.envVars.set("SHELL", "/bin/bash")
    this.envVars.set("PWD", this.currentPath)
    this.envVars.set("TERM", "xterm-256color")
    this.envVars.set("LANG", "en_US.UTF-8")
    this.envVars.set("HOSTNAME", "pk2-server")
  }

  private getCommandContext(): CommandContext {
    return {
      commandHistory: this.commandHistory,
      envVars: this.envVars,
      startTime: this.startTime,
      clearHistory: () => {
        this.commandHistory = []
        this.historyIndex = 0
      }
    }
  }

  private initialize(): void {
    this.showMotd()
    this.showPrompt()
    document.addEventListener("keydown", (e) => this.handleKeyDown(e))

    // Set up mobile input for virtual keyboard support
    this.mobileInput = document.getElementById("mobile-input") as HTMLInputElement
    if (this.mobileInput) {
      this.setupMobileInput()
    }
  }

  private setupMobileInput(): void {
    if (!this.mobileInput) return

    // Focus the hidden input when terminal is tapped
    const container = document.getElementById("terminal-container")
    if (container) {
      container.addEventListener("click", () => this.focusMobileInput())
      container.addEventListener("touchstart", () => this.focusMobileInput())
    }

    // Handle input events from mobile keyboard
    this.mobileInput.addEventListener("input", (e) => this.handleMobileInput(e as InputEvent))

    // Handle special keys on mobile (Enter, Backspace)
    this.mobileInput.addEventListener("keydown", (e) => this.handleMobileKeyDown(e))
  }

  private focusMobileInput(): void {
    if (this.mobileInput && !this.isExited) {
      this.mobileInput.focus()
    }
  }

  private handleMobileInput(event: InputEvent): void {
    if (this.isExited || !this.mobileInput) return

    const inputType = event.inputType
    const data = event.data

    if (inputType === "insertText" && data) {
      // Regular character input
      this.currentInput += data
      this.updateInputDisplay()
    } else if (inputType === "deleteContentBackward") {
      // Backspace
      this.currentInput = this.currentInput.slice(0, -1)
      this.updateInputDisplay()
    }

    // Clear the mobile input to keep it ready for next input
    this.mobileInput.value = ""
  }

  private handleMobileKeyDown(event: KeyboardEvent): void {
    if (this.isExited) return

    if (event.key === "Enter") {
      event.preventDefault()
      this.handleEnter()
      if (this.mobileInput) {
        this.mobileInput.value = ""
      }
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      this.currentInput = this.currentInput.slice(0, -1)
      this.updateInputDisplay()
      if (this.mobileInput) {
        this.mobileInput.value = ""
      }
    } else if (event.key === "Tab") {
      event.preventDefault()
      event.stopPropagation()
      this.handleTabCompletion()
      if (this.mobileInput) {
        this.mobileInput.value = ""
      }
    }
  }

  private showMotd(): void {
    const motd = this.filesystem.readFile("/etc/motd")
    if (motd) {
      this.addOutput(motd.trim(), "info")
    }

    // Add Ubuntu-style welcome message with browser info
    const userAgent = navigator.userAgent
    const welcomeMessage = `Welcome to PK2 OS 0.0.1 (${userAgent})`
    this.addOutput(welcomeMessage, "info")
    this.addOutput("", "info")
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (this.isExited) return

    // Skip events from mobile input - they're handled by handleMobileKeyDown
    if (this.mobileInput && event.target === this.mobileInput) {
      return
    }

    // Special keys
    if (event.key === "Enter") {
      event.preventDefault()
      this.handleEnter()
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      this.navigateHistory("up")
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      this.navigateHistory("down")
    } else if (event.key === "Tab") {
      event.preventDefault()
      event.stopPropagation()
      this.handleTabCompletion()
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      this.currentInput = this.currentInput.slice(0, -1)
      this.updateInputDisplay()
      this.resetTabCompletion()
    } else if (event.key === "Control" || event.key === "Ctrl") {
      // Don't handle control key alone
    } else if (event.ctrlKey && event.key === "c") {
      event.preventDefault()
      this.handleCtrlC()
    } else if (event.ctrlKey && event.key === "l") {
      event.preventDefault()
      this.clearOutput()
      this.showPrompt()
    } else if (event.ctrlKey && event.key === "w") {
      event.preventDefault()
      this.deleteWord()
      this.resetTabCompletion()
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      // Regular character input
      event.preventDefault()
      this.currentInput += event.key
      this.updateInputDisplay()
      this.resetTabCompletion()
    }
  }

  private async handleEnter(): Promise<void> {
    if (this.multilineMode) {
      if (this.currentInput.endsWith("\\")) {
        // Continue multiline
        this.multilineBuffer.push(this.currentInput.slice(0, -1))
        this.currentInput = ""
        this.updateInputDisplay()
        this.updatePromptText("> ")
      } else {
        // End multiline
        this.multilineBuffer.push(this.currentInput)
        const fullCommand = this.multilineBuffer.join(" ")
        this.multilineMode = false
        this.multilineBuffer = []
        this.currentInput = ""
        await this.executeCommand(fullCommand)
        this.showPrompt()
      }
    } else {
      if (this.currentInput.endsWith("\\")) {
        // Start multiline
        this.multilineMode = true
        this.multilineBuffer = [this.currentInput.slice(0, -1)]
        this.currentInput = ""
        this.updateInputDisplay()
        this.updatePromptText("> ")
      } else {
        // Normal command
        if (this.currentInput.trim()) {
          this.addToHistory(this.currentInput)
        }
        await this.executeCommand(this.currentInput)
        this.currentInput = ""
        this.showPrompt()
      }
    }
    this.resetTabCompletion()
  }

  private handleCtrlC(): void {
    if (this.multilineMode) {
      this.multilineMode = false
      this.multilineBuffer = []
      this.currentInput = ""
      this.updateInputDisplay()
      this.showPrompt()
    } else if (this.currentInput) {
      this.currentInput = ""
      this.updateInputDisplay()
      this.showPrompt()
    }
  }

  private async executeCommand(input: string): Promise<void> {
    if (!input.trim()) {
      return
    }

    this.envVars.set("PWD", this.currentPath)

    const chain = parseCommandChain(input)

    if (chain.commands.length === 1) {
      await this.executeSingleCommand(chain.commands[0])
    } else {
      await this.executeCommandChain(chain)
    }
  }

  private async executeSingleCommand(parsed: any): Promise<CommandResult> {
    const result = await executeCommand(
      parsed.command,
      parsed.args,
      parsed.flags,
      this.filesystem,
      this.currentPath,
      this.getCommandContext()
    )

    if (result.exit) {
      this.isExited = true
      this.addOutput("logout", "info")
      // Close window after brief delay
      setTimeout(() => {
        window.close()
      }, 500)
      return result
    }

    if (result.error) {
      this.addOutput(result.error, "error")
    } else if (result.output) {
      if (result.output === "__CLEAR__") {
        this.clearOutput()
      } else {
        this.addOutput(result.output, "info")
      }
    }

    if (result.newPath) {
      this.currentPath = result.newPath
      this.envVars.set("PWD", result.newPath)
    }

    return result
  }

  private async executeCommandChain(chain: any): Promise<void> {
    for (let i = 0; i < chain.commands.length; i++) {
      const result = await this.executeSingleCommand(chain.commands[i])

      // Stop if exit was called
      if (this.isExited) {
        return
      }

      // Check if we should continue to next command
      if (i < chain.operators.length) {
        const operator = chain.operators[i]
        const success = !result.error

        if (operator === "&&" && !success) {
          return // Stop on AND failure
        }
        if (operator === "||" && success) {
          return // Stop on OR success
        }
        // ";" always continues
      }
    }
  }

  private addOutput(text: string, type: "info" | "error" | "success"): void {
    const line = document.createElement("div")
    line.className = `output-line output-${type}`
    line.textContent = text
    this.outputElement.appendChild(line)

    // Notify favicon manager of this update
    this.faviconManager.notifyUpdate()

    // Auto-scroll to bottom
    this.outputElement.scrollTop = this.outputElement.scrollHeight
  }

  private clearOutput(): void {
    this.outputElement.innerHTML = ""
  }

  private showPrompt(): void {
    if (this.isExited) return

    this.currentInput = ""
    this.historyIndex = this.commandHistory.length

    // Remove cursor from previous prompt line
    if (this.currentPromptLine) {
      const oldCursor = this.currentPromptLine.querySelector(".cursor")
      if (oldCursor) {
        oldCursor.remove()
      }
    }

    // Create a new prompt line
    const promptLine = document.createElement("div")
    promptLine.className = "prompt-line"
    const promptSpan = document.createElement("span")
    promptSpan.className = "prompt-text"
    const displayPath = this.filesystem.getPathDisplay(this.currentPath)
    promptSpan.textContent = `visitor@terminal:${displayPath}$ `
    const inputSpan = document.createElement("span")
    inputSpan.className = "input-text"
    inputSpan.textContent = ""
    const cursorSpan = document.createElement("span")
    cursorSpan.className = "cursor"
    cursorSpan.textContent = "_"

    promptLine.appendChild(promptSpan)
    promptLine.appendChild(inputSpan)
    promptLine.appendChild(cursorSpan)
    this.outputElement.appendChild(promptLine)
    this.currentPromptLine = promptLine

    // Notify favicon manager of this update
    this.faviconManager.notifyUpdate()

    // Auto-scroll to bottom
    this.outputElement.scrollTop = this.outputElement.scrollHeight
  }

  private updatePromptText(promptText: string): void {
    if (this.currentPromptLine) {
      const promptSpan = this.currentPromptLine.querySelector(".prompt-text") as HTMLElement
      if (promptSpan) {
        promptSpan.textContent = promptText + " "
      }
    }
  }

  private updateInputDisplay(): void {
    if (this.currentPromptLine) {
      const inputSpan = this.currentPromptLine.querySelector(".input-text") as HTMLElement
      if (inputSpan) {
        inputSpan.textContent = this.currentInput
      }
    }
    // Auto-scroll to bottom
    this.outputElement.scrollTop = this.outputElement.scrollHeight
  }

  private navigateHistory(direction: "up" | "down"): void {
    if (direction === "up") {
      if (this.historyIndex > 0) {
        this.historyIndex--
        this.currentInput = this.commandHistory[this.historyIndex]
      }
    } else {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++
        this.currentInput = this.commandHistory[this.historyIndex]
      } else if (this.historyIndex === this.commandHistory.length - 1) {
        this.historyIndex++
        this.currentInput = ""
      }
    }
    this.updateInputDisplay()
  }

  private addToHistory(command: string): void {
    this.commandHistory.push(command)
    if (this.commandHistory.length > this.maxHistory) {
      this.commandHistory.shift()
    }
    this.historyIndex = this.commandHistory.length
  }

  private deleteWord(): void {
    // Delete the word before the cursor (Ctrl+W behavior)
    // Find the end of the current input
    let endIndex = this.currentInput.length

    // Skip any trailing spaces
    while (endIndex > 0 && this.currentInput[endIndex - 1] === " ") {
      endIndex--
    }

    // Find the start of the word by looking backwards for a space
    let startIndex = endIndex
    while (startIndex > 0 && this.currentInput[startIndex - 1] !== " ") {
      startIndex--
    }

    // Delete the word
    this.currentInput = this.currentInput.slice(0, startIndex) + this.currentInput.slice(endIndex)
    this.updateInputDisplay()
  }

  private resetTabCompletion(): void {
    this.tabCompletionState = {
      candidates: [],
      currentIndex: -1,
      originalInput: "",
      isActive: false,
    }
  }

  private parseCompletionContext(input: string): {
    type: "command" | "path"
    prefix: string
    beforePrefix: string
    pathDir: string
  } {
    // Check if we're completing a command or a path
    const trimmedInput = input.trim()
    const lastSpaceIndex = trimmedInput.lastIndexOf(" ")

    if (lastSpaceIndex === -1) {
      // No spaces - completing command
      return {
        type: "command",
        prefix: trimmedInput,
        beforePrefix: "",
        pathDir: "",
      }
    }

    // Has spaces - completing path argument
    const beforeLastWord = trimmedInput.substring(0, lastSpaceIndex + 1)
    const lastWord = trimmedInput.substring(lastSpaceIndex + 1)

    // Parse path: split into directory and filename parts
    const lastSlashIndex = lastWord.lastIndexOf("/")
    let pathDir = ""
    let prefix = ""

    if (lastSlashIndex === -1) {
      // No slashes in last word - complete in current directory
      pathDir = ""
      prefix = lastWord
    } else {
      // Has slashes - complete in subdirectory
      pathDir = lastWord.substring(0, lastSlashIndex + 1)
      prefix = lastWord.substring(lastSlashIndex + 1)
    }

    return {
      type: "path",
      prefix,
      beforePrefix: beforeLastWord + pathDir,
      pathDir,
    }
  }

  private getCompletionCandidates(context: {
    type: "command" | "path"
    prefix: string
    beforePrefix: string
    pathDir: string
  }): string[] {
    if (context.type === "command") {
      // Get command names
      const allCommands = Object.keys(commands)
      const candidates = allCommands
        .filter((name) => name.startsWith(context.prefix))
        .sort()
      return candidates
    } else {
      // Get file/directory contents
      let searchDir = context.pathDir || ""

      // Resolve the directory path
      const resolvedDir = this.filesystem.resolvePath(this.currentPath, searchDir || ".")

      // List directory contents
      const entries = this.filesystem.listDirectory(resolvedDir)

      // Filter by prefix, exclude . and .., apply directory slash convention
      const candidates = entries
        .filter(
          (node) =>
            node.name !== "." &&
            node.name !== ".." &&
            node.name.startsWith(context.prefix)
        )
        .filter((node) => {
          // Hide hidden files unless prefix starts with .
          if (node.name.startsWith(".") && !context.prefix.startsWith(".")) {
            return false
          }
          return true
        })
        .map((node) => node.name)
        .sort((a, b) => a.localeCompare(b))

      return candidates
    }
  }

  private applyCompletion(candidate: string, context: any): void {
    let newInput = ""

    if (context.type === "command") {
      newInput = candidate
    } else {
      newInput = context.beforePrefix + candidate
    }

    this.currentInput = newInput
    this.updateInputDisplay()
  }

  private handleTabCompletion(): void {
    // Check if we're repeating Tab (cycling through candidates)
    if (
      this.tabCompletionState.isActive &&
      this.currentInput !== this.tabCompletionState.originalInput
    ) {
      // We're in cycling mode
      const candidates = this.tabCompletionState.candidates
      if (candidates.length === 0) return

      // Move to next candidate
      this.tabCompletionState.currentIndex =
        (this.tabCompletionState.currentIndex + 1) % candidates.length
      const nextCandidate = candidates[this.tabCompletionState.currentIndex]

      // Re-parse context to get beforePrefix for path completion
      const context = this.parseCompletionContext(
        this.tabCompletionState.originalInput
      )
      this.applyCompletion(nextCandidate, context)
      return
    }

    // New tab completion
    const context = this.parseCompletionContext(this.currentInput)
    const candidates = this.getCompletionCandidates(context)

    if (candidates.length === 0) {
      // No matches - do nothing
      return
    }

    if (candidates.length === 1) {
      // Single match - apply immediately without cycling
      this.applyCompletion(candidates[0], context)
      return
    }

    // Multiple matches - show first and enable cycling
    this.tabCompletionState.candidates = candidates
    this.tabCompletionState.currentIndex = 0
    this.tabCompletionState.originalInput = this.currentInput
    this.tabCompletionState.isActive = true

    this.applyCompletion(candidates[0], context)
  }
}
