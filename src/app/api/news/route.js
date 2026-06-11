import Parser from 'rss-parser';
import { NextResponse } from 'next/server';

const parser = new Parser();

const FEEDS = {
  tech: 'http://feeds.bbci.co.uk/news/technology/rss.xml',
  crypto: 'https://news.google.com/rss/search?q=Cryptocurrency&hl=en-US&gl=US&ceid=US:en',
  ai: 'https://news.google.com/rss/search?q=Artificial+Intelligence&hl=en-US&gl=US&ceid=US:en',
  politics: 'https://news.google.com/rss/headlines/section/topic/POLITICS?hl=en-US&gl=US&ceid=US:en'
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || 'tech';
    const feedUrl = FEEDS[topic] || FEEDS.tech;

    const feed = await parser.parseURL(feedUrl);
    
    const items = feed.items.slice(0, 5).map(item => ({
      id: item.guid || item.link,
      title: item.title,
      link: item.link,
      time: item.pubDate,
      source: feed.title || 'News'
    }));

    return NextResponse.json({ items }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('RSS Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
