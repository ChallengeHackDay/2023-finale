#!/usr/bin/env python3

from itertools import permutations

with open("strange-aeons.png", "rb") as f:
    data = f.read()

# get chunks offsets from https://www.nayuki.io/page/png-file-chunk-inspector

magic = data[:8]
head = data[8:8+13+12]
exif = data[33:33+214+12]
i1 = data[259:259+12+290000]
i2 = data[290271:290271+12+278411]
i3 = data[568694:568694+12+290000]
i4 = data[858706:858706+12+290000]
i5 = data[1148718:1148718+12+290000]
end = data[1438730:]

# create all possible permutations of the IDAT chunks

perms = permutations([i1, i2, i3, i4, i5])
i = 0

for p in perms:
    # write each one of them in a separate file
    with open(f"solved_{i}.png", "wb") as outfile:
        outfile.write(magic + head + exif + p[0] + p[1] + p[2] + p[3] + p[4] + end)
    i += 1
