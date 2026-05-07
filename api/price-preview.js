module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://caresaver.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // rest of code...
};
const snowflake = require("snowflake-sdk");

function createConnection() {
  return snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: "CARESAVER_MARKETING",
    schema: "PUBLIC_SEARCH",
    role: process.env.SNOWFLAKE_ROLE
  });
}

function executeQuery(connection, sqlText, binds) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete: function (err, stmt, rows) {
        if (err) reject(err);
        else resolve(rows);
      }
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { zip, procedure } = req.body || {};

  if (!/^\d{5}$/.test(zip || "")) {
    return res.status(400).json({ error: "Invalid ZIP code" });
  }

  if (!procedure) {
    return res.status(400).json({ error: "Procedure is required" });
  }

  const connection = createConnection();

  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const sql = `
      SELECT
        ZIP_CODE,
        CONSUMER_FRIENDLY_TERM,
        PROVIDER_COUNT,
        ROUND(LOW_PRICE, 0) AS LOW_PRICE,
        ROUND(HIGH_PRICE, 0) AS HIGH_PRICE,
        ROUND(MEDIAN_PRICE, 0) AS MEDIAN_PRICE,
        ROUND(PRICE_SPREAD, 0) AS PRICE_SPREAD
      FROM CARESAVER_SEARCH_PREVIEW
      WHERE ZIP_CODE = ?
        AND CONSUMER_FRIENDLY_TERM = ?
      LIMIT 1
    `;

    const rows = await executeQuery(connection, sql, [zip, procedure]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No pricing data found" });
    }

    const row = rows[0];

    return res.status(200).json({
      zip: row.ZIP_CODE,
      procedure: row.CONSUMER_FRIENDLY_TERM,
      provider_count: row.PROVIDER_COUNT,
      low_price: row.LOW_PRICE,
      high_price: row.HIGH_PRICE,
      median_price: row.MEDIAN_PRICE,
      price_spread: row.PRICE_SPREAD
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  } finally {
    connection.destroy();
  }
};