import math
import zlib
import struct
import os

def create_png(width, height, get_pixel):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type None
        for x in range(width):
            r, g, b, a = get_pixel(x, y)
            raw_data.extend([
                max(0, min(255, int(r))),
                max(0, min(255, int(g))),
                max(0, min(255, int(b))),
                max(0, min(255, int(a)))
            ])
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def render_monogram_pixel(nx, ny, is_maskable=False):
    """
    nx, ny: normalized coordinates [-1.0, 1.0]
    """
    scale = 0.72 if is_maskable else 0.88
    sx = nx / scale
    sy = ny / scale

    # Base background: Luxury blush pink gradient
    t_diag = (nx + ny + 2.0) / 4.0
    t_diag = max(0.0, min(1.0, t_diag))
    # #fdf5f9 (253, 245, 249) to #f5deec (245, 222, 236)
    bg_r = 253.0 * (1.0 - t_diag) + 245.0 * t_diag
    bg_g = 245.0 * (1.0 - t_diag) + 222.0 * t_diag
    bg_b = 249.0 * (1.0 - t_diag) + 236.0 * t_diag
    bg_a = 255.0

    r, g, b, a = bg_r, bg_g, bg_b, bg_a

    # Soft circular disc emblem
    dist_center = math.sqrt(sx * sx + sy * sy)
    disc_radius = 0.92
    if dist_center < disc_radius + 0.05:
        disc_t = max(0.0, min(1.0, (disc_radius + 0.02 - dist_center) / 0.03))
        # Inner Disc: Pure luxury pearl white
        disc_r, disc_g, disc_b = 255.0, 255.0, 255.0
        
        # Disc gold rim
        rim_width = 0.035
        if abs(dist_center - disc_radius) < rim_width:
            rim_t = 1.0 - abs(dist_center - disc_radius) / rim_width
            rim_r, rim_g, rim_b = 223.0, 182.0, 114.0 # champagne gold
            disc_r = disc_r * (1.0 - rim_t) + rim_r * rim_t
            disc_g = disc_g * (1.0 - rim_t) + rim_g * rim_t
            disc_b = disc_b * (1.0 - rim_t) + rim_b * rim_t

        r = r * (1.0 - disc_t) + disc_r * disc_t
        g = g * (1.0 - disc_t) + disc_g * disc_t
        b = b * (1.0 - disc_t) + disc_b * disc_t

    # Orbit 1: Lilac Ring (angle = -25 deg)
    angle_rad = -25.0 * math.pi / 180.0
    cos_a, sin_a = math.cos(angle_rad), math.sin(angle_rad)
    rx1 = sx * cos_a - sy * sin_a
    ry1 = sx * sin_a + sy * cos_a
    # Ellipse: (rx / a)^2 + (ry / b)^2 = 1
    a_orbit, b_orbit = 0.76, 0.38
    d_orbit1 = math.sqrt((rx1 / a_orbit) ** 2 + (ry1 / b_orbit) ** 2)
    ring_thick = 0.032
    if abs(d_orbit1 - 1.0) < ring_thick:
        alpha1 = (1.0 - abs(d_orbit1 - 1.0) / ring_thick) * 0.95
        # Soft lavender lilac #cbb3d9 (203, 179, 217)
        r = r * (1.0 - alpha1) + 203.0 * alpha1
        g = g * (1.0 - alpha1) + 179.0 * alpha1
        b = b * (1.0 - alpha1) + 217.0 * alpha1

    # Orbit 2: Gold Ring (slightly offset by dx=0.015, dy=0.015)
    sx2, sy2 = sx - 0.018, sy - 0.018
    rx2 = sx2 * cos_a - sy2 * sin_a
    ry2 = sx2 * sin_a + sy2 * cos_a
    d_orbit2 = math.sqrt((rx2 / a_orbit) ** 2 + (ry2 / b_orbit) ** 2)
    if abs(d_orbit2 - 1.0) < ring_thick * 0.85:
        alpha2 = (1.0 - abs(d_orbit2 - 1.0) / (ring_thick * 0.85)) * 0.95
        # Luxury gold #dfb672 (223, 182, 114)
        r = r * (1.0 - alpha2) + 223.0 * alpha2
        g = g * (1.0 - alpha2) + 182.0 * alpha2
        b = b * (1.0 - alpha2) + 114.0 * alpha2

    # Sparkle Star ✦ (Top right: cx=0.52, cy=-0.50)
    st_cx, st_cy = 0.48, -0.46
    st_dx = abs(sx - st_cx)
    st_dy = abs(sy - st_cy)
    st_rad = 0.16
    if st_dx < st_rad and st_dy < st_rad:
        # 4-point star astroid condition: (x/r)^(2/3) + (y/r)^(2/3) <= 1
        star_val = (st_dx / st_rad) ** 0.65 + (st_dy / st_rad) ** 0.65
        if star_val <= 1.0:
            st_alpha = (1.0 - star_val) ** 0.5
            # Rich golden sparkle
            r = r * (1.0 - st_alpha) + 245.0 * st_alpha
            g = g * (1.0 - st_alpha) + 210.0 * st_alpha
            b = b * (1.0 - st_alpha) + 120.0 * st_alpha

    # Heart ♡ (Bottom right: cx=0.48, cy=0.48)
    h_cx, h_cy = 0.46, 0.46
    hx = (sx - h_cx) / 0.14
    hy = -(sy - h_cy) / 0.14 - 0.1  # Invert y and adjust
    # Heart curve: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
    h_eq = (hx * hx + hy * hy - 0.7) ** 3 - (hx * hx) * (hy * hy * hy)
    if h_eq <= 0.05:
        h_alpha = max(0.0, min(1.0, (0.05 - h_eq) / 0.08))
        # Luxury rose #ba5489 (186, 84, 137)
        r = r * (1.0 - h_alpha) + 186.0 * h_alpha
        g = g * (1.0 - h_alpha) + 84.0 * h_alpha
        b = b * (1.0 - h_alpha) + 137.0 * h_alpha

    # Center Golden Monogram 'B'
    # B dimensions
    bx = sx + 0.04  # Optical center
    by = sy

    # Check if inside 'B' shape
    in_B = False
    
    # Stem: from x = -0.25 to -0.11, y = -0.46 to 0.46
    if -0.25 <= bx <= -0.11 and -0.46 <= by <= 0.46:
        in_B = True
    
    # Top serif: x from -0.32 to -0.06, y from -0.49 to -0.43
    if -0.32 <= bx <= -0.06 and -0.49 <= by <= -0.43:
        in_B = True
    
    # Bottom serif: x from -0.32 to -0.06, y from 0.43 to 0.49
    if -0.32 <= bx <= -0.06 and 0.43 <= by <= 0.49:
        in_B = True

    # Top bowl (x center: -0.11, y center: -0.23)
    # Outer radius rx=0.34, ry=0.23
    # Inner cutout rx=0.20, ry=0.12
    if bx >= -0.11 and -0.46 <= by <= 0.0:
        tb_x = (bx - (-0.11))
        tb_y = (by - (-0.23))
        d_top_outer = (tb_x / 0.34) ** 2 + (tb_y / 0.23) ** 2
        d_top_inner = (tb_x / 0.20) ** 2 + (tb_y / 0.12) ** 2
        if d_top_outer <= 1.0 and d_top_inner >= 1.0:
            in_B = True

    # Bottom bowl (x center: -0.11, y center: 0.22)
    # Outer radius rx=0.38, ry=0.24
    # Inner cutout rx=0.23, ry=0.13
    if bx >= -0.11 and 0.0 <= by <= 0.46:
        bb_x = (bx - (-0.11))
        bb_y = (by - 0.22)
        d_bot_outer = (bb_x / 0.38) ** 2 + (bb_y / 0.24) ** 2
        d_bot_inner = (bb_x / 0.23) ** 2 + (bb_y / 0.13) ** 2
        if d_bot_outer <= 1.0 and d_bot_inner >= 1.0:
            in_B = True

    # Middle crossbar at waist
    if -0.15 <= bx <= 0.12 and -0.06 <= by <= 0.05:
        in_B = True

    if in_B:
        # Metallic gold gradient (#b58a42 to #f2d899 to #9e752e)
        t_gold = (bx + by + 0.8) / 1.6
        t_gold = max(0.0, min(1.0, t_gold))
        if t_gold < 0.5:
            tg = t_gold * 2.0
            gold_r = 181.0 * (1.0 - tg) + 242.0 * tg
            gold_g = 138.0 * (1.0 - tg) + 216.0 * tg
            gold_b = 66.0 * (1.0 - tg) + 153.0 * tg
        else:
            tg = (t_gold - 0.5) * 2.0
            gold_r = 242.0 * (1.0 - tg) + 158.0 * tg
            gold_g = 216.0 * (1.0 - tg) + 117.0 * tg
            gold_b = 153.0 * (1.0 - tg) + 46.0 * tg
        
        r, g, b = gold_r, gold_g, gold_b

    return (r, g, b, a)

def generate_image(size, filename, is_maskable=False):
    print(f"Generating {filename} ({size}x{size})...")
    def get_pixel(x, y):
        # 2x2 supersampling for smooth antialiasing
        acc_r, acc_g, acc_b, acc_a = 0.0, 0.0, 0.0, 0.0
        offsets = [-0.25, 0.25]
        for ox in offsets:
            for oy in offsets:
                nx = ((x + 0.5 + ox) / size) * 2.0 - 1.0
                ny = ((y + 0.5 + oy) / size) * 2.0 - 1.0
                pr, pg, pb, pa = render_monogram_pixel(nx, ny, is_maskable)
                acc_r += pr
                acc_g += pg
                acc_b += pb
                acc_a += pa
        return (acc_r / 4.0, acc_g / 4.0, acc_b / 4.0, acc_a / 4.0)

    png_bytes = create_png(size, size, get_pixel)
    with open(filename, 'wb') as f:
        f.write(png_bytes)
    print(f"Saved {filename} ({len(png_bytes)} bytes)")

os.makedirs('public', exist_ok=True)
generate_image(180, 'public/apple-touch-icon.png', is_maskable=False)
generate_image(192, 'public/icon-192.png', is_maskable=False)
generate_image(512, 'public/icon-512.png', is_maskable=False)
generate_image(512, 'public/icon-maskable-512.png', is_maskable=True)
generate_image(48, 'public/favicon.png', is_maskable=False)
