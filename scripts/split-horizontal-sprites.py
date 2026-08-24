#!/usr/bin/env python3
"""Split an evenly spaced horizontal sprite group into trimmed PNG assets."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output_stem", type=Path)
    parser.add_argument("count", type=int)
    parser.add_argument("--alpha-threshold", type=int, default=24)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    width, height = image.size
    for index in range(args.count):
        left = round(index * width / args.count)
        right = round((index + 1) * width / args.count)
        sprite = image.crop((left, 0, right, height))
        alpha = sprite.getchannel("A")
        bounds = alpha.point(lambda value: 255 if value >= args.alpha_threshold else 0).getbbox()
        if bounds is None:
            raise SystemExit(f"No visible pixels found in segment {index + 1}")
        output = args.output_stem.with_name(f"{args.output_stem.name}-{index + 1}.png")
        output.parent.mkdir(parents=True, exist_ok=True)
        sprite.crop(bounds).save(output)
        print(f"{output}: {sprite.size} -> {bounds[2] - bounds[0], bounds[3] - bounds[1]}")


if __name__ == "__main__":
    main()
