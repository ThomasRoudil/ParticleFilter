def hex_to_rgb(hex):
    return list(reversed([int(hex[i:i + 2], 16) for i in range(1, 6, 2)]))


def rgb_to_hex(rgb):
    rgb = [int(x) for x in rgb]
    return "#" + "".join(["0{0:x}".format(v) if v < 16 else
                          "{0:x}".format(v) for v in rgb])


def color_dict(gradient):
    return {"hex": [rgb_to_hex(rgb) for rgb in gradient],
            "r": [rgb[0] for rgb in gradient],
            "g": [rgb[1] for rgb in gradient],
            "b": [rgb[2] for rgb in gradient]}


def linear_gradient(start_hex, finish_hex="#FFFFFF", n=10):
    s = hex_to_rgb(start_hex)
    f = hex_to_rgb(finish_hex)
    rgb_list = [s]
    for t in range(1, n):
        curr_vector = [
            int(s[j] + (float(t) / (n - 1)) * (f[j] - s[j]))
            for j in range(3)
        ]
        rgb_list.append(curr_vector)

    return color_dict(rgb_list)



