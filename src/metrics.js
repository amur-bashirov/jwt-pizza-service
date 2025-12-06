// metrics.js
const os = require("os");
const config = require("./config.js");
const axios = require("axios");

class Metrics {
  constructor() {
    this.reset();
  }

  reset() {
    this.requestCounts = { GET: 0, POST: 0, PUT: 0, DELETE: 0 };
    this.requestLatency = [];
    this.pizzaPurchases = [];

    this.system = {
      cpu: 0,
      memory: 0,
    };
  }

  // ---------------------------------------------------------
  // 1. EXPRESS MIDDLEWARE — track ALL endpoint requests
  // ---------------------------------------------------------
  requestTracker = (req, res, next) => {
    const start = Date.now();
    this.requestCounts[req.method]++;

    res.on("finish", () => {
      const latency = Date.now() - start;
      this.requestLatency.push({
        route: req.originalUrl,
        method: req.method,
        latencyMs: latency,
      });
    });

    next();
  };

  // ---------------------------------------------------------
  // 2. Track pizza purchases
  // ---------------------------------------------------------
  pizzaPurchase(success, latencyMs, price) {
    this.pizzaPurchases.push({
      success,
      latencyMs,
      price,
      ts: Date.now(),
    });
  }

  // ---------------------------------------------------------
  // 3. System metrics (CPU, Memory)
  // ---------------------------------------------------------
  updateSystem() {
    const cpuLoad = os.loadavg()[0] / os.cpus().length;
    const total = os.totalmem();
    const free = os.freemem();

    this.system.cpu = Number((cpuLoad * 100).toFixed(2));
    this.system.memory = Number((((total - free) / total) * 100).toFixed(2));
  }

  // ---------------------------------------------------------
  // 4. Convert metrics to proper OTLP format for Grafana Cloud
  // ---------------------------------------------------------
  buildOTLP() {
    this.updateSystem();

    const now = Date.now() * 1_000_000;

    let metrics = [];

    // ---- request counts ----
    for (let method of ["GET", "POST", "PUT", "DELETE"]) {
      metrics.push({
        name: "requests_total",
        sum: {
          aggregationTemporality: "AGGREGATION_TEMPORALITY_CUMULATIVE",
          isMonotonic: true,
          dataPoints: [
            {
              asInt: this.requestCounts[method],
              attributes: [
                { key: "method", value: { stringValue: method } }
              ],
              timeUnixNano: now
            }
          ]
        }
      });
    }

    // ---- latency ----
    this.requestLatency.forEach((l) => {
      metrics.push({
        name: "request_latency_ms",
        gauge: {
          dataPoints: [
            {
              asDouble: l.latencyMs,
              attributes: [
                { key: "route", value: { stringValue: l.route } },
                { key: "method", value: { stringValue: l.method } }
              ],
              timeUnixNano: now
            }
          ]
        }
      });
    });

    // ---- system metrics ----
    metrics.push({
      name: "cpu_percent",
      gauge: {
        dataPoints: [{ asDouble: this.system.cpu, timeUnixNano: now }]
      }
    });

    metrics.push({
      name: "memory_percent",
      gauge: {
        dataPoints: [{ asDouble: this.system.memory, timeUnixNano: now }]
      }
    });

    // ---- pizza purchase metrics ----
    this.pizzaPurchases.forEach((p) => {
      metrics.push({
        name: "pizza_purchase_latency_ms",
        gauge: {
          dataPoints: [
            {
              asDouble: p.latencyMs,
              attributes: [
                { key: "success", value: { boolValue: p.success } }
              ],
              timeUnixNano: now
            }
          ]
        }
      });

      metrics.push({
        name: "pizza_purchase_price",
        gauge: {
          dataPoints: [
            {
              asDouble: p.price,
              attributes: [
                { key: "success", value: { boolValue: p.success } }
              ],
              timeUnixNano: now
            }
          ]
        }
      });
    });

    return {
      resourceMetrics: [
        {
          resource: {
            attributes: [
              {
                key: "service.name",
                value: { stringValue: config.metrics.source }
              }
            ]
          },
          scopeMetrics: [
            {
              metrics
            }
          ]
        }
      ]
    };
  }

  // ---------------------------------------------------------
  // 5. SEND TO GRAFANA CLOUD (OTLP endpoint)
  // ---------------------------------------------------------
  async sendToGrafana() {
    const payload = this.buildOTLP();

    try {
      await axios.post(config.metrics.url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.metrics.apiKey}`,
        },
      });

      console.log("Metrics sent");

      // Clear per-interval data
      this.requestLatency = [];
      this.pizzaPurchases = [];

    } catch (err) {
      console.error("ERROR sending metrics:", err.response?.data || err.message);
    }
  }
}

module.exports = new Metrics();

