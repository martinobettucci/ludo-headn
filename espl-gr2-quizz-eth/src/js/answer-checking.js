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

            const checkAnswersBtn = document.getElementById('checkAnswersBtn');
            const questionIdInput = document.getElementById('questionId');
            const quizCreatorPasswordInput = document.getElementById('quizCreatorPassword');
            const participantPasswordInput = document.getElementById('participantPassword');
            const resultTableBody = document.querySelector('#resultTable tbody');

            checkAnswersBtn.addEventListener('click', async () => {
                const questionId = questionIdInput.value;
                const quizCreatorPassword = quizCreatorPasswordInput.value;
                const participantPassword = participantPasswordInput.value;

                const question = await quizContract.methods.getQuestionData(questionId).call();

                // Call the 'getEncryptedAnswer' function of the contract
                quizContract.methods.getEncryptedAnswer(questionId, accounts[0]).call({ from: accounts[0] })
                    .then((data) => {
                        // Extract answers from the data
                        const correctAnswer = data[0];
                        const participantAnswer = data[1];

                        console.log(correctAnswer)
                        console.log(participantAnswer)
                        console.log(quizCreatorPassword)
                        console.log(participantPassword)

                        // Decrypt the answers using bcrypt or other appropriate method
                        const decryptedCorrectAnswer = decryptAnswer(correctAnswer, quizCreatorPassword);
                        const decryptedParticipantAnswer = decryptAnswer(participantAnswer, participantPassword);

                        // Clear previous results
                        resultTableBody.innerHTML = '';

                        // Display the results in the table
                        const row = document.createElement('tr');
                        const participantCell = document.createElement('td');
                        const correctAnswerCell = document.createElement('td');
                        const participantAnswerCell = document.createElement('td');
                        participantCell.textContent = accounts[0]; // Display the participant's address
                        correctAnswerCell.textContent = decryptedCorrectAnswer;
                        participantAnswerCell.textContent = question.options[decryptedParticipantAnswer];
                        row.appendChild(participantCell);
                        row.appendChild(correctAnswerCell);
                        row.appendChild(participantAnswerCell);
                        resultTableBody.appendChild(row);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            });

            // Decrypt the answer using bcrypt or other appropriate method
            function decryptAnswer(encryptedAnswer, password) {
                // Replace this with your decryption logic using bcrypt or other appropriate method
                const decryptedAnswer = CryptoJS.AES.decrypt(encryptedAnswer, password).toString(CryptoJS.enc.Utf8);

                return decryptedAnswer;
            }


        } catch (error) {
            // User denied account access
            console.error(error);
        }
    } else {
        console.log('Non-Ethereum browser detected. Consider trying MetaMask!');
    }
});
