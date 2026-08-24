#!/usr/bin/env python3
"""Pack trimmed frames into equal cells with stable centered anchors."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("frames", nargs="+", type=Path)
    parser.add_argument("--cell-width", type=int)
    parser.add_argument("--cell-height", type=int)
    args = parser.parse_args()

    frames = [Image.open(path).convert("RGBA") for path in args.frames]
    cell_width = args.cell_width or max(frame.width for frame in frames)
    cell_height = args.cell_height or max(frame.height for frame in frames)
    strip = Image.new("RGBA", (cell_width * len(frames), cell_height))

    for index, frame in enumerate(frames):
        scale = min(cell_width / frame.width, cell_height / frame.height)
        size = (max(1, round(frame.width * scale)), max(1, round(frame.height * scale)))
        normalized = frame.resize(size, Image.Resampling.LANCZOS)
        x = index * cell_width + (cell_width - size[0]) // 2
        y = (cell_height - size[1]) // 2
        strip.alpha_composite(normalized, (x, y))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    strip.save(args.output)
    print(f"{len(frames)} frames -> {strip.size}; cell={cell_width}x{cell_height}")


if __name__ == "__main__":
    main()
