import { Result } from '../models/Result.js';
import { Test } from '../models/Test.js';
import { Question } from '../models/Question.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { calculateResult } from '../utils/calculateResult.js';
import { updateCollegeLeaderboard } from '../services/leaderboard.service.js';

export const submitTestResult = async (req, res, next) => {
  try {
    const { testId, answers = [], startedAt } = req.body;

    if (!testId) {
      throw new ApiError(400, 'Test ID is required for submission');
    }

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      throw new ApiError(404, 'Test not found');
    }

    // Strict Tenant Isolation Check
    if (test.collegeId.toString() !== req.user.collegeId.toString()) {
      throw new ApiError(403, 'Tenant Isolation Error: Cannot submit test for another college');
    }

    // Server-side Timer & Grace Period Validation
    const now = new Date();
    const startTime = startedAt ? new Date(startedAt) : new Date(now.getTime() - test.duration * 60 * 1000);
    const maxAllowedDurationMs = (test.duration * 60 + 120) * 1000; // duration + 2 minute grace period
    const elapsedMs = now.getTime() - startTime.getTime();

    let isLateSubmission = false;
    if (elapsedMs > maxAllowedDurationMs) {
      isLateSubmission = true;
      console.warn(`[Exam Engine] Late submission detected for student ${req.user._id} on test ${testId}`);
    }

    // Check attempts allowed
    const existingAttempts = await Result.countDocuments({
      studentId: req.user._id,
      testId
    });

    if (test.attemptsAllowed > 0 && existingAttempts >= test.attemptsAllowed) {
      throw new ApiError(400, `Maximum test attempts (${test.attemptsAllowed}) reached`);
    }

    // Fetch questions map for fast lookup
    const questionsList = await Question.find({ testId: test._id });
    const questionsMap = {};
    questionsList.forEach(q => {
      questionsMap[q._id.toString()] = q;
    });

    console.log(`[Exam Submitted] Student ${req.user._id} (${req.user.name}) submitted exam for Test ID: ${testId}`);

    // Calculate marks and percentage using algorithm
    const resultMetrics = calculateResult(test, questionsMap, answers);

    console.log(`[Result Calculated] Score: ${resultMetrics.totalScore}, Percentage: ${resultMetrics.percentage}%, Status: ${resultMetrics.status}`);

    const result = await Result.create({
      studentId: req.user._id,
      testId: test._id,
      collegeId: test.collegeId,
      answers: resultMetrics.answers,
      totalScore: resultMetrics.totalScore,
      percentage: resultMetrics.percentage,
      status: resultMetrics.status,
      startedAt: startTime,
      submittedAt: now
    });

    console.log(`[Result Saved in MongoDB] Result ID: ${result._id}`);

    // Asynchronously trigger updated college leaderboard calculations
    updateCollegeLeaderboard(test.collegeId)
      .then(() => console.log(`[Leaderboard Updated] College tenant ${test.collegeId} leaderboard recalculation completed.`))
      .catch(err => console.error('[Leaderboard Update Error]', err));

    res.status(201).json(
      new ApiResponse(201, { result, isLateSubmission }, 'Test submitted and graded successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getStudentResults = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'Student') {
      filter.studentId = req.user._id;
      filter.collegeId = req.user.collegeId;
    } else {
      if (req.tenantCollegeId) filter.collegeId = req.tenantCollegeId;
      if (req.query.studentId) filter.studentId = req.query.studentId;
    }

    if (req.query.testId) filter.testId = req.query.testId;

    const results = await Result.find(filter)
      .populate('testId', 'title duration passingMarks totalMarks')
      .populate('studentId', 'name email rollNumber')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, results, 'Results retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTestResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('testId')
      .populate('studentId', 'name email rollNumber department')
      .populate('answers.questionId');

    if (!result) {
      throw new ApiError(404, 'Result record not found');
    }

    // Strict Tenant Check
    if (req.user.role === 'Student') {
      if (result.studentId._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Access denied: You can only view your own result');
      }
    }

    res.status(200).json(new ApiResponse(200, result, 'Result details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTestAnalytics = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const filter = { testId };

    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    const results = await Result.find(filter);

    const totalSubmissions = results.length;
    const passedCount = results.filter(r => r.status === 'Passed').length;
    const failedCount = totalSubmissions - passedCount;
    const passPercentage = totalSubmissions > 0 ? (passedCount / totalSubmissions) * 100 : 0;
    const avgPercentage = totalSubmissions > 0 ? results.reduce((a, r) => a + r.percentage, 0) / totalSubmissions : 0;

    res.status(200).json(
      new ApiResponse(200, {
        totalSubmissions,
        passedCount,
        failedCount,
        passPercentage: Math.round(passPercentage * 100) / 100,
        avgPercentage: Math.round(avgPercentage * 100) / 100
      }, 'Test analytics calculated')
    );
  } catch (error) {
    next(error);
  }
};
