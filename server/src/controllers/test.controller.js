import { Test } from '../models/Test.js';
import { Question } from '../models/Question.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { extractTextFromPDF } from '../services/pdf.service.js';
import { generateAIQuestions } from '../services/ai.service.js';

export const createTest = async (req, res, next) => {
  try {
    const { title, description, subjectId, department, duration, passingMarks, attemptsAllowed, shuffleQuestions, shuffleOptions, schedule, negativeMarking, collegeId } = req.body;

    if (!title || !duration || !schedule?.endDate) {
      throw new ApiError(400, 'Test title, duration, and scheduled end date are required');
    }

    const assignedCollegeId = req.user.role === 'Admin' ? (collegeId || req.user.collegeId) : req.user.collegeId;

    if (!assignedCollegeId) {
      throw new ApiError(400, 'College ID is required to create a test');
    }

    const test = await Test.create({
      title,
      description: description || '',
      collegeId: assignedCollegeId,
      subjectId: subjectId || null,
      department: department || 'General',
      duration: parseInt(duration),
      passingMarks: passingMarks ? parseInt(passingMarks) : 40,
      attemptsAllowed: attemptsAllowed ? parseInt(attemptsAllowed) : 1,
      shuffleQuestions: shuffleQuestions ?? true,
      shuffleOptions: shuffleOptions ?? true,
      schedule: {
        startDate: schedule.startDate || new Date(),
        endDate: schedule.endDate
      },
      negativeMarking: negativeMarking ? parseFloat(negativeMarking) : 0,
      createdBy: req.user._id
    });

    res.status(201).json(new ApiResponse(201, test, 'Test created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTests = async (req, res, next) => {
  try {
    const filter = {};

    // Strict Tenant Isolation
    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    if (req.query.department) filter.department = req.query.department;

    const tests = await Test.find(filter)
      .populate('subjectId', 'name code')
      .populate('questions')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, tests, 'Tests fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('subjectId', 'name code')
      .populate('questions')
      .populate('collegeId', 'name code');

    if (!test) {
      throw new ApiError(404, 'Test not found');
    }

    // Strict Tenant Isolation Check
    if (req.user.role === 'Student' && test.collegeId._id.toString() !== req.user.collegeId.toString()) {
      throw new ApiError(403, 'Tenant Isolation Error: Access denied to test from another college');
    }

    res.status(200).json(new ApiResponse(200, test, 'Test details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) {
      throw new ApiError(404, 'Test not found');
    }
    res.status(200).json(new ApiResponse(200, test, 'Test updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      throw new ApiError(404, 'Test not found');
    }

    // Delete associated questions
    await Question.deleteMany({ testId: test._id });
    await test.deleteOne();

    res.status(200).json(new ApiResponse(200, null, 'Test and associated questions deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const generateTestWithAI = async (req, res, next) => {
  try {
    const { testTitle, questionCount = 5, subjectName = 'General', textInput, collegeId, duration = 30 } = req.body;

    let extractedText = textInput || '';

    // If PDF file uploaded, extract text using pdf.service.js
    if (req.file) {
      extractedText = await extractTextFromPDF(req.file.path);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new ApiError(400, 'Please provide text material or upload a valid PDF document to generate questions');
    }

    const targetCollegeId = req.user.role === 'Admin' ? (collegeId || req.user.collegeId) : req.user.collegeId;

    if (!targetCollegeId) {
      throw new ApiError(400, 'Target College ID is required for AI question generation');
    }

    // 1. Generate questions via AI Service
    const aiQuestionsData = await generateAIQuestions({
      textContent: extractedText,
      count: parseInt(questionCount),
      subjectName
    });

    // 2. Create the Test document
    const newTest = await Test.create({
      title: testTitle || `AI Test: ${subjectName} (${new Date().toLocaleDateString()})`,
      description: `Auto-generated test created from uploaded learning material using OpenAI JSON Pipeline.`,
      collegeId: targetCollegeId,
      duration: parseInt(duration),
      schedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
      },
      createdBy: req.user._id
    });

    // 3. Save Questions in DB and link to Test
    const createdQuestions = [];
    for (const qData of aiQuestionsData) {
      const qDoc = await Question.create({
        testId: newTest._id,
        collegeId: targetCollegeId,
        questionText: qData.questionText,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation || '',
        marks: qData.marks || 1,
        difficulty: qData.difficulty || 'Medium',
        source: 'AI'
      });
      createdQuestions.push(qDoc);
    }

    newTest.questions = createdQuestions.map(q => q._id);
    await newTest.save();

    const populatedTest = await Test.findById(newTest._id).populate('questions');

    res.status(201).json(
      new ApiResponse(201, { test: populatedTest, questionCount: createdQuestions.length }, 'AI Test generated successfully')
    );
  } catch (error) {
    next(error);
  }
};
