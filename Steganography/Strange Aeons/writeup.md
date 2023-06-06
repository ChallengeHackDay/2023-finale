# Strange Aeons Writeup

The PNG file is corrupted, as shown by pngcheck :

```
$ pngcheck strange-aeons.png
strange-aeons.png  zlib: inflate error = -3 (data error)
ERROR: strange-aeons.png
```

The error seems to lie in the zlib stream, which is stored in the IDAT chunks (as per http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html).
Opening the PNG file with an inspector such as https://www.nayuki.io/page/png-file-chunk-inspector shows 1 IHDR, 1 eXIf, 5 IDAT and 1 IEND chunks. They all seem to be well-formed. That being said, all IDAT chunks have the same length except for the second one. While technically the IDAT chunks can be of any length, the shorter one is usually the last. This would indicate that the IDAT chunks have been shuffled, especially given the hint from the brief that "the blackhole messed up the asynchronous transmission".

Let's write a little `solve.py` script that is going to create all possible permutations (which is 5! = 120) of the IDAT chunks. It would've made sense to keep the shortest one as the last and only compute 4! = 24 for the other four. That said, 120 is not much, let's be thorough. We'll then run pngcheck on the 120 generated files and hope for a positive result.

```
$ ./solve.py
$ pngcheck *.png | grep OK
OK: solved_70.png (991x991, 24-bit RGB, non-interlaced, 51.2%).
```

We have a valid file, but we don't have any flag in there. The brief was talking about "hiding confidential information the usual way", so we run some well-known tools to investigate further. Zsteg finally finds something:

```
$ zsteg solved_70.png 
imagedata           .. file: a.out SunOS mc68020 pure executable
b1,b,lsb,xy         .. file: ATSC A/52 aka AC-3 aka Dolby Digital stream, 48 kHz,, karaoke 3 front/0 rear, LFE on,
b2,r,lsb,xy         .. text: "b^Vfjn_sFvvB_"
b2,b,lsb,xy         .. text: "e55'p%%'"
b2,rgb,lsb,xy       .. text: "The suspicious ship uses HACKDAY{B3Tw33n_Ch4RyBd15_4nD_5Cy11A!} as a radio identifier. Also please send help, we are drawn towards the blackhole.\n"
b2,bgr,lsb,xy       .. text: "ER6qB6unf"
b4,r,lsb,xy         .. text: "VfRvUwSCP"
b4,r,msb,xy         .. text: ",,*&\",JJ"
b4,g,lsb,xy         .. text: "A%1uF%W1tuFtEuXeDEuEVDqttetdDuetSyeTTtTD[%TeTuU%4eEeFe"
b4,b,lsb,xy         .. text: "1Ds44fDTDWVfHSSw"
b4,b,msb,xy         .. text: "fjiJfblff"
b4,rgb,msb,xy       .. text: "Inh)R J&h"
b4,bgr,msb,xy       .. text: "jNiX\"* FjX"
```

We have our flag : `HACKDAY{B3Tw33n_Ch4RyBd15_4nD_5Cy11A!}`
