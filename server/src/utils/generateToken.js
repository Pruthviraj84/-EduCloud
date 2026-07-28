import jwt from 'jsonwebtoken';

export const generateToken = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, collegeId: user.collegeId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_2026_change_this_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);
  return token;
};
