import { Hono } from "hono";
import { html } from "hono/html";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const terminalHTML = html`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Terminal Interface</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div id="terminal-container">
      <div id="terminal-output"></div>
    </div>
    <script defer src="/terminal.js"></script>
  </body>
</html>`;

app.get("/", (c) => {
  return c.html(terminalHTML);
});

export default app;
