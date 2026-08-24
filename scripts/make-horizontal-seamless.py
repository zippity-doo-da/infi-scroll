#!/usr/bin/env python3
"""Feather matching left/right PNG edges for exact horizontal tiling."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


def mix(a: int, b: int, amount: float) -> int:
    return round(a * (1 - amount) + b * amount)


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--blend-width", type=int, default=96)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    width, height = image.size
    blend_width = min(args.blend_width, width // 4)
    source = image.copy()
    source_pixels = source.load()
    output_pixels = image.load()

    for offset in range(blend_width):
        left_x = offset
        right_x = width - 1 - offset
        preserve = offset / max(1, blend_width - 1)
        for y in range(height):
            left = source_pixels[left_x, y]
            right = source_pixels[right_x, y]
            midpoint = tuple(mix(left[channel], right[channel], 0.5) for channel in range(4))
            output_pixels[left_x, y] = tuple(mix(midpoint[channel], left[channel], preserve) for channel in range(4))
            output_pixels[right_x, y] = tuple(mix(midpoint[channel], right[channel], preserve) for channel in range(4))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output)
    print(f"{args.input} -> {args.output} ({width}x{height}, blend {blend_width}px)")


if __name__ == "__main__":
    main()
