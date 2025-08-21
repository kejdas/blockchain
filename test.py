from blockchain import Blockchain

# Tworzymy instancję blockchaina
bc = Blockchain()

# Dodajemy pierwszy blok
block = bc.add_block("31245", "Wymiana dysku SSD 2TB", "SerwisB")

# Wyświetlamy dodany blok
print("Dodano blok:", block.to_dict())

# Sprawdzamy, czy cały blockchain jest poprawny
print("Czy blockchain poprawny?", bc.verify_chain())

