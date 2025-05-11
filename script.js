let entries = [];

window.onload = function () {
  const saved = localStorage.getItem('moneyTracker');
  if (saved) {
    entries = JSON.parse(saved);
  }
  displayEntries();
};

function addEntry() {
  const person = document.getElementById('person').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if (!person || isNaN(amount)) {
    alert('Please enter valid details');
    return;
  }

  entries.push({ person, amount, type });
  saveEntries();
  displayEntries();
  resetForm();
}

function displayEntries() {
  const container = document.getElementById('entries');
  const filter = document.getElementById('filter').value;
  const search = document.getElementById('search').value.toLowerCase();

  container.innerHTML = '';
  let totalLent = 0;
  let totalBorrowed = 0;

  entries.forEach((entry, index) => {
    if ((filter !== 'all' && entry.type !== filter) ||
        !entry.person.toLowerCase().includes(search)) return;

    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <span>${entry.person} - ${entry.type} $${entry.amount}</span>
      <span>
        <button onclick="editEntry(${index})">Edit</button>
        <button onclick="deleteEntry(${index})">Delete</button>
      </span>`;
    container.appendChild(div);
  });

  // Totals
  entries.forEach(e => {
    if (e.type === 'lent') totalLent += e.amount;
    else totalBorrowed += e.amount;
  });

  document.getElementById('totals').innerText = `Total Lent: $${totalLent.toFixed(2)} | Total Borrowed: $${totalBorrowed.toFixed(2)}`;
}

function deleteEntry(index) {
  entries.splice(index, 1);
  saveEntries();
  displayEntries();
}

function editEntry(index) {
  const entry = entries[index];
  document.getElementById('person').value = entry.person;
  document.getElementById('amount').value = entry.amount;
  document.getElementById('type').value = entry.type;

  const button = document.getElementById('submitBtn');
  button.textContent = 'Update';
  button.onclick = () => updateEntry(index);
}

function updateEntry(index) {
  const person = document.getElementById('person').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if (!person || isNaN(amount)) {
    alert('Please enter valid details');
    return;
  }

  entries[index] = { person, amount, type };
  saveEntries();
  displayEntries();
  resetForm();
}

function resetForm() {
  document.getElementById('person').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('type').value = 'lent';

  const button = document.getElementById('submitBtn');
  button.textContent = 'Add';
  button.onclick = addEntry;
}

function saveEntries() {
  localStorage.setItem('moneyTracker', JSON.stringify(entries));
}

function exportData() {
  const dataStr = JSON.stringify(entries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'money-tracker-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const file = document.getElementById('importFile').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Invalid file format');
      if (confirm('Replace current data with imported data?')) {
        entries = data;
        saveEntries();
        displayEntries();
      }
    } catch (err) {
      alert('Error importing file: ' + err.message);
    }
  };
  reader.readAsText(file);
}
