export const calculateResult = (test, questionsMap, submittedAnswers) => {
  let totalScore = 0;
  let maxPossibleMarks = 0;
  const processedAnswers = [];

  for (const q of test.questions) {
    const questionIdStr = q._id ? q._id.toString() : q.toString();
    const fullQuestion = questionsMap[questionIdStr] || q;
    const questionMarks = fullQuestion.marks || 1;
    maxPossibleMarks += questionMarks;

    const userAnsObj = submittedAnswers.find(
      a => a.questionId.toString() === questionIdStr
    );
    const selectedOption = userAnsObj ? userAnsObj.selectedOption : '';

    let isCorrect = false;
    let marksObtained = 0;

    if (selectedOption && selectedOption === fullQuestion.correctAnswer) {
      isCorrect = true;
      marksObtained = questionMarks;
      totalScore += marksObtained;
    } else if (selectedOption && test.negativeMarking > 0) {
      isCorrect = false;
      marksObtained = -Math.abs(test.negativeMarking);
      totalScore += marksObtained;
    }

    processedAnswers.push({
      questionId: questionIdStr,
      selectedOption,
      isCorrect,
      marksObtained
    });
  }

  // Ensure total score is not below 0
  totalScore = Math.max(0, totalScore);
  const percentage = maxPossibleMarks > 0 ? (totalScore / maxPossibleMarks) * 100 : 0;
  const status = percentage >= (test.passingMarks || 40) ? 'Passed' : 'Failed';

  return {
    answers: processedAnswers,
    totalScore: Math.round(totalScore * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    status
  };
};
