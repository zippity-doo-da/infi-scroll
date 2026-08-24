#!/usr/bin/env python3
"""Convert near-neutral light generation backdrops into transparent alpha."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--solid", type=int, default=238)
    parser.add_argument("--clear", type=int, default=250)
    parser.add_argument("--chroma", type=int, default=12)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    pixels = []
    for red, green, blue, alpha in image.getdata():
        minimum = min(red, green, blue)
        maximum = max(red, green, blue)
        if minimum >= args.solid and maximum - minimum <= args.chroma:
            if minimum >= args.clear:
                alpha = 0
            else:
                alpha = round(alpha * (args.clear - minimum) / (args.clear - args.solid))
        pixels.append((red, green, blue, alpha))

    image.putdata(pixels)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output)


if __name__ == "__main__":
    main()
