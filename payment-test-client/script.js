const handleSnapPayment = () => {
  const amount = document.getElementById('amount').value;
  const url = document.getElementById('backend_url').value;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNjI5ODk1MjM2fQ.SdNB6Vbtp0m_CoMp3SzNbgSjsbHZ9f-EXsXcMEkVhK0'
    },
    body: JSON.stringify({
      total_payment: amount,
    })
  })
  .then(response => response.json())
  .then(({ data }) => {
    window.snap.pay(data.token);
  });
}