import jwt from 'jsonwebtoken'; import bcrypt from 'bcryptjs';
export const hashPassword=p=>bcrypt.hash(p,12); export const verifyPassword=(p,h)=>bcrypt.compare(p,h);
export const signToken=u=>jwt.sign({id:u.id,role:u.role,email:u.email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'7d'});
export function getToken(req){const a=req.headers.authorization;if(a?.startsWith('Bearer '))return a.slice(7);return req.cookies?.novis_token||null;}
export const verifyToken=t=>jwt.verify(t,process.env.JWT_SECRET);
