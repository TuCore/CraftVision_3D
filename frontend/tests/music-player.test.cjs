const { test } = require('node:test');
const assert = require('node:assert/strict');
const { BackgroundMusicEngine } = require('../node_modules/.music-tests/player.js');

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
}
class FakeAudio extends EventTarget {
  src = ''; currentTime = 0; duration = 120; volume = 1; loads = 0; calls = 0; error = null; reject = null;
  play() {
    this.calls++;
    if (this.reject) return Promise.reject({ name: this.reject });
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }
  pause() { this.dispatchEvent(new Event('pause')); }
  load() { this.loads++; this.currentTime = 0; }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
}
const track = (id, extra = {}) => ({ id, title: id, audioUrl: `https://cdn.example.com/${id}.mp3`, sourceUrl: null, isEnabled: true, sortOrder: 0, revision: 1, ...extra });
function setup(preferences = new MemoryStorage(), session = new MemoryStorage()) {
  const audio = new FakeAudio(); let state;
  const engine = new BackgroundMusicEngine(audio, value => { state = value; }, preferences, session);
  return { audio, engine, preferences, session, state: () => state };
}

test('playlist refresh and renaming preserve the same source, time and playback', () => {
  const p = setup(); p.engine.setPlaylist([track('one')]);
  p.audio.currentTime = 37;
  const loads = p.audio.loads; const plays = p.audio.calls;
  p.engine.setPlaylist([track('one', { title: 'New title', revision: 2 }), track('two')]);
  assert.equal(p.audio.currentTime, 37); assert.equal(p.audio.loads, loads); assert.equal(p.audio.calls, plays);
  assert.equal(p.state().current.title, 'New title'); assert.equal(p.state().playing, true);
});
test('pause is respected across playlist refreshes and next track', () => {
  const p = setup(); p.engine.setPlaylist([track('one'), track('two')]); p.engine.toggle();
  p.engine.setPlaylist([track('one'), track('two')]); p.engine.next();
  assert.equal(p.state().playing, false); assert.equal(p.audio.calls, 1);
  p.engine.toggle(); assert.equal(p.state().playing, true);
});
test('autoplay rejection offers an explicit retry and does not skip tracks', async () => {
  const p = setup(); p.audio.reject = 'NotAllowedError'; p.engine.setPlaylist([track('one'), track('two')]);
  await Promise.resolve(); assert.equal(p.state().blocked, true); assert.equal(p.state().current.id, 'one');
  p.audio.reject = null; p.engine.retryAutoplay(); assert.equal(p.state().playing, true);
});
test('the last track loops to the first, including a single-track playlist', () => {
  const p = setup(); p.engine.setPlaylist([track('one'), track('two')]);
  p.audio.dispatchEvent(new Event('ended')); assert.equal(p.state().current.id, 'two');
  p.audio.dispatchEvent(new Event('ended')); assert.equal(p.state().current.id, 'one');
  p.engine.setPlaylist([track('one')]); p.audio.currentTime = 120;
  p.audio.dispatchEvent(new Event('ended')); assert.equal(p.audio.currentTime, 0); assert.equal(p.state().playing, true);
});
test('deleting/disabling active tracks advances and an empty playlist stops', () => {
  const p = setup(); p.engine.setPlaylist([track('one'), track('two')]);
  p.engine.setPlaylist([track('one', { isEnabled: false }), track('two')]);
  assert.equal(p.state().current.id, 'two');
  p.engine.setPlaylist([]); assert.equal(p.state().current, null); assert.equal(p.audio.src, ''); assert.equal(p.state().playing, false);
});
test('replacing the current audio restarts only the replaced source', () => {
  const p = setup(); p.engine.setPlaylist([track('one')]); p.audio.currentTime = 37;
  p.engine.setPlaylist([track('one', { audioUrl: 'https://cdn.example.com/new.mp3' })]);
  assert.equal(p.audio.currentTime, 0); assert.equal(p.audio.src, 'https://cdn.example.com/new.mp3');
});
test('broken audio is skipped once per track and does not spin forever', async () => {
  const p = setup(); p.audio.reject = 'NotSupportedError'; p.engine.setPlaylist([track('one'), track('two')]);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(p.audio.calls, 2); assert.equal(p.state().playing, false); assert.match(p.state().error, /Không tải/);
  p.audio.reject = null; p.engine.toggle(); assert.equal(p.state().playing, true);
});
test('reload resumes position and volume; denied storage never breaks playback', () => {
  const p = setup(); p.engine.setPlaylist([track('one')]); p.audio.currentTime = 43; p.engine.setVolume(0.4); p.engine.dispose();
  const restored = setup(p.preferences, p.session); restored.engine.setPlaylist([track('one')]);
  restored.audio.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(restored.audio.currentTime, 43); assert.equal(restored.audio.volume, 0.4);
  const denied = { getItem() { throw Error('Denied'); }, setItem() { throw Error('Denied'); } };
  const safe = setup(denied, denied); safe.engine.setPlaylist([track('one')]); safe.engine.persist();
  assert.equal(safe.state().playing, true);
});
test('stale play rejection cannot stop a newly selected track', async () => {
  const p = setup(); let reject;
  p.audio.play = () => new Promise((_, fail) => { reject = fail; });
  p.engine.setPlaylist([track('one'), track('two')]); const staleReject = reject;
  p.engine.next(); staleReject({ name: 'NotSupportedError' }); await Promise.resolve();
  assert.equal(p.state().current.id, 'two'); assert.equal(p.state().error, '');
});
