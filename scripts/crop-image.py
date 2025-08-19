#!/usr/bin/env python3
import argparse
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageOps

def main():
    p = argparse.ArgumentParser(description="Crop a 3:2 image to 16:9 by keeping width.")
    p.add_argument("image", help="Path to input image")
    args = p.parse_args()

    src_path = Path(args.image)
    if not src_path.exists():
        raise SystemExit(f"File not found: {src_path}")

    im = Image.open(src_path)
    im = ImageOps.exif_transpose(im)  # honor camera rotation

    W, H = im.size
    ar = W / H
    print(f"Original size: {W} x {H} px")
    print(f"Original aspect ratio: {ar:.6f} (width/height)")

    # target: keep width, change height to 16:9
    target_h = int(round(W * 9 / 16))
    if target_h > H:
        raise SystemExit(
            f"Cannot keep width: target 16:9 height ({target_h}) exceeds original height ({H})."
        )
    if target_h == H:
        print("Already 16:9 when keeping width. Saving a copy without cropping.")
        cropped = im
    else:
        to_remove = H - target_h
        print(f"\nTarget height: {target_h} px (16:9 at width {W})")
        print(f"Total pixels to remove vertically: {to_remove} px")

        def read_int(prompt):
            while True:
                try:
                    v = int(input(prompt))
                    if v < 0:
                        print("Enter a non-negative integer.")
                        continue
                    return v
                except ValueError:
                    print("Enter an integer.")

        while True:
            cut_top = read_int("Cut from TOP (px): ")
            cut_bottom = read_int("Cut from BOTTOM (px): ")
            s = cut_top + cut_bottom
            if s == to_remove and cut_top <= H and cut_bottom <= H:
                break
            print(
                f"Sum {s} px does not equal required {to_remove} px. Try again."
            )

        upper = cut_top
        lower = H - cut_bottom
        cropped = im.crop((0, upper, W, lower))

    ts = datetime.now().strftime("%Y.%m.%d.%H.%M.%S")
    out_path = src_path.with_name(f"{src_path.stem}_{ts}.png")
    cropped.save(out_path, format="PNG", optimize=True)
    newW, newH = cropped.size
    print(f"Saved: {out_path}")
    print(f"New size: {newW} x {newH} px (aspect {newW/newH:.6f})")

if __name__ == "__main__":
    main()
