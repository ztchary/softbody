import json
size = int(input("Size: "))
mass = float(input("Mass: "))
dist = float(input("Distance: "))
stif = float(input("Stiffness: "))
damp = float(input("Dampening: "))
colo = "#" + input("Hex Color: ")

particles = []
for i in range(size):
	for j in range(size):
		particles.append([dist*j, dist*i, mass])


springs = []
for i in range(size):
	for j in range(size-1):
		a = i*size+j
		b = i*size+j+1
		c = j*size+i
		d = j*size+i+size
		springs.append([a, b, stif, dist, damp])
		springs.append([c, d, stif, dist, damp])

for i in range(size-1):
	for j in range(size-1):
		tl = i*size+j
		tr = tl + 1
		bl = tl + size
		br = bl + 1
		springs.append([tl, br, stif, dist*1.41, damp])
		springs.append([tr, bl, stif, dist*1.41, damp])

perimeter = [i for i in range(size)] + [i+size-1 for i in range(size, size*size-size, size)] + [size*size-1-i for i in range(size)] + [size*size-i-size for i in range(size, size*size-size, size)]

print(f"{len(particles)} particles and {len(springs)} springs created.")
print(f"{len(perimeter)} perimeter vertecies")
print(f"Saving")

with open("../shapes/"+input("Name: ")+".json", 'w') as f:
	f.write(json.dumps({"particles":particles, "springs":springs, "perimeter":perimeter, "color":colo}))

print(f"Done!")