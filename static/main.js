// static/main.js

// Dodanie nowego bloku
async function addBlock() {
    const deviceId = document.getElementById("device_id").value;
    const repairDescription = document.getElementById("repair_description").value;
    const serviceSign = document.getElementById("service_sign").value;

    if (!deviceId || !repairDescription || !serviceSign) {
        alert("Wypełnij wszystkie pola!");
        return;
    }

    showSpinner();
    try {
        const response = await fetch("/add_block", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                device_id: deviceId,
                repair_description: repairDescription,
                service_sign: serviceSign
            })
        });

        const result = await response.json();
        alert("Dodano blok: " + JSON.stringify(result, null, 2));
        await loadBlocks();
    } catch (error) {
        console.error("Błąd przy dodawaniu bloku:", error);
        alert("Nie udało się dodać bloku!");
    } finally {
        hideSpinner();
    }
}

// Pobranie całego blockchaina
async function loadBlocks() {
    showSpinner();
    try {
        const response = await fetch("/blocks");
        const blocks = await response.json();

        const tableBody = document.getElementById("blocks_table");
        if (!tableBody) return; // jeśli tabela nie istnieje na stronie

        tableBody.innerHTML = "";

        blocks.forEach(block => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${block.index}</td>
                <td>${block.device_id}</td>
                <td>${block.repair_description}</td>
                <td>${block.service_sign}</td>
                <td>${block.timestamp}</td>
                <td>${block.hash.substring(0, 15)}...</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Błąd przy ładowaniu blockchaina:", error);
    } finally {
        hideSpinner();
    }
}


let sortAscending = true; // zmienna globalna do przełączania kierunku

function sortTable(columnIndex) {
    const tableBody = document.getElementById("blocks_table");
    const rowsArray = Array.from(tableBody.querySelectorAll("tr"));

    rowsArray.sort((a, b) => {
        const aText = a.children[columnIndex].innerText;
        const bText = b.children[columnIndex].innerText;

        // Jeśli kolumna to numer (index), sortuj jako liczby
        const aNum = parseInt(aText);
        const bNum = parseInt(bText);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortAscending ? aNum - bNum : bNum - aNum;
        }

        // W przeciwnym razie sortuj jako tekst
        return sortAscending ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    // Wyczyść tabelę i dodaj posortowane wiersze
    tableBody.innerHTML = "";
    rowsArray.forEach(row => tableBody.appendChild(row));

    // Odwróć kierunek sortowania przy kolejnym kliknięciu
    sortAscending = !sortAscending;
}


// Sprawdzenie reputacji serwisu
async function checkReputation() {
    const serviceId = document.getElementById("check_service").value;

    if (!serviceId) {
        alert("Podaj nazwę serwisu!");
        return;
    }

    showSpinner();
    try {
        const response = await fetch(`/reputation/${serviceId}`);
        const data = await response.json();

        document.getElementById("reputation_result").innerText =
            `Serwis ${data.service_id} ma reputację: ${data.reputation}`;
    } catch (error) {
        console.error("Błąd przy sprawdzaniu reputacji:", error);
        alert("Nie udało się pobrać reputacji.");
    } finally {
        hideSpinner();
    }
}

// Załaduj blockchain przy starcie
window.onload = loadBlocks;

// Pokazuje spinner
function showSpinner() {
    document.getElementById("loading-spinner").classList.remove("hidden");
}

// Ukrywa spinner
function hideSpinner() {
    document.getElementById("loading-spinner").classList.add("hidden");
}

// Załaduj historię napraw
async function loadHistory() {
    showSpinner();
    try {
        const response = await fetch("/blocks");
        const blocks = await response.json();
        const tableBody = document.querySelector("#history-table tbody");
        if (!tableBody) return;

        tableBody.innerHTML = "";

        blocks.forEach(block => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td data-label="Index">${block.index}</td>
                <td data-label="Device ID">${block.device_id}</td>
                <td data-label="Repair">${block.repair_description}</td>
                <td data-label="Service">${block.service_sign}</td>
                <td data-label="Prev Hash">${block.previous_hash}</td>
                <td data-label="Hash">${block.hash}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading history:", error);
    } finally {
        hideSpinner();
    }
}

