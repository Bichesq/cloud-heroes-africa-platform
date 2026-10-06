"""Decode a Figma .fig file into a JSON node tree, and/or extract its embedded
media assets, without needing Figma API access.

A .fig file is a zip containing:
  - canvas.fig   : the design graph, in Figma's binary "Kiwi" format
                   (magic "fig-kiwi", then a schema message and a data
                   message, each length-prefixed and raw-deflate or
                   zstd compressed)
  - images/<hash>: the exact media assets used in the design (photos, icons,
                   illustrations), stored under their content hash, in
                   whatever format Figma has them in (usually PNG/JPEG) -
                   these are already the final files, no decoding needed
  - thumbnail.png : a single small overview render (not per-frame)
  - meta.json     : basic file metadata

This script implements a plain-Python Kiwi reader (ported from the
open-source fig2sketch project's decoder) so canvas.fig can be walked without
any Figma API token. It has no required third-party dependencies; if a
segment happens to be zstd-compressed (rare - most .fig files use raw
deflate) and the optional `zstandard` package isn't installed, that segment
will fail to decode and the script will say so rather than silently
producing partial/wrong output.

Usage:
    python decode_fig.py <path-to-file.fig> --out tree.json
    python decode_fig.py <path-to-file.fig> --extract-images assets/
    python decode_fig.py <path-to-file.fig> --out tree.json --extract-images assets/

After decoding, `tree.json` has one top-level key, "nodeChanges": a flat list
of every node in the file. Each node has a "guid" and a "parentIndex.guid" -
walk those to reconstruct the tree. Look for:
  - type "CANVAS"                 -> a page
  - type "FRAME"                  -> a top-level frame/artboard (a screen)
  - type "TEXT"                   -> has "textData.characters" (the on-canvas copy)
  - type "INSTANCE"                -> a component instance; "name" is the component name
  - a "fillPaints" entry with an image-typed paint -> carries the hash that
    names the matching file under images/ once extracted; the exact field
    layout can vary by node kind, so grep the decoded JSON near the frame/
    node you're building rather than assuming one fixed path.
"""

import codecs
import ctypes
import io
import json
import struct
import sys
import zipfile
import zlib
from collections import OrderedDict

try:
    import zstandard

    def _zstd_decompress(data: bytes) -> bytes:
        return zstandard.ZstdDecompressor().decompress(data, max_output_size=200 * 1024 * 1024)
except ImportError:
    zstandard = None

    def _zstd_decompress(data: bytes) -> bytes:
        raise RuntimeError(
            "This .fig file has a zstd-compressed segment, which needs the "
            "'zstandard' package (pip install zstandard) - it isn't installed."
        )


class KiwiReader:
    def __init__(self, reader):
        self._reader = reader

    def byte(self):
        return self._reader.read(1)[0]

    def bool(self):
        return self.byte() > 0

    def uint(self):
        value = 0
        for shift in range(0, 36, 7):
            b = self.byte()
            value |= (b & 127) << shift
            if b < 128:
                break
        return value

    def uint64(self):
        value = 0
        for shift in range(0, 64, 7):
            b = self.byte()
            value |= (b & 127) << shift
            if b < 128:
                break
        return value

    def int64(self):
        v = self.uint64()
        return ~(v >> 1) if v & 1 else v >> 1

    def float(self):
        b = self.byte()
        if b == 0:
            return 0.0
        bits = b | self.byte() << 8 | self.byte() << 16 | self.byte() << 24
        bits = (bits << 23) | (bits >> 9)
        return ctypes.c_float.from_buffer(ctypes.c_uint32(bits & 0xFFFFFFFF)).value

    def int(self):
        v = self.uint()
        return ~(v >> 1) if v & 1 else v >> 1

    def string(self):
        out = ""
        decoder = codecs.lookup("utf8").incrementaldecoder()
        while not (out and out[-1] == "\x00"):
            ch = ""
            while not ch:
                ch = decoder.decode(self._reader.read(1))
            out += ch
        return out[:-1]


class KiwiSchema:
    def __init__(self, reader):
        kw = KiwiReader(reader)
        self.types = []
        for _ in range(kw.uint()):
            name = kw.string()
            kind = kw.byte()
            fields = OrderedDict()
            for _ in range(kw.uint()):
                field = KiwiSchema._decode_field(kw)
                fields[field["value"]] = field
            self.types.append({"name": name, "kind": kind, "fields": fields})

    @staticmethod
    def _decode_field(kw):
        return {"name": kw.string(), "type": kw.int(), "array": kw.bool(), "value": kw.uint()}


class KiwiDecoder:
    TYPES = ["bool", "byte", "int", "uint", "float", "string", "int64", "uint64"]

    def __init__(self, schema, type_converters):
        self.schema = schema
        self.type_converters = type_converters

    def decode(self, reader, root_name):
        kw = KiwiReader(reader)
        root_type = next(t for t in self.schema.types if t["name"] == root_name)
        return self._decode_message(kw, root_type)

    def _decode_message(self, kw, type_):
        obj = {}
        while (fid := kw.uint()) != 0:
            field = type_["fields"][fid]
            obj[field["name"]] = self._decode_type(kw, field["type"], field["array"])
        return obj

    def _decode_struct(self, kw, type_):
        return {f["name"]: self._decode_type(kw, f["type"], f["array"]) for f in type_["fields"].values()}

    def _decode_enum(self, kw, type_):
        return type_["fields"][kw.uint()]["name"]

    def _decode_type(self, kw, type_id, array):
        obj = self._decode_type_inner(kw, type_id, array)
        converter = self.type_converters.get(self.schema.types[type_id]["name"]) if type_id >= 0 else None
        if not array and converter:
            obj = converter(obj)
        return obj

    def _decode_type_inner(self, kw, type_id, array):
        if array:
            return [self._decode_type(kw, type_id, False) for _ in range(kw.uint())]
        if type_id < 0:
            return kw.__getattribute__(self.TYPES[~type_id])()
        type_ = self.schema.types[type_id]
        if type_["kind"] == 0:
            return self._decode_enum(kw, type_)
        if type_["kind"] == 1:
            return self._decode_struct(kw, type_)
        if type_["kind"] == 2:
            return self._decode_message(kw, type_)
        raise ValueError(f"Unknown Kiwi type kind: {type_['kind']}")


ZSTD_MAGIC = b"\x28\xb5\x2f\xfd"


def _decompress_segment(data: bytes) -> bytes:
    if data.startswith(ZSTD_MAGIC):
        return _zstd_decompress(data)
    return zlib.decompress(data, wbits=-15)


def decode_canvas_fig(raw: bytes) -> dict:
    reader = io.BytesIO(raw)
    header = reader.read(12)
    if header[:8] != b"fig-kiwi":
        raise ValueError(f"Not a fig-kiwi stream (got magic {header[:8]!r})")
    fig_version = struct.unpack("<I", header[8:12])[0]
    print(f"canvas.fig format version: {fig_version}", file=sys.stderr)

    schema_size = struct.unpack("<I", reader.read(4))[0]
    schema = KiwiSchema(io.BytesIO(_decompress_segment(reader.read(schema_size))))

    data_size = struct.unpack("<I", reader.read(4))[0]
    data = io.BytesIO(_decompress_segment(reader.read(data_size)))

    type_converters = {"GUID": lambda g: f"{g['sessionID']}:{g['localID']}"}
    return KiwiDecoder(schema, type_converters).decode(data, "Message")


def extract_images(fig_path: str, out_dir: str) -> list:
    import os

    os.makedirs(out_dir, exist_ok=True)
    extracted = []
    with zipfile.ZipFile(fig_path) as zf:
        for name in zf.namelist():
            if name.startswith("images/") and not name.endswith("/"):
                dest = os.path.join(out_dir, os.path.basename(name))
                with zf.open(name) as src, open(dest, "wb") as dst:
                    dst.write(src.read())
                extracted.append(dest)
    return extracted


def main():
    import argparse

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("fig_path", help="Path to the .fig file")
    parser.add_argument("--out", help="Write the decoded node tree as JSON to this path")
    parser.add_argument("--extract-images", metavar="DIR", help="Extract every embedded media asset (exact files, no re-encoding) into this directory")
    args = parser.parse_args()

    with zipfile.ZipFile(args.fig_path) as zf:
        raw = zf.read("canvas.fig")

    if args.out:
        tree = decode_canvas_fig(raw)
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(tree, f, ensure_ascii=False)
        node_count = len(tree.get("nodeChanges", []))
        print(f"Wrote {node_count} nodes to {args.out}", file=sys.stderr)

    if args.extract_images:
        files = extract_images(args.fig_path, args.extract_images)
        print(f"Extracted {len(files)} media files to {args.extract_images}", file=sys.stderr)

    if not args.out and not args.extract_images:
        parser.error("pass --out, --extract-images, or both")


if __name__ == "__main__":
    main()
