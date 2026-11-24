#!/usr/bin/env python3
"""Original demo 4-view sheets for Sprite Stack Studio (not from upstream)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

OUTLINE = (15, 15, 20, 255)
BG = (250, 250, 250, 255)


def view(w: int, h: int, rects: list[tuple[int, int, int, int, tuple[int, int, int]]]) -> np.ndarray:
    a = np.zeros((h, w, 4), np.uint8)
    for x0, y0, x1, y1, c in rects:
        a[y0:y1, x0:x1] = (*c, 255)
    return a


def outlined(v: np.ndarray) -> np.ndarray:
    h, w = v.shape[:2]
    o = np.zeros((h + 2, w + 2, 4), np.uint8)
    o[1:-1, 1:-1] = v
    m = o[..., 3] > 0
    p = np.pad(m, 1)
    o[~m & (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:])] = OUTLINE
    return o


def sheet(views: list[np.ndarray], scale: int = 8, gap: int = 40) -> np.ndarray:
    views = [outlined(v) for v in views]
    w = sum(v.shape[1] * scale for v in views) + gap * (len(views) + 1)
    h = max(v.shape[0] * scale for v in views) + gap * 2
    out = Image.new("RGBA", (w, h), BG)
    x = gap
    for v in views:
        im = Image.fromarray(v).resize((v.shape[1] * scale, v.shape[0] * scale), Image.NEAREST)
        out.paste(im, (x, (h - im.height) // 2), im)
        x += im.width + gap
    return np.array(out)


# Palette ramps
TERRA = (176, 96, 48)
TERRA_D = (120, 62, 30)
TERRA_L = (228, 150, 88)
GREEN = (72, 150, 78)
GREEN_D = (40, 95, 48)
GREEN_L = (130, 210, 120)
BARK = (100, 65, 38)
BARK_D = (60, 38, 22)
AMBER = (240, 178, 50)
AMBER_D = (180, 110, 20)
AMBER_L = (255, 220, 120)
RED = (210, 50, 45)
RED_D = (140, 30, 28)
SLATE = (70, 78, 95)
SLATE_L = (120, 130, 150)
WOOD = (130, 90, 55)

# Round pot (uses --round): 16w x 20h side profile, circular top
pot_top = view(18, 18, [(4, 4, 14, 14, TERRA), (7, 7, 11, 11, TERRA_L)])
pot_side = view(20, 20, [(2, 4, 18, 18, TERRA), (2, 16, 18, 20, TERRA_D)])
pot_front = view(18, 20, [(2, 4, 16, 18, TERRA), (2, 16, 16, 20, TERRA_D)])
pot = [pot_top, pot_side, pot_front, pot_front.copy()]

# Blocky car (from check.py proportions, original colors)
L, W = 48, 24
DRK = (40, 50, 70)
TYR = (30, 30, 34)
car_top = view(W, L, [(0, 0, W, L, RED), (4, 10, W - 4, 38, DRK)])
car_side = view(L, 18, [(0, 7, L, 15, RED), (10, 1, 37, 7, DRK), (5, 13, 13, 18, TYR), (35, 13, 43, 18, TYR)])
car_front = view(W, 18, [(0, 7, W, 15, RED), (4, 1, W - 4, 7, DRK), (1, 13, 4, 18, TYR), (W - 4, 13, W - 1, 18, TYR)])
car = [car_top, car_side, car_front, car_front.copy()]

# Tree
LEAF = GREEN
LEAF_D = GREEN_D
tree_top = view(20, 20, [(2, 2, 18, 18, LEAF), (6, 6, 14, 14, LEAF_D)])
tree_side = view(20, 40, [(2, 0, 18, 26, LEAF), (8, 26, 12, 40, BARK)])
tree = [tree_top, tree_side, tree_side.copy(), tree_side.copy()]

# Lantern on crate
crate_top = view(22, 16, [(0, 0, 22, 16, WOOD), (2, 2, 20, 14, BARK_D)])
crate_side = view(22, 14, [(0, 0, 22, 14, WOOD), (3, 3, 19, 11, BARK)])
crate_front = view(16, 22, [(0, 6, 16, 22, WOOD), (5, 0, 11, 8, AMBER), (4, 8, 12, 10, AMBER_L)])
lantern = [crate_top, crate_side, crate_front, crate_front.copy()]

SAMPLES = [
    ("round-pot", "Round Pot", pot, {"round": True, "slices": 20, "colours": 24}),
    ("blocky-car", "Blocky Car", car, {"slices": 18, "colours": 24}),
    ("pixel-tree", "Pixel Tree", tree, {"slices": 40, "colours": 24}),
    ("lantern-crate", "Lantern Crate", lantern, {"slices": 22, "colours": 24}),
]


def main() -> None:
    app = Path(__file__).resolve().parents[1]
    raw_dir = app / "samples" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    manifest_items = []
    for sid, title, views, _opts in SAMPLES:
        arr = sheet(views)
        out = raw_dir / f"{sid}-sheet.png"
        Image.fromarray(arr).save(out)
        manifest_items.append({"id": sid, "title": title, "sheet": f"raw/{sid}-sheet.png"})
    (app / "samples" / "manifest-draft.json").write_text(json.dumps(manifest_items, indent=2))
    print(f"Wrote {len(SAMPLES)} sheets to {raw_dir}")


if __name__ == "__main__":
    main()