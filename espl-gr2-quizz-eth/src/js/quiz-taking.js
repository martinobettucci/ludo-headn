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

            // Function to retrieve questions from the smart contract
            // Function to retrieve questions from the smart contract
            async function getQuestions() {
                try {
                    // Get the total number of questions
                    const totalQuestions = await quizContract.methods.getQuestionCount().call();

                    // Clear the questions container
                    const questionsContainer = document.getElementById('questions');
                    questionsContainer.innerHTML = '';

                    // Loop through the question indices and retrieve the details for each question
                    for (let i = 0; i < totalQuestions; i++) {
                        const question = await quizContract.methods.getQuestionData(i).call();

                        // Create a card for the question
                        const questionCard = document.createElement('div');
                        questionCard.classList.add('card', 'mb-3');

                        // Create the card body
                        const cardBody = document.createElement('div');
                        cardBody.classList.add('card-body');

                        // Add the question text
                        const questionText = document.createElement('h5');
                        questionText.classList.add('card-title');
                        questionText.textContent = "id=" + i + ": " + question.text;
                        cardBody.appendChild(questionText);

                        // Add the options
                        for (let j = 0; j < question.options.length; j++) {
                            const option = question.options[j];

                            const optionLabel = document.createElement('label');
                            optionLabel.classList.add('form-check-label');
                            optionLabel.textContent = option;

                            const optionInput = document.createElement('input');
                            optionInput.classList.add('form-check-input');
                            optionInput.type = 'radio';
                            optionInput.name = `question-${i}-option`;
                            optionInput.value = j;

                            const optionContainer = document.createElement('div');
                            optionContainer.classList.add('form-check', 'mb-2');
                            optionContainer.appendChild(optionInput);
                            optionContainer.appendChild(optionLabel);

                            cardBody.appendChild(optionContainer);
                        }

                        // Append the card body to the card
                        questionCard.appendChild(cardBody);

                        // Append the card to the questions container
                        questionsContainer.appendChild(questionCard);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }

            // Function to submit the answers
            // Function to submit the answers
            function submitAnswers() {
                try {
                    // Get the participant's password
                    const submitterPassword = document.getElementById('submitterPassword').value;

                    // Get the selected answer for each question
                    const questionsContainer = document.getElementById('questions');
                    const questionCards = questionsContainer.getElementsByClassName('card');
                    const answers = [];

                    for (let i = 0; i < questionCards.length; i++) {
                        const questionCard = questionCards[i];

                        const optionInputs = questionCard.getElementsByTagName('input');
                        let selectedOption = null;

                        for (let j = 0; j < optionInputs.length; j++) {
                            const optionInput = optionInputs[j];

                            if (optionInput.checked) {
                                selectedOption = optionInput.value;
                                break;
                            }
                        }

                        answers.push(selectedOption);
                    }

                    // Encrypt the answers using the participant's password
                    const encryptedAnswers = answers.map((answer) => {
                        return CryptoJS.AES.encrypt(answer, submitterPassword).toString();
                    });

                    // Call the 'submitAnswer' function of the contract for each answer
                    for (let i = 0; i < encryptedAnswers.length; i++) {
                        const questionId = i;
                        const encryptedSelectedOption = encryptedAnswers[i];

                        // Call the 'submitAnswer' function of the contract
                        quizContract.methods.submitAnswer(questionId, encryptedSelectedOption).send({ from: accounts[0] })
                            .on('transactionHash', (hash) => {
                                // Handle transaction hash
                                console.log('Transaction Hash:', hash);
                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                // Handle confirmation
                                console.log('Confirmation:', confirmationNumber);
                            })
                            .on('error', (error) => {
                                // Handle error
                                console.error('Error:', error);
                            });
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }

            // Call the getQuestions function when the page loads
            await getQuestions();

            // Bind the submitAnswers function to the submit button click event
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.addEventListener('click', function () {
                submitAnswers();
            });

        } catch (error) {
            // User denied account access
            console.error(error);
        }
    } else {
        console.log('Non-Ethereum browser detected. Consider trying MetaMask!');
    }
});
