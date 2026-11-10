const { pool } = require("../config/mysql");

const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT category_id, category_name, parent_category_id
       FROM categories
       WHERE category_id BETWEEN 1 AND 6
       ORDER BY category_id`
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

module.exports = { getAllCategories };