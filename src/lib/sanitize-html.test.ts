import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml", () => {
  it("returns empty string for empty / null-ish input", () => {
    expect(sanitizeHtml("")).toBe("");
    // @ts-expect-error — runtime tolerates undefined
    expect(sanitizeHtml(undefined)).toBe("");
  });

  it("strips <script> tags entirely", () => {
    const out = sanitizeHtml('<p>hi</p><script>alert("xss")</script>');
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/alert/);
    expect(out).toContain("<p>hi</p>");
  });

  it("strips <iframe>, <object>, <embed>, <style>", () => {
    const out = sanitizeHtml(
      '<iframe src="x"></iframe><object></object><embed><style>body{display:none}</style><p>ok</p>',
    );
    expect(out).not.toMatch(/<iframe|<object|<embed|<style/i);
    expect(out).toContain("<p>ok</p>");
  });

  it("removes inline event handlers", () => {
    const out = sanitizeHtml('<p onclick="steal()" onmouseover="x()">hi</p>');
    expect(out).not.toMatch(/onclick|onmouseover/i);
    expect(out).toContain("hi");
  });

  it("removes javascript: URLs on anchors", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">bad</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it("keeps safe formatting tags", () => {
    const html =
      "<h2>Title</h2><p><strong>bold</strong> <em>em</em> <u>u</u></p>" +
      "<ul><li>one</li></ul><ol><li>two</li></ol><blockquote>q</blockquote>";
    const out = sanitizeHtml(html);
    for (const tag of ["h2", "p", "strong", "em", "u", "ul", "li", "ol", "blockquote"]) {
      expect(out).toMatch(new RegExp(`<${tag}[ >]`, "i"));
    }
  });

  it("keeps allowed http(s), mailto and tel links", () => {
    const out = sanitizeHtml(
      '<a href="https://example.com">x</a>' +
        '<a href="mailto:a@b.co">m</a>' +
        '<a href="tel:+441234">t</a>' +
        '<a href="/local">l</a>',
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('href="mailto:a@b.co"');
    expect(out).toContain('href="tel:+441234"');
    expect(out).toContain('href="/local"');
  });

  it("forces rel=noopener noreferrer on target=_blank anchors", () => {
    const out = sanitizeHtml('<a href="https://x.co" target="_blank">x</a>');
    expect(out).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(out).toMatch(/rel="[^"]*noreferrer[^"]*"/);
  });

  it("keeps <img> with src/alt/loading but strips onerror", () => {
    const out = sanitizeHtml(
      '<img src="https://x.co/a.jpg" alt="a" loading="lazy" onerror="pwn()"/>',
    );
    expect(out).toMatch(/<img[^>]+src="https:\/\/x\.co\/a\.jpg"/);
    expect(out).toMatch(/alt="a"/);
    expect(out).not.toMatch(/onerror/i);
  });

  it("drops disallowed tags but keeps their text content", () => {
    const out = sanitizeHtml("<marquee>hello</marquee><custom-el>world</custom-el>");
    expect(out).not.toMatch(/<marquee|<custom-el/i);
    expect(out).toContain("hello");
    expect(out).toContain("world");
  });
});
