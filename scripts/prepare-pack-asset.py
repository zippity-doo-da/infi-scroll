#!/usr/bin/env python3
"""Normalize one authored PNG or horizontal animation strip for runtime use."""

from argparse import ArgumentParser
from pathlib import Path
from PIL import Image, ImageFilter


def crop_visible(image: Image.Image, threshold: int = 12) -> Image.Image:
    alpha = image.getchannel("A")
    bounds = alpha.point(lambda value: 255 if value >= threshold else 0).getbbox()
    if not bounds:
        raise ValueError("image has no visible pixels")
    return image.crop(bounds)


def resize(image: Image.Image, width: int | None, height: int | None, maximum: int | None) -> Image.Image:
    if width and height:
        size = (width, height)
    elif height:
        size = (max(1, round(image.width * height / image.height)), height)
    elif width:
        size = (width, max(1, round(image.height * width / image.width)))
    elif maximum and max(image.size) > maximum:
        scale = maximum / max(image.size)
        size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    else:
        return image
    return image.resize(size, Image.Resampling.LANCZOS)


def clean_edge(image: Image.Image, pixels: int) -> Image.Image:
    if pixels <= 0:
        return image
    alpha = image.getchannel("A").filter(ImageFilter.MinFilter(pixels * 2 + 1)).filter(ImageFilter.GaussianBlur(0.35))
    image.putalpha(alpha)
    return image


def make_seamless(image: Image.Image, blend_width: int) -> Image.Image:
    width, height = image.size
    blend_width = min(blend_width, width // 4)
    source = image.copy()
    source_pixels, output_pixels = source.load(), image.load()
    for offset in range(blend_width):
        left_x, right_x = offset, width - 1 - offset
        preserve = offset / max(1, blend_width - 1)
        for y in range(height):
            left, right = source_pixels[left_x, y], source_pixels[right_x, y]
            midpoint = tuple(round((left[channel] + right[channel]) / 2) for channel in range(4))
            output_pixels[left_x, y] = tuple(round(midpoint[channel] * (1 - preserve) + left[channel] * preserve) for channel in range(4))
            output_pixels[right_x, y] = tuple(round(midpoint[channel] * (1 - preserve) + right[channel] * preserve) for channel in range(4))
    return image


def normalize_strip(image: Image.Image, frames: int, cell_width: int, cell_height: int, trim: bool) -> Image.Image:
    if image.width % frames:
        raise ValueError(f"strip width {image.width} is not divisible by {frames} frames")
    source_width = image.width // frames
    cells = []
    for index in range(frames):
        frame = image.crop((index * source_width, 0, (index + 1) * source_width, image.height))
        cells.append(crop_visible(frame) if trim else frame)
    shared_scale = min(cell_width / max(frame.width for frame in cells), cell_height / max(frame.height for frame in cells))
    output = Image.new("RGBA", (frames * cell_width, cell_height))
    for index, frame in enumerate(cells):
        size = (max(1, round(frame.width * shared_scale)), max(1, round(frame.height * shared_scale)))
        frame = frame.resize(size, Image.Resampling.LANCZOS)
        x = index * cell_width + (cell_width - frame.width) // 2
        y = cell_height - frame.height
        output.alpha_composite(frame, (x, y))
    return output


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--trim", action="store_true")
    parser.add_argument("--width", type=int)
    parser.add_argument("--height", type=int)
    parser.add_argument("--max-size", type=int)
    parser.add_argument("--crop", help="x,y,width,height")
    parser.add_argument("--clean-edge", type=int, default=0)
    parser.add_argument("--seam-width", type=int, default=0)
    parser.add_argument("--frames", type=int, default=1)
    parser.add_argument("--cell-width", type=int)
    parser.add_argument("--cell-height", type=int)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    if args.crop:
        x, y, width, height = [int(value) for value in args.crop.split(",")]
        image = image.crop((x, y, x + width, y + height))
    if args.frames > 1:
        if not args.cell_width or not args.cell_height:
            raise SystemExit("animation strips require --cell-width and --cell-height")
        image = normalize_strip(image, args.frames, args.cell_width, args.cell_height, args.trim)
    else:
        if args.trim:
            image = crop_visible(image)
        image = resize(image, args.width, args.height, args.max_size)
        image = clean_edge(image, args.clean_edge)
    if args.seam_width:
        image = make_seamless(image, args.seam_width)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output, optimize=True)
    print(f"prepared {args.input} -> {args.output} ({image.width}x{image.height})")


if __name__ == "__main__":
    main()
