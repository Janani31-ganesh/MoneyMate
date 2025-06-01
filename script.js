// ========== LOGIN & REGISTER ==========

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetForm = document.getElementById('resetForm');
const loginError = document.getElementById('login-error');
const resetError = document.getElementById('reset-error');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLogin = document.getElementById('backToLogin');

if (loginBtn && registerBtn && loginForm && registerForm && resetForm) {
  // Toggle Login/Register
  loginBtn.addEventListener('click', () => {
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    resetForm.style.display = 'none';
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
    loginError.textContent = '';
  });

  registerBtn.addEventListener('click', () => {
    registerForm.style.display = 'flex';
    loginForm.style.display = 'none';
    resetForm.style.display = 'none';
    registerBtn.classList.add('active');
    loginBtn.classList.remove('active');
    loginError.textContent = '';
  });

  // Show reset form
  forgotPasswordLink.addEventListener('click', () => {
    resetForm.style.display = 'flex';
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    loginBtn.classList.remove('active');
    registerBtn.classList.remove('active');
    loginError.textContent = '';
  });

  // Back to login
  backToLogin.addEventListener('click', () => {
    loginForm.style.display = 'flex';
    resetForm.style.display = 'none';
    registerForm.style.display = 'none';
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
    resetError.textContent = '';
  });

  // Login
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginError.textContent = '';

    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value.trim();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(user => user.email === email);

    if (!existingUser) {
      loginError.textContent = 'No user found. Please register.';
      return;
    }

    if (existingUser.password !== password) {
      loginError.textContent = 'Incorrect password. Please try again.';
      return;
    }

    localStorage.setItem('loggedInUser', email);
    window.location.href = 'dashboard.html'; // ✅ Opens in same tab
  });

  // Register
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = registerForm.querySelector('input[type="text"]').value.trim();
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const password = registerForm.querySelector('input[type="password"]').value.trim();
    let users = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.some(user => user.email === email)) {
      alert('Email already registered.');
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', email);
    window.location.href = 'dashboard.html';
  });

  // Reset Password
  resetForm.addEventListener('submit', function (e) {
    e.preventDefault();
    resetError.textContent = '';

    const email = resetForm.querySelector('input[type="email"]').value.trim();
    const name = resetForm.querySelector('input[type="text"]').value.trim();
    const newPassword = resetForm.querySelector('input[type="password"]').value.trim();

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.email === email && user.name === name);

    if (userIndex === -1) {
      resetError.textContent = 'User not found. Please check your name and email.';
      return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Password reset successful! You can now log in.');
    loginForm.style.display = 'flex';
    resetForm.style.display = 'none';
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
  });
}

// ========== DASHBOARD ==========

if (window.location.pathname.includes('dashboard.html')) {
  const email = localStorage.getItem('loggedInUser');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const currentUser = users.find(u => u.email === email);
  document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser?.name || 'User'}`;

  let transactions = JSON.parse(localStorage.getItem(`transactions_${email}`)) || [];
  let editIndex = null;

  function saveTransactions() {
    localStorage.setItem(`transactions_${email}`, JSON.stringify(transactions));
  }

  function renderTransactions() {
    const container = document.querySelector('.transactions');
    container.innerHTML = '';

    transactions.forEach((txn, index) => {
      const txnDiv = document.createElement('div');
      txnDiv.classList.add('transaction');

      const icon = txn.type === 'income' ? 'fa-arrow-up income' : 'fa-arrow-down expense';
      const color = txn.type === 'income' ? 'income' : 'expense';
      const sign = txn.type === 'income' ? '+' : '-';

      txnDiv.innerHTML = `
        <div class="transaction-type">
          <i class="fas ${icon}"></i>
          <div>
            <strong>${txn.description}</strong><br />
            <span class="tag">${txn.category}</span> ${txn.date}
          </div>
        </div>
        <div class="${color}">
          ${sign}₹${txn.amount.toFixed(2)}
          <i class="fas fa-edit edit-btn" data-index="${index}"></i>
          <i class="fas fa-trash delete-btn" data-index="${index}"></i>
        </div>
      `;

      container.appendChild(txnDiv);
    });

    // Attach delete/edit listeners inside render
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        transactions.splice(index, 1);
        saveTransactions();
        renderTransactions();
        updateTotals();
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        editIndex = btn.getAttribute('data-index');
        const txn = transactions[editIndex];
        document.querySelector(`input[name="type"][value="${txn.type}"]`).checked = true;
        document.getElementById('descInput').value = txn.description;
        document.getElementById('amountInput').value = txn.amount;
        document.getElementById('categoryInput').value = txn.category;
        document.getElementById('dateInput').value = txn.date;
        document.getElementById('transactionModal').style.display = 'block';
      });
    });
  }

  document.getElementById('submitTransactionBtn').addEventListener('click', () => {
    const type = document.querySelector('input[name="type"]:checked').value;
    const desc = document.getElementById('descInput').value.trim();
    const amount = parseFloat(document.getElementById('amountInput').value);
    const category = document.getElementById('categoryInput').value;
    const date = document.getElementById('dateInput').value;

    if (!desc || isNaN(amount) || !category || !date || category === 'Select a category') {
      alert('Please fill all fields correctly.');
      return;
    }

    const txnData = { type, description: desc, amount, category, date };

    if (editIndex !== null) {
      transactions[editIndex] = txnData;
      editIndex = null;
    } else {
      transactions.push(txnData);
    }

    saveTransactions();
    renderTransactions();
    updateTotals();

    document.getElementById('descInput').value = '';
    document.getElementById('amountInput').value = '';
    document.getElementById('categoryInput').value = 'Select a category';
    document.getElementById('dateInput').value = '';
    document.querySelector('input[name="type"][value="income"]').checked = true;

    document.getElementById('transactionModal').style.display = 'none';
  });

  function updateTotals() {
    let income = 0;
    let expense = 0;
    transactions.forEach(txn => {
      if (txn.type === 'income') income += txn.amount;
      else expense += txn.amount;
    });
    document.getElementById('totalIncome').textContent = `₹${income.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `₹${expense.toFixed(2)}`;
    document.getElementById('totalBalance').textContent = `₹${(income - expense).toFixed(2)}`;
  }

  document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
  });

  renderTransactions();
  updateTotals();
}
