#!/usr/bin/env python3
"""Crop a PNG to meaningful alpha pixels for reliable sprite anchoring."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--alpha-threshold", type=int, default=32)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= args.alpha_threshold else 0)
    bounds = mask.getbbox()
    if bounds is None:
        raise SystemExit("No visible pixels found")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.crop(bounds).save(args.output)
    print(f"{image.size} -> {bounds[2] - bounds[0], bounds[3] - bounds[1]} using bounds {bounds}")


if __name__ == "__main__":
    main()
