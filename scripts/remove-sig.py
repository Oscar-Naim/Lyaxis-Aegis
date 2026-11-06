import struct
import sys
import os

def remove_signature(exe_path):
    with open(exe_path, "r+b") as f:
        # DOS header
        f.seek(0x3C)
        pe_offset = struct.unpack("<I", f.read(4))[0]
        
        # PE signature check
        f.seek(pe_offset)
        magic = f.read(4)
        if magic != b"PE\x00\x00":
            raise ValueError("Not a valid PE file")
            
        # Optional header starts after COFF header (20 bytes)
        opt_offset = pe_offset + 24
        f.seek(opt_offset)
        opt_magic = struct.unpack("<H", f.read(2))[0]
        
        if opt_magic == 0x20b:  # PE32+ (64-bit)
            sec_dir_offset = opt_offset + 112 + 4 * 8
        elif opt_magic == 0x10b: # PE32 (32-bit)
            sec_dir_offset = opt_offset + 96 + 4 * 8
        else:
            raise ValueError(f"Unknown optional header magic: {hex(opt_magic)}")
            
        f.seek(sec_dir_offset)
        cert_addr, cert_size = struct.unpack("<II", f.read(8))
        print(f"[*] Certificate Table at offset {cert_addr}, size {cert_size}")
        
        if cert_addr != 0 and cert_size != 0:
            # Zero out the security directory entry
            f.seek(sec_dir_offset)
            f.write(struct.pack("<II", 0, 0))
            
            # Truncate at cert_addr if cert is at the end of the file
            f.seek(0, os.SEEK_END)
            file_size = f.tell()
            if cert_addr + cert_size == file_size:
                f.truncate(cert_addr)
                print(f"[+] Truncated file from {file_size} to {cert_addr} bytes (removed signature).")
            else:
                print(f"[+] Zeroed certificate table entry without truncation.")
        else:
            print("[*] Binary already unsigned.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove-sig.py <file.exe>")
        sys.exit(1)
    remove_signature(sys.argv[1])
