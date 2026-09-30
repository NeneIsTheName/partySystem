// src/composables/useSQLite.ts
import { ref } from 'vue';

const worker = new Worker(
  new URL('../workers/sqlite.worker.ts', import.meta.url),
  { type: 'module' }
);

let messageId = 0;
const pending = new Map<number, { resolve: Function; reject: Function }>();

// Promise die resolvet zodra de worker 'ready' stuurt
let resolveReady: () => void;
const ready = new Promise<void>((resolve) => { resolveReady = resolve; });

worker.onmessage = (e) => {
  const { id, result, error, type } = e.data;

  // Ready-signaal van de worker
  if (type === 'ready') {
    resolveReady();
    return;
  }

  const handler = pending.get(id);
  if (!handler) return;
  pending.delete(id);
  if (error) handler.reject(new Error(error));
  else handler.resolve(result);
};

const send = async <T = unknown>(sql: string, params?: any[]): Promise<T> => {
  await ready;   // ← wacht tot worker klaar is
  return new Promise<T>((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, sql, params });
  });
};

const drinks = ref<any[]>([]);

const selectDrinks = async () => {
  const data = await send<any[]>('SELECT * FROM drinks ORDER BY id ASC');
  drinks.value = data;
  return drinks.value;
};

const insertDrink = async (name: string) => {
  await send('INSERT INTO drinks (name) VALUES (?)', [name]);
  const [newRow] = await send<any[]>(
    'SELECT * FROM drinks WHERE id = last_insert_rowid()'
  );
  drinks.value.push(newRow);
  return newRow;
};

const updateDrinkName = async (id: number, name: string) => {
    await send('UPDATE drinks SET name = ? WHERE id = ?', [name, id]);

    const drink = drinks.value.find(d => d.id === Number(id));
    if (drink) drink.name = name;
};

const updateDrinkSold = async (id: number, delta: number) => {
    await send('UPDATE drinks SET sold = sold + ? WHERE id = ?', [delta, id]);
    const drink = drinks.value.find(d => d.id === Number(id));
    if (drink) drink.sold += delta;
};

const deleteDrink = async (id: number) => {
    await send('DELETE FROM drinks WHERE id=?;', [id]);
    drinks.value = drinks.value.filter(drink => drink.id !== id);
};

export function useSQLite() {
  return { drinks, selectDrinks, insertDrink, updateDrinkName, updateDrinkSold, deleteDrink, send };
}