const express = require('express');
const fs = require('fs');
const path = require('path');
const { pool, query } = require('../db');
const { authMiddleware, adminMiddleware } = require('../auth');

const router = express.Router();

// GET /api/settings - Public settings and navigation links
router.get('/', async (req, res, next) => {
  try {
    // Fetch settings
    const settingsRes = await query('SELECT key, value FROM system_settings');
    const settings = {};
    settingsRes.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Fetch footer columns sorted by display_order
    const colsRes = await query('SELECT key_name, title, display_order FROM footer_columns ORDER BY display_order ASC, id ASC');
    const footerColumns = colsRes.rows.map(r => ({
      key_name: r.key_name,
      title: r.title,
      display_order: r.display_order
    }));

    // Fetch active navigation links sorted by display_order
    const linksRes = await query(
      'SELECT id, menu_type, label, url, is_external, display_order FROM navigation_links WHERE is_active = true ORDER BY display_order ASC, id ASC'
    );

    const navigation = {
      navbar: [],
      footer_socials: []
    };

    // Initialize links arrays for each dynamic column
    footerColumns.forEach(col => {
      navigation[`footer_${col.key_name}`] = [];
    });

    linksRes.rows.forEach(row => {
      if (!navigation[row.menu_type]) {
        navigation[row.menu_type] = [];
      }
      navigation[row.menu_type].push({
        id: row.id,
        label: row.label,
        url: row.url,
        isExternal: row.is_external,
        displayOrder: row.display_order
      });
    });

    res.json({
      site_name: settings.site_name || 'AllCanAccess',
      navbar_logo_url: settings.navbar_logo_url || '/allcanaccess.png',
      footer_logo_url: settings.footer_logo_url || '/allcanaccess_footer.png',
      portal_hero_bg_url: settings.portal_hero_bg_url || '',
      portal_hero_badge: settings.portal_hero_badge || '',
      portal_hero_heading: settings.portal_hero_heading || '',
      portal_hero_subheading: settings.portal_hero_subheading || '',
      portal_hero_tags: settings.portal_hero_tags ? JSON.parse(settings.portal_hero_tags) : null,
      portal_stats: settings.portal_stats ? JSON.parse(settings.portal_stats) : null,
      portal_ask_placeholder: settings.portal_ask_placeholder || '',
      portal_search_placeholder: settings.portal_search_placeholder || '',
      portal_ask_topics: settings.portal_ask_topics ? JSON.parse(settings.portal_ask_topics) : null,
      footer_columns: footerColumns,
      navigation
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings - Update general settings (site_name, portal hero configs, discussions config) (Admin only)
router.put('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { 
    site_name, 
    portal_hero_badge, 
    portal_hero_heading, 
    portal_hero_subheading, 
    portal_hero_tags, 
    portal_stats, 
    portal_hero_bg_url,
    portal_ask_placeholder,
    portal_search_placeholder,
    portal_ask_topics
  } = req.body || {};
  
  if (site_name && !site_name.trim()) {
    res.status(400).json({ error: 'Site name cannot be empty if provided.' });
    return;
  }

  try {
    const upsert = async (k, v) => {
      if (v === undefined) return;

      // If we are clearing a URL field (e.g., removing an image), delete the old physical file
      if (v === '' && (k.endsWith('_logo_url') || k === 'portal_hero_bg_url')) {
        const oldSettings = await query('SELECT value FROM system_settings WHERE key = $1', [k]);
        if (oldSettings.rows.length > 0) {
          const oldUrl = oldSettings.rows[0].value;
          if (oldUrl && oldUrl.startsWith('/api/uploads/')) {
            const oldFile = path.join(__dirname, '..', 'uploads', path.basename(oldUrl));
            if (fs.existsSync(oldFile)) {
              try {
                fs.unlinkSync(oldFile);
              } catch (e) {
                console.error('Failed to delete old image file on clearing:', e);
              }
            }
          }
        }
      }

      await query(
        "INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
        [k, v]
      );
    };

    if (site_name) await upsert('site_name', site_name.trim());
    await upsert('portal_hero_badge', portal_hero_badge);
    await upsert('portal_hero_heading', portal_hero_heading);
    await upsert('portal_hero_subheading', portal_hero_subheading);
    await upsert('portal_hero_bg_url', portal_hero_bg_url);
    await upsert('portal_ask_placeholder', portal_ask_placeholder);
    await upsert('portal_search_placeholder', portal_search_placeholder);
    
    if (portal_hero_tags !== undefined) {
      await upsert('portal_hero_tags', JSON.stringify(portal_hero_tags));
    }
    if (portal_stats !== undefined) {
      await upsert('portal_stats', JSON.stringify(portal_stats));
    }
    if (portal_ask_topics !== undefined) {
      await upsert('portal_ask_topics', JSON.stringify(portal_ask_topics));
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/settings/upload-logo - Upload and overwrite a branding logo (Admin only)
router.post('/upload-logo', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { data, filename, key } = req.body || {};
  if (!data || !filename || !key) {
    res.status(400).json({ error: 'Data, filename, and setting key are required.' });
    return;
  }
  if (key !== 'navbar_logo_url' && key !== 'footer_logo_url' && key !== 'portal_hero_bg_url') {
    res.status(400).json({ error: 'Invalid file key.' });
    return;
  }

  // Expecting format: "data:image/png;base64,iVBORw0KGgo..."
  const match = data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: 'Invalid base64 image data.' });
    return;
  }

  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const size = buffer.length;

  // Validation: Logo size MUST be smaller than 2MB
  if (size > 2 * 1024 * 1024) {
    res.status(400).json({ error: 'Logo file size must be smaller than 2MB.' });
    return;
  }

  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(filename) || '.png';
    const cleanFilename = `${key}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, cleanFilename);

    // Save the new file to server/uploads/
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/api/uploads/${cleanFilename}`;

    // Query and clean up old custom uploaded file if one exists
    const oldSettings = await query('SELECT value FROM system_settings WHERE key = $1', [key]);
    if (oldSettings.rows.length > 0) {
      const oldUrl = oldSettings.rows[0].value;
      if (oldUrl.startsWith('/api/uploads/')) {
        const oldFile = path.join(uploadsDir, path.basename(oldUrl));
        if (fs.existsSync(oldFile)) {
          try {
            fs.unlinkSync(oldFile);
          } catch (e) {
            console.error('Failed to delete old logo file:', e);
          }
        }
      }
    }

    // Save configuration url in database
    await query(
      "INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
      [key, relativeUrl]
    );

    res.json({ url: relativeUrl });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/navigation - Overwrite navigation links for a menu type (Admin only)
router.put('/navigation', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { menu_type, links } = req.body || {};
  if (!menu_type || !Array.isArray(links)) {
    res.status(400).json({ error: 'Menu type and links array are required.' });
    return;
  }

  try {
    const colsRes = await query('SELECT key_name FROM footer_columns');
    const dynamicFooterTypes = colsRes.rows.map(r => `footer_${r.key_name}`);
    const allowedTypes = ['navbar', 'footer_socials', ...dynamicFooterTypes];

    if (!allowedTypes.includes(menu_type)) {
      res.status(400).json({ error: 'Invalid menu type.' });
      return;
    }
  } catch (err) {
    next(err);
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Remove existing links of this type
    await client.query('DELETE FROM navigation_links WHERE menu_type = $1', [menu_type]);

    // Insert new links
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      await client.query(
        'INSERT INTO navigation_links (menu_type, label, url, is_external, display_order) VALUES ($1, $2, $3, $4, $5)',
        [menu_type, link.label.trim(), link.url.trim(), !!link.isExternal, i + 1]
      );
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Helper function to slugify text
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')           // Replace spaces with _
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars (except - and _)
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// POST /api/settings/footer-columns - Create a new footer column (Admin only)
router.post('/footer-columns', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { title } = req.body || {};
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Column title is required.' });
    return;
  }

  const key_name = slugify(title);
  if (!key_name) {
    res.status(400).json({ error: 'Invalid column title for generating a key.' });
    return;
  }

  if (key_name === 'socials' || key_name === 'navbar') {
    res.status(400).json({ error: 'Column title conflicts with reserved system menus.' });
    return;
  }

  try {
    const existing = await query('SELECT 1 FROM footer_columns WHERE key_name = $1', [key_name]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: `A column with the key '${key_name}' already exists.` });
      return;
    }

    const orderRes = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM footer_columns');
    const display_order = orderRes.rows[0].max_order + 1;

    const insertRes = await query(
      'INSERT INTO footer_columns (key_name, title, display_order) VALUES ($1, $2, $3) RETURNING *',
      [key_name, title.trim(), display_order]
    );
    res.json(insertRes.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/footer-columns - Update column order and titles (Admin only)
router.put('/footer-columns', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { columns } = req.body || {};
  if (!Array.isArray(columns)) {
    res.status(400).json({ error: 'Columns array is required.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (!col.key_name || !col.title || !col.title.trim()) {
        throw new Error('Each column must have a key_name and title.');
      }
      await client.query(
        'UPDATE footer_columns SET title = $1, display_order = $2 WHERE key_name = $3',
        [col.title.trim(), col.display_order ?? i, col.key_name]
      );
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/settings/footer-columns/:key - Delete a column and its links (Admin only)
router.delete('/footer-columns/:key', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { key } = req.params;
  if (!key) {
    res.status(400).json({ error: 'Column key is required.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete associated navigation links
    const menu_type = `footer_${key}`;
    await client.query('DELETE FROM navigation_links WHERE menu_type = $1', [menu_type]);

    // Delete the column
    const deleteRes = await client.query('DELETE FROM footer_columns WHERE key_name = $1 RETURNING *', [key]);
    if (deleteRes.rowCount === 0) {
      throw new Error('Column not found.');
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
