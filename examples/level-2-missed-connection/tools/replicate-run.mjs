#!/usr/bin/env node
// Runs Replicate predictions concurrently from a job spec file and writes
// outputs + provenance to disk.
//
//   node tools/replicate-run.mjs jobs.json
//
// jobs.json: [{ "id": "...", "model": "owner/name", "input": {...}, "out": "path.jpg" }]
// Any input value of the form { "$file": "local/path" } is uploaded first and
// replaced with its served HTTPS URL.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error('REPLICATE_API_TOKEN is not set');
  process.exit(2);
}

const API = 'https://api.replicate.com/v1';
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

const uploadCache = new Map();

async function uploadFile(path) {
  const abs = resolve(path);
  if (uploadCache.has(abs)) return uploadCache.get(abs);

  const bytes = await readFile(abs);
  const form = new FormData();
  form.append('content', new Blob([bytes]), basename(abs));

  const res = await fetch(`${API}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  if (!res.ok) throw new Error(`upload failed ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const url = json.urls.get;
  uploadCache.set(abs, url);
  console.error(`  uploaded ${basename(abs)}`);
  return url;
}

async function resolveInput(value) {
  if (Array.isArray(value)) return Promise.all(value.map(resolveInput));
  if (value && typeof value === 'object') {
    if (typeof value.$file === 'string') return uploadFile(value.$file);
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await resolveInput(v);
    return out;
  }
  return value;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runJob(job, index) {
  const input = await resolveInput(job.input);

  // Official models are addressed by owner/name via the model-scoped endpoint;
  // community models carry an explicit :version and go to /v1/predictions.
  const [ref, version] = job.model.split(':');
  const endpoint = version ? `${API}/predictions` : `${API}/models/${ref}/predictions`;
  const body = version ? { version, input } : { input };

  // Creation is burst-rate-limited, so stagger the fan-out and back off on 429.
  await sleep(index * 1500);

  let create;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    create = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    if (create.status !== 429) break;
    const retryAfter = Number(create.headers.get('retry-after')) || 10;
    console.error(`[${job.id}] throttled, retrying in ${retryAfter}s`);
    await sleep((retryAfter + 1) * 1000);
  }
  if (!create.ok) throw new Error(`[${job.id}] create failed ${create.status}: ${await create.text()}`);

  let pred = await create.json();
  console.error(`[${job.id}] ${pred.id} started (${job.model})`);

  const deadline = Date.now() + 20 * 60 * 1000;
  while (['starting', 'processing'].includes(pred.status)) {
    if (Date.now() > deadline) throw new Error(`[${job.id}] timed out`);
    await sleep(3000);
    const poll = await fetch(`${API}/predictions/${pred.id}`, { headers });
    if (!poll.ok) continue;
    pred = await poll.json();
  }

  if (pred.status !== 'succeeded') {
    throw new Error(`[${job.id}] ${pred.status}: ${pred.error ?? 'unknown error'}`);
  }

  const urls = (Array.isArray(pred.output) ? pred.output : [pred.output]).filter(
    (u) => typeof u === 'string',
  );
  if (urls.length === 0) throw new Error(`[${job.id}] no file output`);

  await mkdir(dirname(resolve(job.out)), { recursive: true });
  const written = [];
  for (const [i, url] of urls.entries()) {
    const target =
      urls.length === 1 ? job.out : job.out.replace(/(\.[^.]+)$/, `-${String(i + 1).padStart(2, '0')}$1`);
    const bin = await fetch(url);
    await writeFile(resolve(target), Buffer.from(await bin.arrayBuffer()));
    written.push(target);
  }
  console.error(`[${job.id}] -> ${written.join(', ')}`);

  return {
    id: job.id,
    model: job.model,
    predictionId: pred.id,
    versionId: pred.version ?? null,
    status: pred.status,
    createdAt: pred.created_at,
    completedAt: pred.completed_at,
    predictTime: pred.metrics?.predict_time ?? null,
    input,
    outputs: written,
  };
}

const specPath = process.argv[2];
if (!specPath) {
  console.error('usage: replicate-run.mjs <jobs.json>');
  process.exit(2);
}

const jobs = JSON.parse(await readFile(specPath, 'utf8'));
const settled = await Promise.allSettled(jobs.map((job, i) => runJob(job, i)));

const provenance = [];
let failures = 0;
for (const [i, r] of settled.entries()) {
  if (r.status === 'fulfilled') provenance.push(r.value);
  else {
    failures += 1;
    console.error(`FAILED ${jobs[i].id}: ${r.reason.message}`);
    provenance.push({ id: jobs[i].id, model: jobs[i].model, status: 'failed', error: r.reason.message });
  }
}

const provPath = specPath.replace(/\.json$/, '.provenance.json');
await writeFile(provPath, JSON.stringify(provenance, null, 2));
console.error(`provenance -> ${provPath}`);
process.exit(failures > 0 ? 1 : 0);
