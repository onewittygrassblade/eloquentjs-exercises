/* eslint-disable no-console */

const box = {
  locked: true,
  unlock() { this.locked = false; },
  lock() { this.locked = true; },
  _content: [],
  get content() {
    if (this.locked) throw new Error('Locked!');
    return this._content;
  },
};

function withBoxUnlocked(body) {
  // If the box was already unlocked, we just execute the callback.
  if (!box.locked) {
    return body();
  }

  // If the box was locked, we unlock it, execute the callback and
  // ensure that we lock the box again.
  box.unlock();
  try {
    return body();
  } finally {
    box.lock();
  }
}

withBoxUnlocked(() => {
  console.log('box initial content:', box.content);
  console.log('putting a gold piece into the box');
  box.content.push('gold piece');
  console.log('box content:', box.content);
});

try {
  withBoxUnlocked(() => {
    throw new Error('Pirates on the horizon! Abort!');
  });
} catch (e) {
  console.log(`Error raised: ${e}`);
}
