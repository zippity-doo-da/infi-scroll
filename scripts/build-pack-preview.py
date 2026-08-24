#!/usr/bin/env python3
"""Render a representative 1280x720 approval frame from a normalized pack."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


def paste_scaled(canvas: Image.Image, path: Path, x: int, bottom: int, scale: float) -> None:
    image = Image.open(path).convert("RGBA")
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(size, Image.Resampling.LANCZOS)
    canvas.alpha_composite(image, (round(x - image.width / 2), bottom - image.height))


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("runtime", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    canvas = Image.new("RGBA", (1280, 720))
    sky = Image.open(args.runtime / "sky.png").convert("RGBA")
    canvas.alpha_composite(sky, (-352, 0))
    canvas.alpha_composite(Image.open(args.runtime / "distant-skyline.png").convert("RGBA"), (-352, 170))
    canvas.alpha_composite(Image.open(args.runtime / "midground-roofs.png").convert("RGBA"), (-352, 297))
    street = Image.open(args.runtime / "street.png").convert("RGBA")
    canvas.alpha_composite(street, (-352, 610))

    paste_scaled(canvas, args.runtime / "gatehouse.png", 320, 610, 0.58)
    paste_scaled(canvas, args.runtime / "guildhall.png", 790, 610, 0.75)
    paste_scaled(canvas, args.runtime / "townhouse.png", 1110, 610, 0.74)
    paste_scaled(canvas, args.runtime / "tree-cluster.png", 45, 610, 0.48)
    paste_scaled(canvas, args.runtime / "market-stall.png", 945, 610, 0.56)
    paste_scaled(canvas, args.runtime / "townsperson-1.png", 705, 610, 0.72)
    paste_scaled(canvas, args.runtime / "townsperson-3.png", 1040, 610, 0.72)
    paste_scaled(canvas, args.runtime / "wagon.png", 560, 705, 0.58)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(args.output, quality=94)


if __name__ == "__main__":
    main()
