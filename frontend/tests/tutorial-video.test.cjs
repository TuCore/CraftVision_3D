const { test } = require("node:test");
const assert = require("node:assert/strict");
const { youtubeEmbedUrl, safeTutorialUrl, tutorialFormError } = require("../node_modules/.tutorial-tests/types.js");

test("YouTube playback supports watch, shared, embed and shorts links", () => {
  for (const url of ["https://youtube.com/watch?v=abcdefghijk&t=12", "https://youtu.be/abcdefghijk?si=shared", "https://www.youtube.com/embed/abcdefghijk", "https://youtube.com/shorts/abcdefghijk"]) {
    assert.equal(youtubeEmbedUrl(url), "https://www.youtube.com/embed/abcdefghijk");
  }
  assert.equal(youtubeEmbedUrl("https://example.com/watch?v=abcdefghijk"), null);
  assert.equal(youtubeEmbedUrl("https://youtube.com/watch?v=invalid"), null);
});

test("unsafe and malformed sources cannot be saved or previewed", () => {
  for (const url of ["javascript:alert(1)", "//example.com/v.mp4", "/\\example.com/v.mp4", "http://example.com/v.mp4", "https://user:pass@example.com/v.mp4"]) {
    assert.equal(safeTutorialUrl(url), false);
    assert.ok(tutorialFormError({ headerTitle: "Guide", videoUrl: url }));
  }
  assert.ok(tutorialFormError({ headerTitle: "Guide", videoUrl: "https://youtube.com/results?search_query=guide" }));
  assert.ok(tutorialFormError({ headerTitle: "Guide", videoUrl: "/videos/guide.mp4", detailUrl: "javascript:alert(1)" }));
  assert.equal(tutorialFormError({ headerTitle: "Guide", videoUrl: "/videos/guide.mp4", detailUrl: "/shop" }), null);
  assert.equal(tutorialFormError({ headerTitle: "Guide", videoUrl: "https://example.com/guide.webm" }), null);
});
