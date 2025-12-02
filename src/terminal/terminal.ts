import { VirtualFileSystem } from "./filesystem"
import { parseCommand } from "./parser"
import { executeCommand } from "./commands"

export class TerminalController {
  private filesystem: VirtualFileSystem
  private currentPath: string = "/home/visitor";
  private commandHistory: string[] = [];
  private historyIndex: number = 0;
  private currentInput: string = "";
  private multilineMode: boolean = false;
  private multilineBuffer: string[] = [];
  private outputElement: HTMLElement
  private currentPromptLine: HTMLElement | null = null;
  private maxHistory: number = 100;

  constructor() {
    this.filesystem = new VirtualFileSystem()
    this.outputElement = document.getElementById("terminal-output")!

    if (!this.outputElement) {
      throw new Error("Terminal output element not found in DOM")
    }

    this.initialize()
  }

  private initialize(): void {
    this.showPrompt()
    document.addEventListener("keydown", (e) => this.handleKeyDown(e))
  }

  handleKeyDown(event: KeyboardEvent): void {
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
    } else if (event.key === "Backspace") {
      event.preventDefault()
      this.currentInput = this.currentInput.slice(0, -1)
      this.updateInputDisplay()
    } else if (event.key === "Control" || event.key === "Ctrl") {
      // Don't handle control key alone
    } else if (event.ctrlKey && event.key === "c") {
      event.preventDefault()
      this.handleCtrlC()
    } else if (event.ctrlKey && event.key === "l") {
      event.preventDefault()
      this.clearOutput()
      this.showPrompt()
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      // Regular character input
      event.preventDefault()
      this.currentInput += event.key
      this.updateInputDisplay()
    }
  }

  private handleEnter(): void {
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
        this.executeCommand(fullCommand)
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
        this.executeCommand(this.currentInput)
        this.currentInput = ""
        this.showPrompt()
      }
    }
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

  private executeCommand(input: string): void {
    if (!input.trim()) {
      return
    }

    const parsed = parseCommand(input)
    const result = executeCommand(
      parsed.command,
      parsed.args,
      parsed.flags,
      this.filesystem,
      this.currentPath
    )

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
    }
  }

  private addOutput(text: string, type: "info" | "error" | "success"): void {
    const line = document.createElement("div")
    line.className = `output-line output-${type}`
    line.textContent = text
    this.outputElement.appendChild(line)

    // Auto-scroll to bottom
    this.outputElement.scrollTop = this.outputElement.scrollHeight
  }

  private clearOutput(): void {
    this.outputElement.innerHTML = ""
  }

  private showPrompt(): void {
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
}
