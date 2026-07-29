import { Question } from '../models/Question.js';
import { Test } from '../models/Test.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const addQuestionToTest = async (req, res, next) => {
  try {
    const { testId, studyMaterialId, subject, questionText, options, correctAnswer, explanation, marks, difficulty, source, collegeId } = req.body;

    if (!questionText || !options || !correctAnswer) {
      throw new ApiError(400, 'Question text, options, and correct answer are required');
    }

    const assignedCollegeId = req.user.role === 'Admin' ? (collegeId || req.user.collegeId) : req.user.collegeId;

    let targetTest = null;
    if (testId) {
      targetTest = await Test.findById(testId);
    }

    const question = await Question.create({
      testId: testId || null,
      collegeId: targetTest ? targetTest.collegeId : assignedCollegeId,
      studyMaterialId: studyMaterialId || null,
      subject: subject || (targetTest ? targetTest.subject : 'General'),
      questionText,
      options,
      correctAnswer,
      explanation: explanation || '',
      marks: marks || 1,
      difficulty: difficulty || 'Medium',
      source: source || 'Manual'
    });

    if (targetTest) {
      targetTest.questions.push(question._id);
      await targetTest.save();
    }

    res.status(201).json(new ApiResponse(201, question, 'Question created successfully'));
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
        question: q.questionText,
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

export const getAllQuestions = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    if (req.query.subject) filter.subject = new RegExp(req.query.subject, 'i');
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.studyMaterialId) filter.studyMaterialId = req.query.studyMaterialId;

    if (req.query.search) {
      filter.questionText = new RegExp(req.query.search, 'i');
    }

    const questions = await Question.find(filter)
      .populate('studyMaterialId', 'title fileType')
      .populate('testId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, questions, 'Question bank loaded successfully'));
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
