class Logger {
  constructor(config) {
    this.config = config;
  }

  httpLogger = (req, res, next) => {
    let send = res.send;
    res.send = (resBody) => {
      const logData = {
        authorized: !!req.headers.authorization,
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        reqBody: req.body,        
        resBody: body 
      };
      const level = this.statusToLogLevel(res.statusCode);
      this.log(level, 'http', logData);
      res.send = send;
      return res.send(resBody);
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

  sanitizeAndStringify(obj) {
    const cloned = JSON.parse(JSON.stringify(obj)); // deep clone

    // Remove passwords
    const hidePassword = (o) => {
      if (!o || typeof o !== "object") return;
      for (const key in o) {
        if (key.toLowerCase().includes("password")) {
          o[key] = "*****";
        } else {
          hidePassword(o[key]);
        }
      }
    };

    hidePassword(cloned);

    return JSON.stringify(cloned);
  }

  async sendLogToGrafana(event) {
    // Send to factory
    try {
      await fetch(`${this.config.factory.url}/api/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.config.factory.apiKey,
          event
        })
      });
    } catch (e) {
      console.log("Failed to send log to factory:", e);
    }

    // Send to Grafana Loki
    try {
      await fetch(this.config.logging.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.logging.userId}:${this.config.logging.apiKey}`
        },
        body: JSON.stringify(event)
      });
    } catch (e) {
      console.log("Failed to send log to Grafana:", e);
    }
  }
}
module.exports = Logger;