from flask import Flask, request, jsonify
from blockchain import Blockchain
from flask import render_template

app = Flask(__name__)
blockchain = Blockchain()

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/add_block', methods=['POST'])
def add_block():
    data = request.get_json()
    required_fields = ['device_id', 'repair_description', 'service_sign']


    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400


    new_block = blockchain.add_block(
        device_id=data['device_id'],
        repair_description=data['repair_description'],
        service_sign=data['service_sign']
    )

    return jsonify(new_block.to_dict()), 201

@app.route('/reputation/<service_id>', methods=['GET'])
def get_reputation(service_id):
    reputation = sum(1 for block in blockchain.chain if block.service_sign == service_id)
    return jsonify({"service_id": service_id, "reputation": reputation}), 200

@app.route('/blocks', methods=['GET'])
def get_blocks():
    blocks = [block.to_dict() for block in blockchain.chain]
    return jsonify(blocks), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
