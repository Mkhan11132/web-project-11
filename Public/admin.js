// ==========================================
// 1. LOAD USERS
// ==========================================
async function loadUsers() {
  const res = await fetch('/admin/users');
  const users = await res.json();
  const table = document.getElementById('usersTable');
  
  table.innerHTML = ""; // Clear table before loading

  users.forEach(user => {
    let statusBadge = user.status === 'active' ? 'bg-success' : 'bg-danger';
    
    table.innerHTML += `
      <tr>
        <td class="text-muted fw-bold">#${user.id}</td>
        <td class="fw-bold">${user.name}</td>
        <td>${user.email}</td>
        <td class="text-success fw-bold">PKR ${user.balance || 0}</td>
        <td><span class="badge ${statusBadge}">${user.status.toUpperCase()}</span></td>
        <td>
          ${user.status !== 'active' ? 
            `<button class="btn btn-sm btn-success shadow-sm me-1" onclick="activateUser(${user.id})"><i class="fa-solid fa-check me-1"></i>Activate</button>` : ''
          }
          <button class="btn btn-sm btn-danger shadow-sm" onclick="banUser(${user.id})"><i class="fa-solid fa-ban me-1"></i>Ban</button>
        </td>
      </tr>
    `;
  });
}

// ==========================================
// 2. LOAD PAYMENTS
// ==========================================
async function loadPayments() {
  const res = await fetch('/admin/payments');
  const payments = await res.json();
  const table = document.getElementById('paymentsTable');
  
  table.innerHTML = ""; // Clear table before loading

  payments.forEach(p => {
    let statusBadge = p.status === 'approved' ? 'bg-success' : 'bg-warning text-dark';
    
    table.innerHTML += `
      <tr>
        <td class="fw-bold">${p.name}</td>
        <td>${p.email}</td>
        <td><span class="badge bg-light text-dark border">${p.trx_id || 'N/A'}</span></td>
        <td class="text-primary fw-bold">PKR ${p.amount}</td>
        <td>
          ${p.slip ? `<a href="/uploads/${p.slip}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fa-solid fa-image me-1"></i>View</a>` : '<span class="text-muted small">No Slip</span>'}
        </td>
        <td><span class="badge ${statusBadge}">${p.status.toUpperCase()}</span></td>
        <td class="small text-muted">${new Date(p.created_at).toLocaleDateString()}</td>
        <td>
          ${p.status === 'pending' ? `
            <button class="btn btn-sm btn-success shadow-sm me-1" onclick="approvePayment(${p.id})"><i class="fa-solid fa-check"></i></button>
            <button class="btn btn-sm btn-danger shadow-sm" onclick="rejectPayment(${p.id})"><i class="fa-solid fa-xmark"></i></button>
          ` : `<span class="text-muted small"><i class="fa-solid fa-check-double text-success"></i> Processed</span>`}
        </td>
      </tr>
    `;
  });
}

// ==========================================
// 3. ACTION FUNCTIONS (The Core Fix)
// ==========================================

// Approve Payment
async function approvePayment(id) {
  await fetch('/admin/approve-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId: id }) // The ID is now correctly passed!
  });
  location.reload();
}

// Reject Payment
async function rejectPayment(id) {
  await fetch('/admin/reject-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId: id })
  });
  location.reload();
}

// Ban User
async function banUser(id) {
  await fetch('/admin/ban-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  location.reload();
}

// Activate User
async function activateUser(id) {
  await fetch('/admin/activate-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  location.reload();
}

// Initialize Page
loadUsers();
loadPayments();


async function loadWithdrawals() {
  const res = await fetch('/admin/withdrawals');
  const withdrawals = await res.json();
  const table = document.getElementById('withdrawalsTable');
  
  table.innerHTML = ""; // Clear table before loading

  withdrawals.forEach(w => {
    // Set badge color based on status
    let statusBadge = w.status === 'approved' ? 'bg-success' : (w.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark');
    
    table.innerHTML += `
      <tr>
        <td class="text-muted fw-bold">#${w.id}</td>
        <td class="fw-bold">${w.name}</td>
        <td><span class="badge bg-light text-dark border">${w.payment_method}</span></td>
        <td class="text-muted">${w.account_number}</td>
        <td class="text-danger fw-bold">PKR ${w.amount}</td>
        <td><span class="badge ${statusBadge}">${w.status.toUpperCase()}</span></td>
        <td>
          ${w.status === 'pending' ? `
            <button class="btn btn-sm btn-success shadow-sm me-1" onclick="approveWithdrawal(${w.id})"><i class="fa-solid fa-check"></i></button>
            <button class="btn btn-sm btn-danger shadow-sm" onclick="rejectWithdrawal(${w.id})"><i class="fa-solid fa-xmark"></i></button>
          ` : `<span class="text-muted small"><i class="fa-solid fa-check-double text-success"></i> Processed</span>`}
        </td>
      </tr>
    `;
  });
}

// Approve Withdrawal Function
async function approveWithdrawal(id) {
  await fetch('/admin/approve-withdrawal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  location.reload();
}

// Reject Withdrawal Function
async function rejectWithdrawal(id) {
  const confirmReject = confirm("Are you sure you want to reject this withdrawal? The money will be refunded to the user.");
  if(confirmReject) {
    await fetch('/admin/reject-withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    location.reload();
  }
}


loadWithdrawals();