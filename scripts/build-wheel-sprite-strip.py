#!/usr/bin/env python3
"""Build a horizontal sprite strip by rotating circular wheel regions."""

from argparse import ArgumentParser
from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw


def render_uniform_wheel(radius: int, angle_degrees: float) -> Image.Image:
    """Render one perfectly circular antialiased wheel with rotating spokes."""
    supersample = 4
    size = radius * 2
    scaled_size = size * supersample
    center = radius * supersample
    wheel = Image.new("RGBA", (scaled_size, scaled_size))
    draw = ImageDraw.Draw(wheel)

    def circle(r: float, fill: tuple[int, int, int, int]) -> None:
        scaled = r * supersample
        draw.ellipse((center - scaled, center - scaled, center + scaled, center + scaled), fill=fill)

    circle(radius - 0.5, (47, 30, 42, 255))
    circle(radius - 4, (155, 86, 35, 255))
    circle(radius - 7, (232, 157, 62, 255))
    circle(radius - 10, (55, 35, 43, 255))

    angle_offset = angle_degrees * pi / 180
    # Five spokes ensure each 45-degree frame is visually distinct. Eight
    # spokes would map exactly onto themselves after every 45-degree turn.
    for index in range(5):
        angle = angle_offset + index * 2 * pi / 5
        inner = 8 * supersample
        outer = (radius - 11) * supersample
        start = (center + cos(angle) * inner, center + sin(angle) * inner)
        end = (center + cos(angle) * outer, center + sin(angle) * outer)
        draw.line((start, end), fill=(42, 28, 38, 255), width=6 * supersample)
        draw.line((start, end), fill=(211, 132, 45, 255), width=3 * supersample)

    circle(9, (46, 31, 42, 255))
    circle(6, (101, 118, 111, 255))
    circle(2.5, (224, 150, 55, 255))
    return wheel.resize((size, size), Image.Resampling.LANCZOS)


def parse_wheel(value: str) -> tuple[int, int, int]:
    try:
        x, y, radius = (int(part) for part in value.split(","))
    except ValueError as error:
        raise ValueError("wheel must be formatted as x,y,radius") from error
    return x, y, radius


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--frames", type=int, default=8)
    parser.add_argument("--wheel", action="append", required=True, type=parse_wheel)
    parser.add_argument("--uniform", action="store_true", help="Replace source wheels with identical geometric wheels")
    args = parser.parse_args()

    source = Image.open(args.input).convert("RGBA")
    strip = Image.new("RGBA", (source.width * args.frames, source.height))

    wheel_patches: list[tuple[int, int, int, Image.Image]] = []
    for x, y, radius in args.wheel:
        bounds = (x - radius, y - radius, x + radius, y + radius)
        patch = source.crop(bounds)
        circle = Image.new("L", patch.size)
        ImageDraw.Draw(circle).ellipse((0, 0, patch.width - 1, patch.height - 1), fill=255)
        patch.putalpha(Image.composite(patch.getchannel("A"), Image.new("L", patch.size), circle))
        wheel_patches.append((x, y, radius, patch))

    for frame_index in range(args.frames):
        frame = source.copy()
        draw = ImageDraw.Draw(frame)
        angle = frame_index * 360 / args.frames
        for x, y, radius, patch in wheel_patches:
            if args.uniform:
                uniform = render_uniform_wheel(radius, -angle)
                frame.alpha_composite(uniform, (x - radius, y - radius))
                continue
            # Keep the tire/rim from the locked source frame stationary. Only
            # clear and rotate the inner hub/spoke disc so irregular tire edges
            # cannot wobble from frame to frame.
            inner = radius - 1
            draw.ellipse((x - inner, y - inner, x + inner, y + inner), fill=(37, 27, 38, 255))
            rotated = patch.rotate(-angle, resample=Image.Resampling.BICUBIC, expand=False)
            frame.alpha_composite(rotated, (x - radius, y - radius))
        strip.alpha_composite(frame, (frame_index * source.width, 0))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    strip.save(args.output)
    print(f"{source.size} x {args.frames} frames -> {strip.size}")


if __name__ == "__main__":
    main()
