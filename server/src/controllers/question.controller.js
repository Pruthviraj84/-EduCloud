import { Question } from '../models/Question.js';
import { Test } from '../models/Test.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const addQuestionToTest = async (req, res, next) => {
  try {
    const { testId, questionText, options, correctAnswer, explanation, marks, difficulty, source } = req.body;

    if (!testId || !questionText || !options || !correctAnswer) {
      throw new ApiError(400, 'Test ID, question text, options, and correct answer are required');
    }

    const test = await Test.findById(testId);
    if (!test) {
      throw new ApiError(404, 'Test not found');
    }

    const question = await Question.create({
      testId,
      collegeId: test.collegeId,
      questionText,
      options,
      correctAnswer,
      explanation: explanation || '',
      marks: marks || 1,
      difficulty: difficulty || 'Medium',
      source: source || 'Manual'
    });

    test.questions.push(question._id);
    await test.save();

    res.status(201).json(new ApiResponse(201, question, 'Question added successfully'));
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) {
      throw new ApiError(404, 'Test not found');
    }

    // Strict Tenant Isolation check
    if (req.user.role === 'Student' && test.collegeId.toString() !== req.user.collegeId.toString()) {
      throw new ApiError(403, 'Tenant Isolation Error: Access denied to questions of other colleges');
    }

    const questions = await Question.find({ testId: req.params.testId });

    // If Student is requesting questions for active test taking, hide correct answer & explanation
    if (req.user.role === 'Student' && req.query.mode === 'take') {
      const sanitizedQuestions = questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
        difficulty: q.difficulty
      }));
      return res.status(200).json(new ApiResponse(200, sanitizedQuestions, 'Test questions loaded for attempt'));
    }

    res.status(200).json(new ApiResponse(200, questions, 'Questions fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }
    res.status(200).json(new ApiResponse(200, question, 'Question updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    if (question.testId) {
      await Test.findByIdAndUpdate(question.testId, { $pull: { questions: question._id } });
    }

    await question.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Question deleted successfully'));
  } catch (error) {
    next(error);
  }
};
