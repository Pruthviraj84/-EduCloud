import { Result } from '../models/Result.js';
import { Test } from '../models/Test.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { User } from '../models/User.js';

/**
 * Calculates and updates leaderboard metrics for all students within a collegeId.
 * Formula:
 * Score = (Avg Score * 0.5) + (Accuracy % * 0.3) + (Completion Rate % * 0.2)
 * Rank students strictly within their own collegeId.
 */
export const updateCollegeLeaderboard = async (collegeId) => {
  try {
    if (!collegeId) return;

    // Get total published tests available for this college
    const totalCollegeTests = await Test.countDocuments({ collegeId });
    const students = await User.find({ collegeId, role: 'Student' }).select('_id');

    const leaderboardEntries = [];

    for (const student of students) {
      const studentResults = await Result.find({ studentId: student._id, collegeId });

      if (studentResults.length === 0) {
        leaderboardEntries.push({
          collegeId,
          studentId: student._id,
          averageScore: 0,
          accuracy: 0,
          testsCompleted: 0,
          scoreFormulaValue: 0,
          rank: 0
        });
        continue;
      }

      // Calculate Average Score %
      const avgPercentage =
        studentResults.reduce((acc, r) => acc + (r.percentage || 0), 0) /
        studentResults.length;

      // Calculate Total Accuracy % across all individual answers submitted
      let totalQuestionsAnswered = 0;
      let totalCorrectAnswers = 0;

      for (const res of studentResults) {
        for (const ans of res.answers) {
          if (ans.selectedOption) {
            totalQuestionsAnswered++;
            if (ans.isCorrect) {
              totalCorrectAnswers++;
            }
          }
        }
      }

      const accuracyPct =
        totalQuestionsAnswered > 0
          ? (totalCorrectAnswers / totalQuestionsAnswered) * 100
          : 0;

      // Completion Rate %
      const testsCompletedCount = studentResults.length;
      const completionRatePct =
        totalCollegeTests > 0
          ? Math.min(100, (testsCompletedCount / totalCollegeTests) * 100)
          : 100;

      // Apply required ranking formula: (Avg Score * 0.5) + (Accuracy % * 0.3) + (Completion Rate % * 0.2)
      const scoreFormulaValue =
        avgPercentage * 0.5 + accuracyPct * 0.3 + completionRatePct * 0.2;

      leaderboardEntries.push({
        collegeId,
        studentId: student._id,
        averageScore: Math.round(avgPercentage * 100) / 100,
        accuracy: Math.round(accuracyPct * 100) / 100,
        testsCompleted: testsCompletedCount,
        scoreFormulaValue: Math.round(scoreFormulaValue * 100) / 100
      });
    }

    // Sort entries descending by scoreFormulaValue
    leaderboardEntries.sort((a, b) => b.scoreFormulaValue - a.scoreFormulaValue);

    // Assign rank and bulk update DB
    for (let i = 0; i < leaderboardEntries.length; i++) {
      const entry = leaderboardEntries[i];
      const rank = i + 1;

      await Leaderboard.findOneAndUpdate(
        { collegeId: entry.collegeId, studentId: entry.studentId },
        {
          collegeId: entry.collegeId,
          studentId: entry.studentId,
          averageScore: entry.averageScore,
          accuracy: entry.accuracy,
          testsCompleted: entry.testsCompleted,
          scoreFormulaValue: entry.scoreFormulaValue,
          rank
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Leaderboard Calculation Error:', error.message);
  }
};
