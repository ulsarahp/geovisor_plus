import pathlib

W = pathlib.Path("D:/CONANP/GITHUB/geovisor_plus")
p = W/"assets"/"js"/"huracanes.js"
t = p.read_text(encoding="utf-8")
lines = t.splitlines()

# Find the new renderPanel's closing brace (line with just "}" after "el.innerHTML = html;")
new_end = None
for i, l in enumerate(lines):
    if "el.innerHTML = html;" in l and i > 400:
        new_end = i + 1  # the "}" on the next line
        break

# Find orphaned old code (starts with "var cls" after new_end)
old_start = None
for i in range(new_end + 1, len(lines)):
    if "var cls" in lines[i]:
        old_start = i
        break

# Find where the orphan ends (the "// INIT" comment or "function initHuracanes")
old_end = None
for i in range(old_start, len(lines)):
    if "function initHuracanes" in lines[i] or "// INIT" in lines[i]:
        old_end = i
        break

print(f"new renderPanel ends at line {new_end+1}: '{lines[new_end][:30]}'")
print(f"orphan starts at line {old_start+1}: '{lines[old_start][:40]}'")
print(f"orphan ends before line {old_end+1}: '{lines[old_end][:40]}'")

if old_start and old_end and old_end > old_start:
    removed = old_end - old_start
    new_lines = lines[:old_start] + lines[old_end:]
    t = "\n".join(new_lines)
    p.write_text(t, encoding="utf-8")
    print(f"Removed {removed} orphaned lines ({old_start+1} to {old_end})")
    print(f"huracanes.js: {len(t)} chars, {len(new_lines)} lines")
else:
    print("ERROR: could not determine orphan boundaries")
