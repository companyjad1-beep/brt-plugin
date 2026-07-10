"""Store marketing screenshot generator.

Takes raw app screenshots + config.yaml, outputs store-ready marketing
images (gradient background, device frame, headline copy) for every
configured target size and locale.

Usage:
    python generate.py [config.yaml]

Output layout:
    output/<target>/<locale>/<NN>_<screen-name>.png
"""

from __future__ import annotations

import re
import math
import sys
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Inline accent markup: "[word]" inside a title renders in the accent color.
MARK_RE = re.compile(r"\[([^\]]+)\]")


def strip_marks(text: str) -> str:
    return MARK_RE.sub(r"\1", text)


def draw_marked_line(draw, text, x, y, font, base_fill, accent_fill) -> None:
    """Render a line where [bracketed] segments use the accent color."""
    cx = x
    pos = 0
    for m in MARK_RE.finditer(text):
        pre = text[pos:m.start()]
        if pre:
            draw.text((cx, y), pre, font=font, fill=base_fill)
            cx += draw.textlength(pre, font=font)
        seg = m.group(1)
        draw.text((cx, y), seg, font=font, fill=accent_fill)
        cx += draw.textlength(seg, font=font)
        pos = m.end()
    rest = text[pos:]
    if rest:
        draw.text((cx, y), rest, font=font, fill=base_fill)

# ---------------------------------------------------------------- defaults

# Store-required / recommended sizes (portrait, px).
BUILTIN_TARGETS = {
    # App Store
    "appstore_iphone_6_9": {"width": 1320, "height": 2868},   # iPhone 16 Pro Max
    "appstore_iphone_6_5": {"width": 1242, "height": 2688},   # iPhone 11 Pro Max
    "appstore_ipad_13":    {"width": 2064, "height": 2752},   # iPad Pro 13"
    # Play Store
    "playstore_phone":     {"width": 1080, "height": 2400},
    "playstore_tablet_7":  {"width": 1200, "height": 1920},
    "playstore_tablet_10": {"width": 1600, "height": 2560},
}

FONT_CANDIDATES_BOLD = [
    "C:/Windows/Fonts/Pretendard-Bold.ttf",
    "C:/Windows/Fonts/malgunbd.ttf",
    "C:/Windows/Fonts/segoeuib.ttf",
]
FONT_CANDIDATES_REGULAR = [
    "C:/Windows/Fonts/Pretendard-Regular.ttf",
    "C:/Windows/Fonts/malgun.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
]

DEFAULT_BACKGROUND = ["#4F46E5", "#7C3AED"]
DEFAULT_TEXT_COLOR = "#FFFFFF"


# ---------------------------------------------------------------- helpers

def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def pick_font(explicit: str | None, candidates: list[str]) -> str:
    paths = ([explicit] if explicit else []) + candidates
    for p in paths:
        if p and Path(p).exists():
            return p
    raise FileNotFoundError(f"No usable font found among: {paths}")


def vertical_gradient(w: int, h: int, top: str, bottom: str) -> Image.Image:
    c1, c2 = hex_to_rgb(top), hex_to_rgb(bottom)
    strip = Image.new("RGB", (1, h))
    px = strip.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        px[0, y] = tuple(round(a + (b - a) * t) for a, b in zip(c1, c2))
    return strip.resize((w, h))


def rounded_mask(size: tuple[int, int], radius: int, ss: int = 4) -> Image.Image:
    """Antialiased rounded-rectangle mask via supersampling."""
    m = Image.new("L", (size[0] * ss, size[1] * ss), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle(
        [0, 0, size[0] * ss - 1, size[1] * ss - 1], radius * ss, fill=255
    )
    return m.resize(size, Image.LANCZOS)


def frame_device(shot: Image.Image, device_w: int) -> Image.Image:
    """Wrap a raw screenshot in a simple modern device frame."""
    bezel = max(round(device_w * 0.03), 8)
    screen_w = device_w - 2 * bezel
    screen_h = round(shot.height * screen_w / shot.width)
    shot = shot.convert("RGB").resize((screen_w, screen_h), Image.LANCZOS)

    screen_radius = round(screen_w * 0.09)
    device_h = screen_h + 2 * bezel
    device = Image.new("RGBA", (device_w, device_h), (0, 0, 0, 0))

    body_mask = rounded_mask((device_w, device_h), screen_radius + bezel)
    body = Image.new("RGBA", (device_w, device_h), (22, 22, 28, 255))
    device.paste(body, (0, 0), body_mask)

    shot_mask = rounded_mask((screen_w, screen_h), screen_radius)
    device.paste(shot, (bezel, bezel), shot_mask)
    return device


def drop_shadow(img: Image.Image, blur: int = 36, alpha: int = 110, dy: int = 18) -> Image.Image:
    """Soft drop shadow behind a transparent-background image."""
    pad = blur * 2 + dy
    out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    out.paste(Image.new("RGBA", img.size, (0, 0, 0, alpha)), (pad, pad + dy), img.split()[3])
    out = out.filter(ImageFilter.GaussianBlur(blur // 2))
    out.alpha_composite(img, (pad, pad))
    return out


def add_glow(canvas: Image.Image, w: int, h: int, color: str,
             cx: float = 0.5, cy: float = 0.14, size: float = 1.5, strength: float = 0.5) -> None:
    """Soft radial glow (moonlight feel) composited onto the canvas."""
    g = Image.radial_gradient("L").point(lambda v: 255 - v)
    gw = round(w * size)
    g = g.resize((gw, gw), Image.LANCZOS)
    tint = Image.new("RGBA", (gw, gw), (*hex_to_rgb(color), 0))
    tint.putalpha(g.point(lambda v: round(v * strength)))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay.paste(tint, (round(w * cx - gw / 2), round(h * cy - gw / 2)), tint)
    canvas.alpha_composite(overlay)


def scatter_stars(canvas: Image.Image, w: int, h: int, color: str, seed: str) -> None:
    """Subtle night-sky star field over the upper canvas."""
    import random

    rng = random.Random(seed)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    c = hex_to_rgb(color)
    for _ in range(rng.randint(55, 75)):
        x = rng.randint(0, w - 1)
        # Bias toward the top, but sprinkle the full height.
        y = round((rng.random() ** 1.7) * (h - 1))
        r = rng.choice([1, 1, 1, 2, 2, 3]) * max(round(w * 0.0012), 1)
        a = rng.randint(35, 150)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(*c, a))
    canvas.alpha_composite(overlay)


def build_quote_card(quote: dict, card_w: int) -> Image.Image:
    """Letter-style quote card: cream paper, serif text, signature."""
    text = quote.get("text", "")
    sig = quote.get("signature", "")
    tfont = ImageFont.truetype(FONTS["regular"], round(card_w * 0.052))
    sfont = ImageFont.truetype(FONTS["regular"], round(card_w * 0.044))
    pad = round(card_w * 0.09)
    probe = ImageDraw.Draw(Image.new("RGBA", (card_w, 10)))
    lines: list[str] = []
    for para in text.split("\n"):
        lines += wrap_text(probe, para, tfont, card_w - 2 * pad) or [""]
    lh = round(tfont.size * 1.75)
    h = pad * 2 + lh * len(lines) + (round(sfont.size * 2.6) if sig else 0)

    card = Image.new("RGBA", (card_w, h), (0, 0, 0, 0))
    paper = Image.new("RGBA", (card_w, h), (245, 237, 216, 255))
    card.paste(paper, (0, 0), rounded_mask((card_w, h), round(card_w * 0.05)))
    d = ImageDraw.Draw(card)
    ink = (42, 49, 84)
    y = pad
    for ln in lines:
        d.text((pad, y), ln, font=tfont, fill=ink)
        y += lh
    if sig:
        sw = d.textlength(sig, font=sfont)
        d.text((card_w - pad - sw, y + round(sfont.size * 0.5)), sig,
               font=sfont, fill=(*ink, 200))
    return card


def frameless_card(shot: Image.Image, card_w: int) -> Image.Image:
    """Toss-style frameless rounded screenshot card with a hairline border."""
    card_h = round(shot.height * card_w / shot.width)
    shot = shot.convert("RGB").resize((card_w, card_h), Image.LANCZOS)
    radius = round(card_w * 0.09)
    card = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
    card.paste(shot, (0, 0), rounded_mask((card_w, card_h), radius))
    outline = ImageDraw.Draw(card)
    outline.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius,
                              outline=(0, 0, 0, 28), width=2)
    return card

def build_cutout(shot: Image.Image, card_w: int) -> Image.Image:
    """Floating UI cutout chip: rounded fragment of a capture (Zeta-style evidence)."""
    card_h = round(shot.height * card_w / shot.width)
    shot = shot.convert("RGB").resize((card_w, card_h), Image.LANCZOS)
    radius = round(min(card_w, card_h) * 0.18)
    card = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
    card.paste(shot, (0, 0), rounded_mask((card_w, card_h), radius))
    outline = ImageDraw.Draw(card)
    outline.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius,
                              outline=(0, 0, 0, 28), width=2)
    return card


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_w: int) -> list[str]:
    lines: list[str] = []
    for para in text.split("\n"):
        words = para.split()
        cur = ""
        for word in words:
            trial = f"{cur} {word}".strip()
            if not cur or draw.textlength(trial, font=font) <= max_w:
                cur = trial
            else:
                lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
    return lines


def localized(value, locale: str) -> str:
    if isinstance(value, dict):
        return value.get(locale) or next(iter(value.values()), "")
    return value or ""


def cover_crop(img: Image.Image, w: int, h: int) -> Image.Image:
    """Scale-and-crop an image to fully cover w x h (center anchor)."""
    scale = max(w / img.width, h / img.height)
    nw, nh = round(img.width * scale), round(img.height * scale)
    img = img.resize((max(nw, w), max(nh, h)), Image.LANCZOS)
    left = (img.width - w) // 2
    top = (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


# ---------------------------------------------------------------- rendering

def scatter_dots(draw: ImageDraw.ImageDraw, width: int, height: int, palette: list[str], seed: str) -> None:
    """Sparse decorative confetti dots in the top band (reference style)."""
    import random

    rng = random.Random(seed)
    colors = [hex_to_rgb(c) for c in palette]
    for _ in range(rng.randint(7, 10)):
        # Keep dots near edges/top so they never collide with the headline block.
        x = rng.choice([rng.randint(0, round(width * 0.16)), rng.randint(round(width * 0.84), width)])
        y = rng.randint(round(height * 0.01), round(height * 0.42))
        r = rng.randint(round(width * 0.004), round(width * 0.011))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=rng.choice(colors))


def title_lines(title, locale: str) -> list[dict]:
    """Normalize title into [{text, color|None}] line dicts.

    Accepts: plain str (auto-wrapped later), or list of str / {text, color} /
    locale-dict entries.
    """
    if title is None or isinstance(title, (str, dict)):
        return [{"text": localized(title, locale), "color": None}]
    lines = []
    for entry in title:
        if isinstance(entry, str):
            lines.append({"text": entry, "color": None})
        else:
            lines.append({
                "text": localized(entry.get("text"), locale),
                "color": entry.get("color"),
            })
    return lines


def render(
    shot_path: Path | None,
    title: list[dict],
    subtitle: str,
    width: int,
    height: int,
    bg: list[str],
    text_color: str,
    bg_image: Path | None = None,
    overlay: float = 0.0,
    badge: str = "",
    badge_color: str = "#F97316",
    badge_text_color: str = "#FFFFFF",
    align: str = "center",
    decor: bool = False,
    decor_palette: list[str] | None = None,
    rotate: float = 0.0,
    accent_color: str = "",
    frame: bool = True,
    device_width: float = 0.74,
    shadow: bool = True,
    glow: str = "",
    decor_style: str = "dots",
    crop: list[float] | None = None,
    device_position: str = "center",
    quote: dict | None = None,
    device_top: float = 0.0,
    seed: str = "",
    cutouts: list[dict] | None = None,
) -> Image.Image:
    if bg_image is not None:
        canvas = cover_crop(Image.open(bg_image).convert("RGB"), width, height).convert("RGBA")
        if overlay > 0:
            shade = Image.new("RGBA", (width, height), (0, 0, 0, round(255 * overlay)))
            canvas = Image.alpha_composite(canvas, shade)
    else:
        canvas = vertical_gradient(width, height, bg[0], bg[-1]).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    title_font = ImageFont.truetype(FONTS["bold"], round(width * 0.070))
    sub_font = ImageFont.truetype(FONTS["regular"], round(width * 0.040))
    badge_font = ImageFont.truetype(FONTS["bold"], round(width * 0.032))
    color = hex_to_rgb(text_color)
    margin = round(width * 0.07)
    max_text_w = width - 2 * margin

    def line_x(line_w: float) -> float:
        return margin if align == "left" else (width - line_w) / 2

    if glow:
        add_glow(canvas, width, height, glow)
    if decor:
        if decor_style == "stars":
            scatter_stars(canvas, width, height, (decor_palette or ["#F2E6C9"])[0], seed)
        else:
            palette = decor_palette or [badge_color, "#10B981", "#F59E0B"]
            scatter_dots(draw, width, height, palette, seed)

    y = round(height * 0.045)

    if badge:
        pad_x = round(badge_font.size * 0.75)
        pad_y = round(badge_font.size * 0.42)
        tw = draw.textlength(badge, font=badge_font)
        bw, bh = tw + 2 * pad_x, badge_font.size + 2 * pad_y
        bx = line_x(bw)
        draw.rounded_rectangle([bx, y, bx + bw, y + bh], radius=bh / 2, fill=hex_to_rgb(badge_color))
        draw.text((bx + pad_x, y + pad_y - round(badge_font.size * 0.08)), badge,
                  font=badge_font, fill=hex_to_rgb(badge_text_color))
        y += bh + round(height * 0.018)

    # Explicit line list renders as-is (per-line accent colors);
    # a single auto line gets word-wrapped. "[word]" spans use the accent color.
    accent = hex_to_rgb(accent_color or badge_color)
    lines: list[tuple[str, tuple]] = []
    if len(title) == 1 and title[0]["color"] is None:
        text = title[0]["text"]
        if "[" in text:
            lines += [(t, color) for t in text.split("\n")]
        else:
            lines += [(t, color) for t in wrap_text(draw, text, title_font, max_text_w)]
    else:
        for entry in title:
            fill = hex_to_rgb(entry["color"]) if entry["color"] else color
            lines.append((entry["text"], fill))
    for text, fill in lines:
        lw = draw.textlength(strip_marks(text), font=title_font)
        if "[" in text:
            draw_marked_line(draw, text, line_x(lw), y, title_font, fill, accent)
        else:
            draw.text((line_x(lw), y), text, font=title_font, fill=fill)
        y += round(title_font.size * 1.22)

    if subtitle:
        y += round(height * 0.012)
        sub_color = (*color, 210)
        for line in wrap_text(draw, subtitle, sub_font, max_text_w):
            lw = draw.textlength(line, font=sub_font)
            draw.text((line_x(lw), y), line, font=sub_font, fill=sub_color)
            y += round(sub_font.size * 1.35)

    if quote:
        device = build_quote_card(quote, round(width * device_width))
    elif shot_path is not None:
        shot = Image.open(shot_path)
        if crop:
            sw, sh = shot.size
            shot = shot.crop((round(crop[0] * sw), round(crop[1] * sh),
                              round(crop[2] * sw), round(crop[3] * sh)))
        if frame:
            device = frame_device(shot, round(width * device_width))
        else:
            device = frameless_card(shot, round(width * (device_width if device_width != 0.74 else 0.80)))
    else:
        device = None  # text-only slide (e.g. portrait banner without a capture)
    if device is not None:
        if rotate:
            device = device.rotate(rotate, expand=True, resample=Image.BICUBIC)
        if shadow:
            device = drop_shadow(device, blur=round(width * 0.03),
                                 alpha=100, dy=round(width * 0.012))
        if device_top > 0:
            # Fixed device anchor (uniform placement across a set).
            top = round(height * device_top)
        else:
            top = y + round(height * 0.035)
            available = height - top
            if device.height <= available and device_position != "top":
                # Center in remaining space ("top" hugs the headline instead).
                top += (available - device.height) // 2
            # else: device bleeds off the bottom edge (intentional marketing style).
        canvas.alpha_composite(device, ((width - device.width) // 2, top))

    # Floating UI cutouts (Zeta-style evidence chips) — composited above the device.
    for co in cutouts or []:
        chip_src = Image.open(co["path"])
        c = co.get("crop")
        if c:
            sw, sh = chip_src.size
            chip_src = chip_src.crop((round(c[0] * sw), round(c[1] * sh),
                                      round(c[2] * sw), round(c[3] * sh)))
        chip = build_cutout(chip_src, round(width * float(co.get("width", 0.55))))
        r = float(co.get("rotate", 0.0))
        if r:
            chip = chip.rotate(r, expand=True, resample=Image.BICUBIC)
        chip = drop_shadow(chip, blur=round(width * 0.025),
                           alpha=120, dy=round(width * 0.008))
        cx = round(width * float(co.get("x", 0.72)))
        cy = round(height * float(co.get("y", 0.55)))
        canvas.alpha_composite(chip, (cx - chip.width // 2, cy - chip.height // 2))
    return canvas.convert("RGB")


def render_feature(
    spec: dict,
    locale: str,
    root: Path,
    default_bg: list[str],
    default_color: str,
) -> Image.Image:
    """Play Store feature graphic (default 1024x500, landscape)."""
    w = int(spec.get("width", 1024))
    h = int(spec.get("height", 500))
    bg_image = spec.get("background_image")
    if bg_image:
        canvas = cover_crop(Image.open(root / bg_image).convert("RGB"), w, h).convert("RGBA")
        overlay = float(spec.get("overlay", 0.35))
        if overlay > 0:
            canvas = Image.alpha_composite(
                canvas, Image.new("RGBA", (w, h), (0, 0, 0, round(255 * overlay))))
    else:
        bg = spec.get("background", default_bg)
        canvas = vertical_gradient(w, h, bg[0], bg[-1]).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    source = localized(spec.get("source"), locale) or None
    color = hex_to_rgb(spec.get("text_color", default_color))
    base = math.sqrt(w * h)  # size-invariant type scale (1024x500 ≈ old h-based values)
    title_font = ImageFont.truetype(FONTS["bold"], round(base * 0.091))
    sub_font = ImageFont.truetype(FONTS["regular"], round(base * 0.046))
    margin = round(w * 0.06)
    text_w = round(w * 0.58) if source else w - 2 * margin

    accent = hex_to_rgb(spec.get("accent_color", "#E8C987"))
    lines: list[tuple[str, tuple, object]] = []
    for entry in title_lines(spec.get("title"), locale):
        fill = hex_to_rgb(entry["color"]) if entry["color"] else color
        if "[" in entry["text"]:
            for text in entry["text"].split("\n"):
                lines.append((text, fill, title_font))
        else:
            for text in wrap_text(draw, entry["text"], title_font, text_w):
                lines.append((text, fill, title_font))
    subtitle = localized(spec.get("subtitle"), locale)
    if subtitle:
        for text in wrap_text(draw, subtitle, sub_font, text_w):
            lines.append((text, (*color, 210), sub_font))

    total_h = sum(round(f.size * 1.28) for _, _, f in lines)
    y = (h - total_h) / 2
    for text, fill, font in lines:
        lw = draw.textlength(strip_marks(text), font=font)
        x = margin if source else (w - lw) / 2
        if "[" in text:
            draw_marked_line(draw, text, x, y, font, fill, accent)
        else:
            draw.text((x, y), text, font=font, fill=fill)
        y += round(font.size * 1.28)

    if source:
        dw = float(spec.get("device_width", 0.24))
        device = frame_device(Image.open(root / source), round(w * dw))
        # Anchor to the right edge; vertically centered-ish with headroom.
        dx = w - device.width - round(w * 0.05)
        dy = round(h * float(spec.get("device_top", 0.10)))
        canvas.alpha_composite(device, (dx, dy))
    return canvas.convert("RGB")


# ---------------------------------------------------------------- main

def main() -> None:
    config_path = Path(sys.argv[1] if len(sys.argv) > 1 else "config.yaml")
    root = config_path.resolve().parent
    cfg = yaml.safe_load(config_path.read_text(encoding="utf-8"))

    global FONTS
    font_cfg = cfg.get("font") or {}

    def resolve_fonts(locale: str) -> dict:
        # Per-locale override: font: { ja: { bold: ..., regular: ... } }
        lc = font_cfg.get(locale) or {}
        return {
            "bold": pick_font(lc.get("bold") or font_cfg.get("bold"), FONT_CANDIDATES_BOLD),
            "regular": pick_font(lc.get("regular") or font_cfg.get("regular"), FONT_CANDIDATES_REGULAR),
        }

    FONTS = resolve_fonts("")

    targets = dict(BUILTIN_TARGETS)
    targets.update(cfg.get("targets") or {})
    enabled = cfg.get("enabled_targets") or list(targets)

    defaults = cfg.get("defaults") or {}
    default_bg = defaults.get("background", DEFAULT_BACKGROUND)
    default_color = defaults.get("text_color", DEFAULT_TEXT_COLOR)
    locales = cfg.get("locales") or ["ko"]

    out_root = root / (cfg.get("output_dir") or "output")
    screens = cfg.get("screens") or []
    if not screens and not cfg.get("feature_graphic") and not cfg.get("banners"):
        sys.exit("config error: no screens, feature_graphic, or banners defined")
    enabled = enabled if screens else []

    count = 0
    for target_name in enabled:
        spec = targets[target_name]
        for locale in locales:
            FONTS = resolve_fonts(locale)
            out_dir = out_root / target_name / locale
            out_dir.mkdir(parents=True, exist_ok=True)
            for idx, screen in enumerate(screens, start=1):
                # source may be a locale dict: { ko: ..., en: ... }; quote slides need no source
                src_val = screen.get("source")
                src = (root / localized(src_val, locale)) if src_val else None
                bg_image = screen.get("background_image")

                cutouts = []
                for co in screen.get("cutouts") or []:
                    co = dict(co)
                    co_src = co.get("source") or src_val
                    if not co_src:
                        sys.exit(f"config error: screen {idx} cutout needs a source")
                    co["path"] = root / localized(co_src, locale)
                    cutouts.append(co)

                def opt(key, fallback=None):
                    return screen.get(key, defaults.get(key, fallback))

                img = render(
                    shot_path=src,
                    title=title_lines(screen.get("title"), locale),
                    subtitle=localized(screen.get("subtitle"), locale),
                    width=spec["width"],
                    height=spec["height"],
                    bg=screen.get("background", default_bg),
                    text_color=screen.get("text_color", default_color),
                    bg_image=(root / bg_image) if bg_image else None,
                    overlay=float(screen.get("overlay", defaults.get("overlay", 0.35 if bg_image else 0.0))),
                    badge=localized(screen.get("badge"), locale),
                    badge_color=opt("badge_color", "#F97316"),
                    badge_text_color=opt("badge_text_color", "#FFFFFF"),
                    align=opt("align", "center"),
                    decor=bool(opt("decor", False)),
                    decor_palette=opt("decor_palette"),
                    rotate=float(screen.get("rotate", 0.0)),
                    accent_color=opt("accent_color", ""),
                    frame=bool(opt("frame", True)),
                    device_width=float(opt("device_width", 0.74)),
                    shadow=bool(opt("shadow", True)),
                    glow=opt("glow", "") or "",
                    decor_style=opt("decor_style", "dots"),
                    crop=screen.get("crop"),
                    device_position=opt("device_position", "center"),
                    quote=screen.get("quote"),
                    device_top=float(opt("device_top", 0.0)),
                    seed=str(opt("seed", f"{target_name}/{idx}")),
                    cutouts=cutouts,
                )
                name = f"{idx:02d}_{src.stem if src else 'quote'}.png"
                img.save(out_dir / name)
                count += 1
        print(f"[done] {target_name}: {len(locales) * len(screens)} images")

    fg = cfg.get("feature_graphic")
    if fg:
        for locale in locales:
            FONTS = resolve_fonts(locale)
            out_dir = out_root / "playstore_feature" / locale
            out_dir.mkdir(parents=True, exist_ok=True)
            img = render_feature(fg, locale, root, default_bg, default_color)
            img.save(out_dir / "feature.png")
            count += 1
        print(f"[done] playstore_feature: {len(locales)} images")

    banners = cfg.get("banners") or []
    if banners:
        for locale in locales:
            FONTS = resolve_fonts(locale)
            out_dir = out_root / "banners" / locale
            out_dir.mkdir(parents=True, exist_ok=True)
            for i, bn in enumerate(banners, start=1):
                w, h = int(bn.get("width", 1200)), int(bn.get("height", 630))
                if h > w:
                    # Portrait (story/reel) → screenshot-style vertical layout.
                    src_val = bn.get("source")
                    img = render(
                        shot_path=(root / localized(src_val, locale)) if src_val else None,
                        title=title_lines(bn.get("title"), locale),
                        subtitle=localized(bn.get("subtitle"), locale),
                        width=w,
                        height=h,
                        bg=bn.get("background", default_bg),
                        text_color=bn.get("text_color", default_color),
                        bg_image=(root / bn["background_image"]) if bn.get("background_image") else None,
                        overlay=float(bn.get("overlay", 0.35 if bn.get("background_image") else 0.0)),
                        badge=localized(bn.get("badge"), locale),
                        align=bn.get("align", "center"),
                        accent_color=bn.get("accent_color", ""),
                        frame=bool(bn.get("frame", True)),
                        device_width=float(bn.get("device_width", 0.74)),
                        rotate=float(bn.get("rotate", 0.0)),
                        crop=bn.get("crop"),
                        seed=f"banner/{i}",
                    )
                else:
                    # Landscape/square (OG, feature, PH gallery) → text-left layout.
                    img = render_feature({**bn, "width": w, "height": h},
                                         locale, root, default_bg, default_color)
                name = f"{i:02d}_{bn.get('name') or f'{w}x{h}'}.png"
                img.save(out_dir / name)
                count += 1
        print(f"[done] banners: {len(locales) * len(banners)} images")

    print(f"total {count} images -> {out_root}")


if __name__ == "__main__":
    main()
