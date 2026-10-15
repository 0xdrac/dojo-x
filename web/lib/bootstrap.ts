/* eslint-disable */
// @ts-nocheck
// Exposes the prototype's globals (DOJO, DXP, DXA, DojoMotion, ...) to the ported screens. Import for side effects.
import DOJO from "./dojo";
import DXP from "./portal";
import DXA from "./admin";
import POSTS from "./posts";
import { DojoMotion } from "./motion";
import { DojoAPI } from "./api";
import { normalizeClasses } from "./classes";

normalizeClasses(DOJO.classes, DOJO);

if (typeof window !== "undefined") {
  const w = window as any;
  w.DOJO = DOJO; w.DXP = DXP; w.DXA = DXA; w.DOJO_POSTS = POSTS; w.DojoMotion = DojoMotion; w.DojoAPI = DojoAPI;
  w.DojoReady = (cb: () => void) => cb();
}
export {};
