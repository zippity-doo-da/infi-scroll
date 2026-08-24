#!/usr/bin/env python3
"""Normalize a raster asset to an exact runtime size."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("width", type=int)
    parser.add_argument("height", type=int)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    resized = image.resize((args.width, args.height), Image.Resampling.LANCZOS)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    resized.save(args.output)
    print(f"{image.size} -> {resized.size}")


if __name__ == "__main__":
    main()
