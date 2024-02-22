var contractABI;
fetch('./../build/contracts/Quiz.json')
    .then(response => response.json())
    .then(data => {
        // Process the loaded JSON data
        // You can access the data properties and manipulate them as needed
        // For example, you can populate HTML elements with the data
        contractABI = data.abi;
    })
    .catch(error => {
        console.error('Error:', error);
    });

const contractAddress = "0xc3A09BE59Bd3AF3660b225D87CeE647B8d009336";