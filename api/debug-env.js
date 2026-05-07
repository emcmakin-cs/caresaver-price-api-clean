module.exports = async function handler(req, res) {
  return res.status(200).json({
    SNOWFLAKE_ACCOUNT: !!process.env.SNOWFLAKE_ACCOUNT,
    SNOWFLAKE_USERNAME: !!process.env.SNOWFLAKE_USERNAME,
    SNOWFLAKE_PASSWORD: !!process.env.SNOWFLAKE_PASSWORD,
    SNOWFLAKE_WAREHOUSE: !!process.env.SNOWFLAKE_WAREHOUSE,
    SNOWFLAKE_ROLE: !!process.env.SNOWFLAKE_ROLE,
    account_preview: process.env.SNOWFLAKE_ACCOUNT
      ? process.env.SNOWFLAKE_ACCOUNT.slice(0, 4) + "..."
      : null
  });
};