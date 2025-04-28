export async function getGames(gameNames: string[]) {
  const games = await Promise.all(
    gameNames.map(async (name) => {
      console.log(`Searching ${name} on rawg`);

      const game = await fetch(
        `https://api.rawg.io/api/games?search=${name}&key=${process.env.RAWG_API_KEY}&page_size=1`
      );

      const data = await game.json();
      const gameData = data.results[0];

      const storeData = await fetch(
        `https://api.rawg.io/api/games/${gameData.id}/stores?key=${process.env.RAWG_API_KEY}`
      );
      const storeDataJson = await storeData.json();

      const storeDataWithName = await Promise.all(
        storeDataJson.results.map(async (el: any) => {
          const store = await fetch(
            `https://api.rawg.io/api/stores/${el.store_id}?key=${process.env.RAWG_API_KEY}`
          );
          const storeJson = await store.json();
          console.log({ storeJson });

          return {
            ...el,
            store: { name: storeJson.name, id: storeJson.id },
          };
        })
      );

      return { ...gameData, storeLinks: storeDataWithName };
    })
  );

  return games;
}
