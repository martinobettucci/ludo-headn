window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);

        try {
            // Request account access if needed
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed

            // Create an instance of the contract
            const quizContract = new web3.eth.Contract(contractABI, contractAddress);

            // Handle the form submission
            const questionForm = document.getElementById('questionForm');
            questionForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const questionText = document.getElementById('questionText').value;
                const answerOptions = document.getElementById('answerOptions').value.split('\n');
                const correctAnswerLineNumber = document.getElementById('correctAnswer').value;
                const submitterPassword = document.getElementById('submitterPassword').value;

                submitQuestion(questionText, answerOptions, correctAnswerLineNumber, submitterPassword);
            });

            // Submit a question to the smart contract
            function submitQuestion(questionText, answerOptions, correctAnswerLineNumber, submitterPassword) {
                // Encrypt the correct answer using AES encryption
                const encryptedCorrectAnswer = CryptoJS.AES.encrypt(answerOptions[correctAnswerLineNumber - 1], submitterPassword).toString();

                // Call the 'submitQuestion' function of the contract
                quizContract.methods.submitQuestion(questionText, answerOptions, encryptedCorrectAnswer)
                    .send({ from: accounts[0] })
                    .on('transactionHash', (hash) => {
                        // Handle transaction hash
                        console.log('Transaction Hash:', hash);
                    })
                    .on('confirmation', (confirmationNumber, receipt) => {
                        // Handle confirmation
                        console.log('Confirmation:', confirmationNumber);
                        // Clear the form fields after successful submission
                        questionForm.reset();
                    })
                    .on('error', (error) => {
                        // Handle error
                        console.error('Error:', error);
                    });
            }

        } catch (error) {
            // User denied account access
            console.error(error);
        }
    } else {
        console.log('Non-Ethereum browser detected. Consider trying MetaMask!');
    }
});
