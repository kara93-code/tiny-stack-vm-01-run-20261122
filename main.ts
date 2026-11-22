// Tiny Stack VM: a faithful interpreter of make.fun's tiny stack ISA (ISA.md; vm.mjs is the rule).
// Per step, in order: step limit, pc, unknown opcode, truncated immediate, stack
// checks, then the instruction's own trap, then its effect. Traps keep prior output.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const SMAX = 256, CMAX = 64, MWORDS = 256, STEPS = 1000000, OMAX = 65536;
// [immediate bytes, pops, pushes] per opcode; null when unknown. Opcodes are decimal
// here: 0 HALT, 1 PUSH8, 2 PUSH32, 3 POP, 4 DUP, 5 SWAP, 6 OVER, 7 ROT, 16-22 arith,
// 23 NEG, 24-26 AND/OR/XOR, 27 NOT, 28-30 shifts, 32-34 EQ/LT/LTU, 48-50 jumps,
// 51 CALL, 52 RET, 64 LOAD, 65 STORE, 80 PRINT, 81 PUTC, 82 IN, 83 EXIT.
function spec(o: number): [number, number, number] | null {
  if (o === 0) return [0, 0, 0];
  if (o === 1) return [1, 0, 1];
  if (o === 2) return [4, 0, 1];
  if (o === 3) return [0, 1, 0];
  if (o === 4) return [0, 1, 2];
  if (o === 5) return [0, 2, 2];
  if (o === 6) return [0, 2, 3];
  if (o === 7) return [0, 3, 3];
  if (o >= 16 && o <= 22) return [0, 2, 1];
  if (o === 23 || o === 27) return [0, 1, 1];
  if (o >= 24 && o <= 34) return [0, 2, 1];
  if (o === 48) return [2, 0, 0];
  if (o === 49 || o === 50) return [2, 1, 0];
  if (o === 51) return [2, 0, 0];
  if (o === 52) return [0, 0, 0];
  if (o === 64) return [0, 1, 1];
  if (o === 65) return [0, 2, 0];
  if (o === 80 || o === 81) return [0, 1, 0];
  if (o === 82) return [0, 0, 1];
  if (o === 83) return [0, 1, 0];
  return null;
}
function run(prog: Uint8Array, input: Uint8Array): { out: Uint8Array; code: number } {
  const st = new Int32Array(SMAX), calls = new Int32Array(CMAX), mem = new Int32Array(MWORDS);
  const out = new Uint8Array(OMAX);
  let sp = 0, csp = 0, pc = 0, steps = 0, olen = 0, ipos = 0;
  const end = (code: number) => ({ out: out.slice(0, olen), code });
  for (;;) {
    if (steps === STEPS) return end(10);
    if (pc < 0 || pc >= prog.length) return end(9);
    const o = prog[pc], s = spec(o);
    if (s === null) return end(5);
    const imm = s[0], pops = s[1], pushes = s[2];
    if (pc + imm >= prog.length) return end(9);
    steps++;
    const next = pc + 1 + imm;
    if (sp < pops) return end(2);
    if (sp - pops + pushes > SMAX) return end(3);
    pc = next;
    if (o === 0) return end(0);
    if (o === 1) { st[sp++] = (prog[next - 1] << 24) >> 24; continue; }
    if (o === 2) { st[sp++] = prog[next - 4] | (prog[next - 3] << 8) | (prog[next - 2] << 16) | (prog[next - 1] << 24); continue; }
    if (o === 3) { sp--; continue; }
    if (o === 4) { st[sp] = st[sp - 1]; sp++; continue; }
    if (o === 5) { const t = st[sp - 1]; st[sp - 1] = st[sp - 2]; st[sp - 2] = t; continue; }
    if (o === 6) { st[sp] = st[sp - 2]; sp++; continue; }
    if (o === 7) { const a = st[sp - 3]; st[sp - 3] = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = a; continue; }
    if (o === 23) { st[sp - 1] = (-st[sp - 1]) | 0; continue; }
    if (o === 27) { st[sp - 1] = ~st[sp - 1]; continue; }
    if (o >= 16 && o <= 34) {
      const b = st[sp - 1], a = st[sp - 2];
      let r: number;
      if (o === 16) r = (a + b) | 0;
      else if (o === 17) r = (a - b) | 0;
      else if (o === 18) r = Math.imul(a, b);
      else if (o === 19) {
        if (b === 0) return end(4);
        r = a === -2147483648 && b === -1 ? a : (a / b) | 0;
      } else if (o === 20) {
        if (b === 0) return end(4);
        r = b === -1 ? 0 : (a % b) | 0;
      } else if (o === 21) {
        if (b === 0) return end(4);
        r = Math.floor((a >>> 0) / (b >>> 0)) | 0;
      } else if (o === 22) {
        if (b === 0) return end(4);
        r = ((a >>> 0) % (b >>> 0)) | 0;
      } else if (o === 24) r = a & b;
      else if (o === 25) r = a | b;
      else if (o === 26) r = a ^ b;
      else if (o === 28) r = a << (b & 31);
      else if (o === 29) r = a >> (b & 31);
      else if (o === 30) r = (a >>> (b & 31)) | 0;
      else if (o === 32) r = a === b ? 1 : 0;
      else if (o === 33) r = a < b ? 1 : 0;
      else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
      sp -= 2; st[sp++] = r; continue;
    }
    if (o >= 48 && o <= 50) {
      const rel = ((prog[next - 2] | (prog[next - 1] << 8)) << 16) >> 16;
      let take = true;
      if (o !== 48) { const v = st[--sp]; take = o === 49 ? v === 0 : v !== 0; }
      if (take) pc = next + rel;
      continue;
    }
    if (o === 51) {
      if (csp === CMAX) return end(7);
      calls[csp++] = next; pc = prog[next - 2] | (prog[next - 1] << 8); continue;
    }
    if (o === 52) {
      if (csp === 0) return end(8);
      pc = calls[--csp]; continue;
    }
    if (o === 64) {
      const addr = st[sp - 1];
      if (addr < 0 || addr >= MWORDS) return end(6);
      st[sp - 1] = mem[addr]; continue;
    }
    if (o === 65) {
      const addr = st[sp - 1], v = st[sp - 2];
      if (addr < 0 || addr >= MWORDS) return end(6);
      sp -= 2; mem[addr] = v; continue;
    }
    if (o === 80) {
      const text = String(st[sp - 1]);
      if (olen + text.length > OMAX) return end(11);
      sp--;
      for (let i = 0; i < text.length; i++) out[olen++] = text.charCodeAt(i);
      continue;
    }
    if (o === 81) {
      if (olen + 1 > OMAX) return end(11);
      out[olen++] = st[--sp] & 255; continue;
    }
    if (o === 82) { st[sp++] = ipos < input.length ? input[ipos++] : -1; continue; }
    return end(st[--sp] & 255);
  }
}
const IN_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(IN_DIR).sort()) {
  const r = run(readFileSync(join(IN_DIR, id, 'program.bin')), readFileSync(join(IN_DIR, id, 'input.bin')));
  mkdirSync(join(OUT_DIR, id), { recursive: true });
  writeFileSync(join(OUT_DIR, id, 'stdout.bin'), r.out);
  writeFileSync(join(OUT_DIR, id, 'exit.txt'), `${r.code}\n`);
}
