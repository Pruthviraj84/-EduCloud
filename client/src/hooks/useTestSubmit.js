import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../services/testApi';

export const useTestSubmit = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submitTest = async ({ testId, answers, startedAt }) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await testApi.submitTest({
        testId,
        answers,
        startedAt
      });
      if (res.success && res.data?.result?._id) {
        navigate(`/student/results/${res.data.result._id}`);
      }
      return res;
    } catch (err) {
      setError(err.message || 'Submission failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitTest, submitting, error };
};
