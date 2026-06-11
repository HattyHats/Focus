import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1', {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 60 } // cache for 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }
    
    const data = await res.json();
    
    // Format data for the heatmap
    const formattedData = data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_percentage_24h,
      marketCap: coin.market_cap
    }));

    return NextResponse.json({ items: formattedData });
  } catch (error) {
    console.error('Crypto Heatmap API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto heatmap data' }, { status: 500 });
  }
}
