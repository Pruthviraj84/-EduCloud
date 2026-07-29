import { Test } from '../models/Test.js';
import { Question } from '../models/Question.js';
import { Material } from '../models/Material.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { extractTextFromFile } from '../services/fileExtraction.service.js';
import { generateGeminiQuestions } from '../services/gemini.service.js';

export const createTest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      studyMaterialId,
      subject,
      department,
      duration,
      passingMarks,
      attemptsAllowed,
      shuffleQuestions,
      shuffleOptions,
      schedule,
      negativeMarking,
      collegeId
    } = req.body;

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
      studyMaterialId: studyMaterialId || null,
      subject: subject || 'General',
      department: department || 'General',
      duration: parseInt(duration, 10),
      passingMarks: passingMarks ? parseInt(passingMarks, 10) : 40,
      attemptsAllowed: attemptsAllowed ? parseInt(attemptsAllowed, 10) : 1,
      shuffleQuestions: shuffleQuestions ?? true,
      shuffleOptions: shuffleOptions ?? true,
      schedule: {
        startDate: schedule.startDate || new Date(),
        endDate: schedule.endDate
      },
      negativeMarking: negativeMarking ? parseFloat(negativeMarking) : 0,
      createdBy: req.user._id
    });

    console.log(`[Test Created] Manually created test ID: ${test._id}`);
    res.status(201).json(new ApiResponse(201, test, 'Test created successfully'));
  } catch (error) {
    next(error);
  }
};

export const generateTestWithGemini = async (req, res, next) => {
  try {
    const {
      testTitle,
      studyMaterialId,
      questionCount = 5,
      subject = 'General',
      difficulty = 'Medium',
      textInput,
      collegeId,
      duration = 30,
      passingMarks = 40,
      negativeMarking = 0,
      attemptsAllowed = 1,
      endDate
    } = req.body;

    let textContent = textInput || '';
    let targetMaterial = null;

    console.log(`[AI Generation Pipeline Started] Processing request for subject '${subject}', question count ${questionCount}...`);

    // 1. If studyMaterialId provided, fetch metadata & extract text from Cloudinary URL
    if (studyMaterialId) {
      targetMaterial = await Material.findById(studyMaterialId);
      if (!targetMaterial) {
        throw new ApiError(404, 'Selected study material not found');
      }
      if (!textContent) {
        console.log(`[Text Extraction] Extracting text from Cloudinary study material: ${targetMaterial.title}...`);
        textContent = await extractTextFromFile(targetMaterial.cloudinaryUrl);
      }
    }

    // 2. If uploaded file attached directly to request
    if (req.file) {
      console.log(`[Text Extraction] Extracting text from uploaded file: ${req.file.originalname}...`);
      textContent = await extractTextFromFile(req.file.path);
    }

    if (!textContent || textContent.trim().length === 0) {
      throw new ApiError(400, 'Could not extract readable text content. Please provide text input, upload a document, or select valid study material.');
    }

    console.log(`[Text Extraction Success] Extracted ${textContent.length} characters of text content.`);

    const targetCollegeId = req.user.role === 'Admin' ? (collegeId || req.user.collegeId) : req.user.collegeId;

    if (!targetCollegeId) {
      throw new ApiError(400, 'Target College ID is required for AI question generation');
    }

    // 3. Generate MCQs using Google Gemini API Service
    console.log(`[Gemini Request] Sending request to Google Gemini API...`);
    const aiQuestionsData = await generateGeminiQuestions({
      textContent,
      count: parseInt(questionCount, 10),
      subjectName: subject || (targetMaterial ? targetMaterial.subject : 'General'),
      difficulty
    });

    console.log(`[Gemini Response Received] ${aiQuestionsData.length} valid MCQs received from Gemini API.`);

    // 4. Create the Test document in MongoDB
    const scheduledEnd = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newTest = await Test.create({
      title: testTitle || `AI Exam: ${subject} (${new Date().toLocaleDateString()})`,
      description: `Auto-generated examination created from study material using Google Gemini API.`,
      collegeId: targetCollegeId,
      studyMaterialId: studyMaterialId || null,
      subject: subject || (targetMaterial ? targetMaterial.subject : 'General'),
      duration: parseInt(duration, 10),
      passingMarks: parseInt(passingMarks, 10),
      negativeMarking: parseFloat(negativeMarking),
      attemptsAllowed: parseInt(attemptsAllowed, 10),
      schedule: {
        startDate: new Date(),
        endDate: scheduledEnd
      },
      createdBy: req.user._id
    });

    console.log(`[Test Document Created] ID: ${newTest._id}`);

    // 5. Save every generated question in MongoDB and link to Test
    const createdQuestions = [];
    for (const qData of aiQuestionsData) {
      const qDoc = await Question.create({
        testId: newTest._id,
        collegeId: targetCollegeId,
        studyMaterialId: studyMaterialId || null,
        subject: newTest.subject,
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

    console.log(`[Questions Saved in MongoDB] ${createdQuestions.length} questions saved.`);

    newTest.questions = createdQuestions.map(q => q._id);
    await newTest.save();

    const populatedTest = await Test.findById(newTest._id).populate('questions');

    console.log(`[AI Test Generation Complete] Test '${newTest.title}' ready for students.`);

    res.status(201).json(
      new ApiResponse(201, { test: populatedTest, questionCount: createdQuestions.length }, 'AI Test generated successfully using Google Gemini')
    );
  } catch (error) {
    console.error(`[AI Test Generation Failure]`, error.stack);
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
    if (req.query.subject) filter.subject = req.query.subject;

    const tests = await Test.find(filter)
      .populate('studyMaterialId', 'title cloudinaryUrl fileType')
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
      .populate('studyMaterialId', 'title cloudinaryUrl fileType')
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
