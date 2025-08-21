import json
import hashlib
from datetime import datetime
from pathlib import Path

BLOCKS_FILE = Path("data/blocks.json")  # relatywna ścieżka do pliku JSON

class Block:
    def __init__(self, index, device_id, repair_description, service_sign, timestamp, previous_hash=""):
        self.index = index
        self.device_id = device_id
        self.repair_description = repair_description
        self.service_sign = service_sign
        self.timestamp = timestamp if isinstance(timestamp, datetime) else datetime.fromisoformat(timestamp)
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = f'{self.index}{self.previous_hash}{self.timestamp.isoformat()}{self.device_id}{self.repair_description}{self.service_sign}'
        return hashlib.sha256(block_string.encode()).hexdigest()

    def to_dict(self):
        return {
            "index": self.index,
            "device_id": self.device_id,
            "repair_description": self.repair_description,
            "service_sign": self.service_sign,
            "timestamp": self.timestamp.isoformat(),
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }

class Blockchain:
    def __init__(self):
        self.chain = []
        self.load_chain()

    def load_chain(self):
        if BLOCKS_FILE.exists():
            with open(BLOCKS_FILE, 'r') as file:
                try:
                    blocks_data = json.load(file)
                except json.JSONDecodeError:
                    blocks_data = []
                for block_data in blocks_data:
                    # zachowujemy hash zapisany w JSON
                    block_hash = block_data.pop("hash", None)
                    block = Block(**block_data)
                    if block_hash:
                        block.hash = block_hash
                    self.chain.append(block)

    def add_block(self, device_id, repair_description, service_sign):
        index = len(self.chain)
        previous_hash = self.chain[-1].hash if self.chain else "0"
        timestamp = datetime.now()
        new_block = Block(index, device_id, repair_description, service_sign, timestamp, previous_hash)
        self.chain.append(new_block)
        self.save_chain()
        return new_block  # zwracamy blok, żeby można go było wyświetlić

    def save_chain(self):
        BLOCKS_FILE.parent.mkdir(exist_ok=True)  # tworzymy folder data, jeśli nie istnieje
        with open(BLOCKS_FILE, 'w') as file:
            json.dump([block.to_dict() for block in self.chain], file, indent=4)

    def verify_chain(self):
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            if current_block.previous_hash != previous_block.hash:
                return False
            if current_block.hash != current_block.calculate_hash():
                return False
        return True

