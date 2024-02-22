// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

contract Quiz {
    struct Question {
        string text;
        string[] options;
        string encryptedCorrectAnswer;
        address author;
    }

    Question[] public questions;
    mapping(address => mapping(uint => string)) public answers;

    event QuestionSubmitted(uint questionId, address author);
    event AnswerSubmitted(uint questionId, address participant);

    function submitQuestion(string memory _text, string[] memory _options, string memory _encryptedCorrectAnswer) public {
        questions.push(Question({
            text: _text,
            options: _options,
            encryptedCorrectAnswer: _encryptedCorrectAnswer,
            author: msg.sender
        }));
        emit QuestionSubmitted(questions.length - 1, msg.sender);
    }

    function submitAnswer(uint _questionId, string memory _encryptedSelectedOption) public {
        require(_questionId < questions.length, "Invalid question ID");
        answers[msg.sender][_questionId] = _encryptedSelectedOption;
        emit AnswerSubmitted(_questionId, msg.sender);
    }

    // Returning the number of questions
    function getQuestionCount() external view returns(uint count) {
        return questions.length;
    }

    // Returning the complete structure of a question
    function getQuestionData(uint index) external view returns (Question memory)
    {
        Question storage data_package = questions[index];
        return data_package;
    }

    // This function should ideally be off-chain since it requires decryption
    // Just returning the encrypted values for now
    function getEncryptedAnswer(uint _questionId, address _participant) public view returns (string memory, string memory) {
        require(_questionId < questions.length, "Invalid question ID");
        string memory participantAnswer = answers[_participant][_questionId];
        string memory correctAnswer = questions[_questionId].encryptedCorrectAnswer;
        return (correctAnswer, participantAnswer);
    }
}
