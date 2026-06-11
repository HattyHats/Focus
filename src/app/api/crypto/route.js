import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids') || 'bitcoin,ethereum,solana,cardano';

    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 30 } // cache for 30 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }
    
    const data = await res.json();
    
    // Format data for the widget
    const formattedData = data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_percentage_24h
    }));

    return NextResponse.json({ items: formattedData });
  } catch (error) {
    console.error('Crypto API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch crypto' }, { status: 500 });
  }
}
