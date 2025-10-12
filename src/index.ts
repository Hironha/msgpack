import { Encoder } from "./encoder";
import { Decoder } from "./decoder";
import { Ok } from "./result";

function main() {
  let raw = true;
  let encoded = new Encoder().encode(raw);
  let decoded = new Decoder(Ok.unwrap(encoded)).decode();
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  raw = false;
  encoded = new Encoder().encode(raw);
  decoded = new Decoder(Ok.unwrap(encoded)).decode();
  if (raw != decoded) {
    throw new Error("expected raw to equal decoded");
  }

  encoded = new Encoder().encode(null);
  if (new Decoder(Ok.unwrap(encoded)).decode() !== null) {
    throw new Error("expected null to equal decoded");
  }

  let str = "test";
  const encstr = new Encoder().encode(str);
  let outstr = new Decoder(Ok.unwrap(encstr)).decode();
  if (outstr !== str || typeof outstr !== "string") {
    const enc = new TextEncoder();
    console.error(enc.encode(outstr as string), enc.encode(str));
    throw new Error("expected decoded str to equal raw str");
  }

  let bin = new TextEncoder().encode("test");
  const encbin = new Encoder().encode(bin);
  let outbin = new Decoder(Ok.unwrap(encbin)).decode();
  if (!(outbin instanceof Uint8Array) || outbin.toString() !== bin.toString()) {
    console.error(outbin, bin);
    throw new Error("expected decode bin to equal raw bin");
  }

  let int: number | bigint = 2;
  let encint = new Encoder().encode(int);
  let outint = new Decoder(Ok.unwrap(encint)).decode();
  if (outint !== int) {
    throw new Error("expected decoded int to equal raw int");
  }

  int = -2;
  encint = new Encoder().encode(int);
  outint = new Decoder(Ok.unwrap(encint)).decode();
  if (outint !== int) {
    console.error(encint, outint);
    throw new Error("expected decoded int to equal raw int");
  }

  int = -46700;
  encint = new Encoder().encode(int);
  outint = new Decoder(Ok.unwrap(encint)).decode();
  if (outint !== int) {
    console.error(encint, outint);
    throw new Error("expected decoded int to equal raw int");
  }

  // TODO: i think the decodeInt is still broken due to how i deal with
  // negative fixint

  console.info("Everything ok");
}

main();
