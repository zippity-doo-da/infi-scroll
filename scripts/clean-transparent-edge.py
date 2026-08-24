#!/usr/bin/env python3
"""Remove generated light fringes by contracting and softly antialiasing alpha."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageFilter


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--pixels", type=int, default=2)
    parser.add_argument("--hard", action="store_true", help="Do not soften the contracted edge")
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    size = args.pixels * 2 + 1
    alpha = image.getchannel("A").filter(ImageFilter.MinFilter(size))
    if args.pixels > 0 and not args.hard:
        alpha = alpha.filter(ImageFilter.GaussianBlur(0.45))
    image.putalpha(alpha)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output)


if __name__ == "__main__":
    main()
