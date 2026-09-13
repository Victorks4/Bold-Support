type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function log(level: LogLevel, event: string, payload?: unknown) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    payload,
  }

  if (import.meta.env.DEV) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info
    fn('[BoldSupport]', entry)
  }
}

export const logger = {
  debug: (event: string, payload?: unknown) => log('debug', event, payload),
  info: (event: string, payload?: unknown) => log('info', event, payload),
  warn: (event: string, payload?: unknown) => log('warn', event, payload),
  error: (event: string, payload?: unknown) => log('error', event, payload),
}
