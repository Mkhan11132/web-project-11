document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch User Data from Server
    fetch('/api/user-data')
        .then(response => response.json())
        .then(data => {
            if (data.name) {
                // Update UI with real data
                document.getElementById('userName').innerText = data.name;
                
                // For new users, these will stay 0 as set in HTML 
                // unless your database already has values for them
                if(data.total_earnings) document.getElementById('totalEarnings').innerText = data.total_earnings;
                if(data.balance) document.getElementById('availableBalance').innerText = data.balance;
                if(data.referrals) document.getElementById('totalReferrals').innerText = data.referrals;
                
                
            }
        })
        .catch(err => console.error("Error fetching user data:", err));

    // 2. Show the "Buy Plan" Pop-up automatically for everyone
    const modalElement = document.getElementById('welcomeModal');
    if (modalElement) {
        const myModal = new bootstrap.Modal(modalElement);
        myModal.show();
    }

    // 3. Referral Link Copy Functionality
    const copyBtn = document.getElementById('copyRef');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const refInput = document.getElementById('refLink');
            refInput.select();
            navigator.clipboard.writeText(refInput.value);
            alert("Referral link copied!");
        });
    }
});






