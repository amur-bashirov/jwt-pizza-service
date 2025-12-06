// metrics.js
const os = require("os");
const config = require("./config.js");
const axios = require("axios");

//
// ----------------------------
//  Send single-metric OTLP
// ----------------------------
//
async function sendMetricToGrafana(metricName, metricValue, type, unit = "") {
  const metric = {
    resourceMetrics: [
      {
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: config.metrics.source } }
          ]
        },
        scopeMetrics: [
          {
            metrics: [
              {
                name: metricName,
                unit: unit,
                [type]: {
                  dataPoints: [
                    {
                      asInt: Number.isInteger(metricValue)
                        ? metricValue
                        : undefined,
                      asDouble: !Number.isInteger(metricValue)
                        ? metricValue
                        : undefined,
                      timeUnixNano: Date.now() * 1_000_000
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };

  if (type === "sum") {
    const m = metric.resourceMetrics[0].scopeMetrics[0].metrics[0];
    m.sum.aggregationTemporality = "AGGREGATION_TEMPORALITY_CUMULATIVE";
    m.sum.isMonotonic = true;
  }

  try {
    await axios.post(config.metrics.url, metric, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.metrics.apiKey}`,
      },
    });
  } catch (err) {
    console.error("ERROR sending metric", metricName, err.response?.data || err.message);
  }
}

//
// ==============================
//       METRICS CLASS
// ==============================
//
class Metrics {
  constructor() {
    this.reset();
  }

  reset() {
    this.requestCounts = { GET: 0, POST: 0, PUT: 0, DELETE: 0 };
    this.requestLatency = [];
    this.pizzaPurchases = [];

    this.system = { cpu: 0, memory: 0 };

    // Active users
    this.activeUsers = new Map();
    this.activeUserWindowMs = 5 * 60 * 1000;

    // Auth attempts/min
    this.authAttempts = [];
    this.authWindowMs = 60 * 1000;

    // Running counts (monotonic)
    this.totalAuthAttempts = 0;
    this.totalPizzaPurchases = 0;
  }

  getActiveUserCount() {
    const cutoff = Date.now() - this.activeUserWindowMs;
    for (const [id, ts] of this.activeUsers.entries()) {
      if (ts < cutoff) this.activeUsers.delete(id);
    }
    return this.activeUsers.size;
  }

  authenticationAttempt(success) {
    this.authAttempts.push({ success, ts: Date.now() });
    this.totalAuthAttempts++;
  }

  getAuthAttemptsPerMinute() {
    const cutoff = Date.now() - this.authWindowMs;
    this.authAttempts = this.authAttempts.filter(a => a.ts >= cutoff);
    return this.authAttempts.length;
  }

  requestTracker = (req, res, next) => {
    const start = Date.now();
    this.requestCounts[req.method]++;

    const userId = req.headers["x-user-id"] || req.user?.id;
    if (userId) this.activeUsers.set(userId, Date.now());

    res.on("finish", () => {
      this.requestLatency.push({
        route: req.originalUrl,
        method: req.method,
        latencyMs: Date.now() - start
      });
    });

    next();
  };

  pizzaPurchase(success, latencyMs, price) {
    this.pizzaPurchases.push({ success, latencyMs, price, ts: Date.now() });
    this.totalPizzaPurchases++;
  }

  updateSystem() {
    const cpuLoad = os.loadavg()[0] / os.cpus().length;
    const total = os.totalmem();
    const free = os.freemem();

    this.system.cpu = Number((cpuLoad * 100).toFixed(2));
    this.system.memory = Number((((total - free) / total) * 100).toFixed(2));
  }

  //
  // ============================================
  //         SEND ALL METRICS ONE-BY-ONE
  // ============================================
  //
  async sendToGrafana() {
    this.updateSystem();

    //
    // Request counts (monotonic sum)
    //
    for (const method of ["GET", "POST", "PUT", "DELETE"]) {
      await sendMetricToGrafana(
        "requests_total",
        this.requestCounts[method],
        "sum",
        "count"
      );
    }

    //
    // Request latency (gauge)
    //
    for (const l of this.requestLatency) {
      await sendMetricToGrafana(
        `request_latency_ms_${l.method}_${l.route}`,
        l.latencyMs,
        "gauge",
        "ms"
      );
    }
    this.requestLatency = [];

    //
    // System metrics
    //
    await sendMetricToGrafana("cpu_percent", this.system.cpu, "gauge", "%");
    await sendMetricToGrafana("memory_percent", this.system.memory, "gauge", "%");

    //
    // Pizza metrics
    //
    for (const p of this.pizzaPurchases) {
      await sendMetricToGrafana(
        "pizza_purchase_latency_ms",
        p.latencyMs,
        "gauge",
        "ms"
      );

      await sendMetricToGrafana(
        "pizza_purchase_price",
        p.price,
        "gauge",
        "usd"
      );
    }
    this.pizzaPurchases = [];

    //
    // Active users
    //
    await sendMetricToGrafana(
      "active_users",
      this.getActiveUserCount(),
      "gauge",
      "count"
    );

    //
    // Auth attempts / min
    //
    await sendMetricToGrafana(
      "auth_attempts_per_minute",
      this.getAuthAttemptsPerMinute(),
      "gauge",
      "count"
    );

    //
    // Total auth attempts (monotonic)
    //
    await sendMetricToGrafana(
      "auth_attempts_total",
      this.totalAuthAttempts,
      "sum",
      "count"
    );

    //
    // Total pizza purchases (monotonic)
    //
    await sendMetricToGrafana(
      "pizza_purchases_total",
      this.totalPizzaPurchases,
      "sum",
      "count"
    );
  }
}

module.exports = new Metrics();


