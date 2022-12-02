{
  Error: [
    {
      errno: -103,
      code: "ECONNABORTED",
      syscall: "read"
    },
  ],
  FetchError: [
    {
      message: "request to https://api.telegram.org/bot5459972499:[REDACTED]/getChatMember failed, reason: write EPIPE"
      type: "system",
      errno: "EPIPE",
      code: "EPIPE",
      constructor: function FetchError(message, type, systemError) {...},
      name: "FetchError"
    },
    {
      message: "request to https://api.telegram.org/bot5459972499:[REDACTED]/getChatMember failed, reason: socket hang up"
      type: "system",
      errno: "ECONNRESET",
      code: "ECONNRESET",
      constructor: function FetchError(message, type, systemError) {...},
      name: "FetchError"
    },
    {
      message: "request to https://api.telegram.org/bot5459972499:[REDACTED]/getChatMember failed, reason: Client network socket disconnected before secure TLS connection was established",
      type: "system",
      errno: "ECONNRESET",
      code: "ECONNRESET",
      constructor: function FetchError(message, type, systemError) {...},
      name: "FetchError"
    },
  ]
}