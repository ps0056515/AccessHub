const express = require('express');

const router = express.Router();

const FEED_URL = 'https://www.w3.org/news/feed/';

function decodeXml(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match = itemRegex.exec(xml);

  while (match) {
    const block = match[1];
    const title = decodeXml(
      block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || '',
    );
    const link = block.match(/<link>([^<]*)<\/link>/)?.[1]?.trim() || '';
    const pubDate = block.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1]?.trim() || '';

    if (title && link) {
      items.push({ title, link, pubDate });
    }

    match = itemRegex.exec(xml);
  }

  return items;
}

router.get('/feed', async (_req, res, next) => {
  try {
    const response = await fetch(FEED_URL, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Could not load news feed.' });
      return;
    }

    const xml = await response.text();
    const items = parseRssItems(xml);

    res.json({
      feedUrl: FEED_URL,
      source: 'W3C News',
      items: items.slice(0, 20),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
