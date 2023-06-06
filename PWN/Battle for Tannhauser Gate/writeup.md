# Battle for Tannhauser Gate

## Analysis

```
Checksec :
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
```

No canary, but everything else except for RELRO is on. We don't know about ASLR until we try, but if we have PIE there's a good chance it's on too.

Let's patch the binary with pwninit to use the given libc, then go our merry way.

```
$ gdb ./drone_interface_patched
> i functions
0x0000000000001000  _init
0x0000000000001030  free@plt
0x0000000000001040  putchar@plt
0x0000000000001050  puts@plt
0x0000000000001060  setbuf@plt
0x0000000000001070  strchr@plt
0x0000000000001080  printf@plt
0x0000000000001090  fputs@plt
0x00000000000010a0  memset@plt
0x00000000000010b0  read@plt
0x00000000000010c0  srand@plt
0x00000000000010d0  time@plt
0x00000000000010e0  malloc@plt
0x00000000000010f0  fflush@plt
0x0000000000001100  exit@plt
0x0000000000001110  getc@plt
0x0000000000001120  rand@plt
0x0000000000001130  __cxa_finalize@plt
0x0000000000001140  _start
0x0000000000001170  deregister_tm_clones
0x00000000000011a0  register_tm_clones
0x00000000000011e0  __do_global_dtors_aux
0x0000000000001220  frame_dummy
0x0000000000001229  change_sin
0x000000000000123a  send_message
0x00000000000013ae  fire_c_beam
0x000000000000143d  ask_for_sin
0x00000000000014f0  send_probe
0x00000000000015b0  fire
0x0000000000001612  menu
0x00000000000016aa  get_input
0x0000000000001731  disconnect
0x000000000000174e  connect
0x00000000000017b2  main
0x00000000000019cc  _fini
```

Quite a lot of functions here, we'll launch the program before reversing anything.

The main does usual CTF binary stuff (unbuffer stdout/stdin). It then seeds the RNG with the current timestamp and enters an infinite loop, displaying a menu and prompting the user for a choice.

```
Welcome to the X-R0Y-F3 GUI. Be responsible.
 ______________________________
|  __________________________  |
| |                          | |
| | 0) Exit                  | |
| | 1) Disconnect            | |
| | 2) Establish connection  | |
| | 3) Fire a laser beam     | |
| | 4) Change your SIN       | |
| |__________________________O |
|______________________________|
>> 
```

Let's try them while looking at a decompiler to understand how it works. Luckily, the binary isn't stripped.

The `exit` option calls a function named "disconnect" (which isn't the same as the `disconnect` option) that just exits.

The `disconnect` option checks for the existence of a `drone` pointer and a `connection_status` (both global variables). If they are both different from NULL, it does a memset(0) to the first 8 bytes pointed at by `drone`, then frees it and puts the `connection_status` variable to 0.

The `connect` option checks for the same variables. If the check passes, the `connect` function is called, which allocates 24 bytes to the `drone` global. Its first 8 bytes are set to 1, the following 8 receive a function pointer to `fire` and the last 8 to `change_sin`. The `connection_status` global is then set to 1.

With these 2 functions combined, we can trigger a use after free on the `drone` pointed memory, because the `drone` pointer is not set to NULL after being freed. Let's keep that in mind.

The `fire` option just does a random choice between 2 depressing strings to display, and nothing more.

The `change_sin` option calls `ask_for_sin`, which gets interesting. It receives 65 chars from stdin and writes them to another global variable, `SIN`, which can hold only 64. We have an off-by-one here, let's review the globals' memory layout to see how we can exploit them :

```
drone -> 8 bytes (pointer to a struct of type (int, function pointer, function pointer))
probe -> 48 bytes (not seen yet)
SIN -> 64 bytes (char[] apparently)
maximum_overdrive -> 8 bytes (not seen yet)
connection_status -> 8 bytes (int, keeps track of drone allocation)
```

The off-by-one would allow us to overwrite the LSB from `maximum_overdrive`. It's an interesting find because it does unlock a new option from the menu, allowing the user to "send a probe" using the `send_probe` function. We can in fact trigger it easily by sending 65 bytes of any value other than null or newline and the *MAXIMUM\_OVERDRIVE* mode would be activated.

Speaking of `send_probe`, this function allocates 24 bytes of memory and puts the pointer as the first 8 bytes of the `probe` global variable. It then asks for 24 bytes from the user as an "identifier" and writes them at the allocated memory.

This is interesting because we now have direct write control on allocated memory alongside with a use after free.

A first draft of an exploit would be 

- Connect
- Disconnect
- Change SIN -> send 65 bytes to activate maxmimum\_overdrive
- Send a probe -> write 8 bytes of junk then the address of a nice function or ROPchain. This address will overwrite that of either `fire` or `change_sin`, which are called from the function pointers stored in the drone's allocated memory.
- Fire a laser beam, which is going to call the function we previously wrote in the Send a probe step.

The plan is nice, but we still have some protections to defeat. We can't build a ROP to display puts' GOT address because of PIE. Fortunately, they are still some functions in the binary.

The `fire_c_beam` function fills a buffer with 32 bytes of user input, puts it in RDI then calls the `fire` function (from the drone's memory again). Given that we can control which function is `fire` in this context, this means we also can give it the parameter we want. That'll make for a nice `system("/bin/sh")`. The only problem left is to leak system's address.

This is accomplished by the last function, `send_message`. It fills a 128 bytes buffer with user input, then passes it to printf without a format string. We can send it a long chain of "%x" to leak stack variables, and thus defeat PIE. But we need to find a way to call it, and we're working with the premise that ASLR is enabled as well.

Looking back at the functions layout, there's something for us here :

```
0x0000000000001229  change_sin
0x000000000000123a  send_message
```

The `send_message` function is only a byte away from the `change_sin` function (which we can control using the use after free). ASLR doesn't randomize the last 12 bits of an address because it works on a page level, and pages are usually 4096 (0x1000) bytes wide. This means that we can overwrite only the LSB of `change_sin` to make it point to `send_message`, then call it to leak our stack addresses. If we leak enough of the stack, we can probably defeat both ASLR (with a stack address) and PIE (with a libc address).

After dumping 30 addresses from the stack, we find the libc address of `write + 16` on 4th position and the address of `main + 260` on 22th position. They seem consistent, so we'll use these.

## Exploit

Our final exploit is going to look like this :

- Connect
- Disconnect
- Change SIN -> send 65 bytes to activate maxmimum\_overdrive
- Send a probe -> write 16 bytes of junk then 0x3a (LSB of `send_message`'s address)
- Change SIN -> `send_message` is going to be called instead
  - Send a long string of repeating "%x " to leak the maximum amount of stack possible
- Find a LIBC address and a stack address in there to defeat both PIE and ASLR
- Connect again -> get fresh memory
- Disconnect again -> trigger another use after free
- Send a probe -> write 8 bytes of junk then the leaked address of `system` then the correct address of `fire_c_beam`
- Change SIN -> The function pointer was overwritten to point to `fire_c_beam`. It will ask for an ID.
  - Enter "/bin/sh"
  - The `fire` function, now replaced by system, is going to be called with /bin/sh as its parameter. Success !

We'll automate this leveraging pwntools' capabilities in the `solve.py` script.

```
$ ./solve.py 
[*] './drone_interface_patched'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled
    RUNPATH:  b'.'
[*] './libc.so.6'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[+] Starting local process './drone_interface_patched': pid 30860
[*] Switching to interactive mode
$ whoami
player
$ cat flag.txt
HACKDAY{C_B34m5_Gl1tT3r1nG_iN_Th3_D4rK}
```
