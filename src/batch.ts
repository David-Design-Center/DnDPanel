export async function fetchBatch(
  ids: string[],
  format: 'full' | 'raw' = 'full'
): Promise<any[]> {
  if (ids.length === 0) return [];
  // Fetch each message via Netlify function
  const results = await Promise.all(
    ids.map(id =>
      fetch(`/.netlify/functions/fetchMessage?id=${id}&format=${format}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch message ${id}`);
          return res.json();
        })
    )
  );
  return results;
}
