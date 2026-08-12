const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:TestAdmin@103.182.211.219:5432/accesshub' });

async function run() {
  try {
    const res = await pool.query("SELECT * FROM navigation_links WHERE menu_type = 'navbar' AND url = '/games'");
    if (res.rows.length === 0) {
      await pool.query(
        "INSERT INTO navigation_links (menu_type, label, url, is_external, display_order, is_active) VALUES ('navbar', 'Games', '/games', false, 8, true)"
      );
      console.log('Successfully added Games to navbar');
    } else {
      console.log('Games already in navbar');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
