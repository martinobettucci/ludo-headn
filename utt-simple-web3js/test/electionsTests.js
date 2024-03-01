const Election = artifacts.require("Election");

contract("Election", (accounts) => {
    let electionInstance;

    beforeEach(async () => {
        // Deploy a new contract instance before each test
        electionInstance = await Election.new();
    });

    describe("Deployment", () => {
        it("initializes with zero candidates", async () => {
            const count = await electionInstance.candidatesCount();
            assert.equal(count.toNumber(), 0, "initial count is not 0");
        });
    });

    describe("Functionality", () => {
        it("allows owner to add a candidate", async () => {
            await electionInstance.addCandidate("Alice", {from: accounts[0]});
            const count = await electionInstance.candidatesCount();
            assert.equal(count.toNumber(), 1, "candidate wasn't added");
        });

        it("prevents non-owners from adding candidates", async () => {
            try {
                await electionInstance.addCandidate("Bob", {from: accounts[1]});
                assert.fail("non-owner was able to add a candidate");
            } catch (error) {
                assert(error.toString().includes("revert"), "error message must contain revert");
            }
        });

        it("prevents voting before voting is officially opened", async () => {
            await electionInstance.addCandidate("Alice", {from: accounts[0]});
            try {
                await electionInstance.vote(1, {from: accounts[1]});
                assert.fail("expected error was not received");
            } catch (error) {
                assert(error.toString().includes("Voting is closed"), "expected voting to be closed error, but received another error");
            }
        });

        it("opens voting by renouncing ownership", async () => {
            await electionInstance.renounceOwnership({from: accounts[0]});
            // After renouncing ownership, the owner should be the zero address
            const currentOwner = await electionInstance.owner();
            assert.equal(currentOwner, '0x0000000000000000000000000000000000000000', "ownership not correctly renounced");
        });

        it("prevents adding candidates after voting is opened", async () => {
            await electionInstance.addCandidate("Alice", {from: accounts[0]});
            await electionInstance.renounceOwnership({from: accounts[0]});
            try {
                await electionInstance.addCandidate("Bob", {from: accounts[0]});
                assert.fail("expected error was not received");
            } catch (error) {
                assert(error.toString().includes("Voting is open"), "expected 'Voting is open' error, but received another error");
            }
        });

        it("allows a voter to cast a vote after voting is opened", async () => {
            await electionInstance.addCandidate("Alice", {from: accounts[0]});
            await electionInstance.renounceOwnership({from: accounts[0]});
            await electionInstance.vote(1, {from: accounts[2]});
            const candidate = await electionInstance.candidates(1);
            assert.equal(candidate.voteCount.toNumber(), 1, "vote count didn't increase");
        });

        it("prevents double voting", async () => {
            try {
                await electionInstance.addCandidate("Alice", {from: accounts[0]});
                await electionInstance.renounceOwnership({from: accounts[0]});
                await electionInstance.vote(1, {from: accounts[2]});
                await electionInstance.vote(1, {from: accounts[2]});
                assert.fail("was able to vote twice");
            } catch (error) {
                assert(error.toString().includes("revert Already voted"), "should revert due to double voting");
            }
        });
    });
});
