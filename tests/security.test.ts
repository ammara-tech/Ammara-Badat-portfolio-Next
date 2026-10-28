import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { securityHeaders } from "@/lib/security-headers";

/*
  Security headers (lib/security-headers.ts, added in next.config.ts).
  The live site is checked too, in the browser tests.
*/

const header = (key: string) => securityHeaders.find((h) => h.key === key)?.value ?? "";

describe("security headers", () => {
  it("are sent with every page and file", async () => {
    const rules = await nextConfig.headers!();
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe("/(.*)");
    expect(rules[0].headers).toEqual(securityHeaders);
  });

  it("stop other sites from showing my pages in a frame, in old and new browsers", () => {
    expect(header("X-Frame-Options")).toBe("DENY");
    expect(header("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("don't limit scripts, so Next.js, the theme script and analytics keep working", () => {
    const csp = header("Content-Security-Policy");
    expect(csp).not.toMatch(/script-src|default-src/);
  });

  it("switch off the camera, microphone and location, and force https", () => {
    expect(header("Permissions-Policy")).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
    expect(header("Strict-Transport-Security")).toMatch(/^max-age=\d{8}/);
    expect(header("X-Content-Type-Options")).toBe("nosniff");
  });
});
