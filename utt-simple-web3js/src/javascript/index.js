const {Web3} = require('web3')

window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);

        try {
            // Request account access if needed
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            // Accounts now exposed


            let electionContract;
            try {
                const abiResponse = await fetch('/abi/Election.json');
                if (!abiResponse.ok) {
                    throw new Error(`HTTP error! status: ${abiResponse.status}`);
                }
                const abiData = await abiResponse.json();

                const addressResponse = await fetch('/abi/ElectionAddress.txt');
                if (!addressResponse.ok) {
                    throw new Error(`HTTP error! status: ${addressResponse.status}`);
                }
                const addressData = await addressResponse.json();

                electionContract = new web3.eth.Contract(abiData.abi, addressData.address);
            } catch (error) {
                console.error('Error:', error);
            }

            let existingCandidates = {};
            const isOwner = await electionContract.methods.owner().call();
            const isVotingOpen = isOwner === '0x0000000000000000000000000000000000000000';

            // Afficher ou masquer le bouton d'ouverture des votes en fonction de l'état des votes
            document.getElementById("voteOpen").style.display = isVotingOpen ? "none" : "block";

            // Afficher ou masquer la liste de vote en fonction de l'état des votes
            document.getElementById("addVote").parentElement.style.display = isVotingOpen ? "block" : "none";

            // Afficher les candidats déjà présents dans le smart contract
            let candidatesCount = await electionContract.methods.candidatesCount().call();
            for (let i = 1; i <= candidatesCount; i++) {
                let candidate = await electionContract.methods.candidates(i).call();
                // Populate the table with candidates
                const candidatesResults = document.querySelector("#candidatesResults");
                const candidatesSelect = document.querySelector("#candidatesSelect");
                const option = document.createElement("option");
                option.value = candidate.id;
                option.text = candidate.name;
                candidatesSelect.appendChild(option);
                candidatesResults.innerHTML += `<tr><th scope="row">${candidate.id}</th><td>${candidate.name}</td><td id="votes${candidate.id}">${candidate.voteCount}</td></tr>`;

                // Sinon, ajouter le candidat à l'objet des candidats existants
                existingCandidates[candidate.id] = candidate.name;
            }

            // Handle add candidate button click
            document.querySelector("#addCandidate").addEventListener("click", async () => {
                const candidateName = document.querySelector("#candidateName").value;
                await electionContract.methods.addCandidate(candidateName).send({from: accounts[0]});
            });

            // Handle vote button click
            document.querySelector("#addVote").addEventListener("click", async () => {
                const candidateId = document.querySelector("#candidatesSelect").value;
                await electionContract.methods.vote(candidateId).send({from: accounts[0]});
            });

            // Handle open voting button click
            document.querySelector("#voteOpen").addEventListener("click", async () => {
                await electionContract.methods.renounceOwnership().send({from: accounts[0]});
            });

            document.getElementById("loader").style.display = "none";
            document.getElementById("content").style.display = "block";

            // Listen to Vote events and refresh the page
            electionContract.events.Voted({}).on('data', (event) => {
                console.log('Someone have voted!')
                let _candidate = event.returnValues['_candidate'];
                let _votes = event.returnValues['_votes'];

                // Updates dynamically the candidate counter
                candidateVotesCounter = document.querySelector(`#votes${_candidate}`);
                candidateVotesCounter.innerHTML = `${_votes}`
            });
            // New candidate
            electionContract.events.NewCandidate({}).on('data', async (event) => {
                const candidateName = event.returnValues._candidate;
                const newCandidateId = event.returnValues._candidateId;

                // Vérifier si le candidat existe déjà
                if (existingCandidates[newCandidateId]) {
                    console.log(`Candidate with ID ${newCandidateId} already exists.`);
                    return; // Stopper l'exécution si le candidat existe déjà
                }

                // Sinon, ajouter le candidat à l'objet des candidats existants
                existingCandidates[newCandidateId] = candidateName;

                // Ajoutez le nouveau candidat à la liste des candidats dans l'interface utilisateur
                const candidatesResults = document.querySelector("#candidatesResults");
                const candidatesSelect = document.querySelector("#candidatesSelect");

                // Ajouter au tableau des résultats
                candidatesResults.innerHTML += `<tr><th scope="row">${newCandidateId}</th><td>${candidateName}</td><td id="votes${newCandidateId}">0</td></tr>`;

                // Ajouter à la liste déroulante pour le vote
                const option = document.createElement("option");
                option.value = newCandidateId;
                option.text = candidateName;
                candidatesSelect.appendChild(option);
            });
            // New candidate
            electionContract.events.VotingIsOpen({}).on('data', () => {
                document.getElementById("voteOpen").style.display = "none";
                document.getElementById("addVote").parentElement.style.display = "block";
            });

        } catch (error) {
            // User denied account access
            console.error(error);
        }
    } else {
        let msgErrorWallet = 'Non-Ethereum browser detected. Consider trying MetaMask!';
        console.log(msgErrorWallet);
        alert(msgErrorWallet)
    }
});
