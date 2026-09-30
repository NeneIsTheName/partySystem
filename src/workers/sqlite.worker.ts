// src/workers/sqlite.worker.ts
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { migrations } from '../db/migrations';

const start = (sqlite3: any) => {
  const db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3');

  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY);`);
  const applied = db
    .exec({ sql: 'SELECT version FROM _migrations', returnValue: 'resultRows' })
    .map((r: any) => r[0]);

  for (const m of migrations) {
    if (!applied.includes(m.version)) {
      db.exec(m.sql);
      db.exec({ sql: 'INSERT INTO _migrations (version) VALUES (?)', bind: [m.version] });
    }
  }

  self.onmessage = (e) => {
    const { id, sql, params } = e.data;
    try {
      const result = db.exec({
        sql, bind: params,
        returnValue: 'resultRows',
        rowMode: 'object',
      });
      self.postMessage({ id, result });
    } catch (err: any) {
      self.postMessage({ id, error: err.message });
    }
  };

  // ← SIGNAAL: worker is klaar
  self.postMessage({ type: 'ready' });
};

sqlite3InitModule().then(start);