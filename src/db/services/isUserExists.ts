import { isValidObjectId } from 'mongoose';
import { AnonymousUser } from '../schemas/AnonymousUser';

export const isAnonymousExists = async (userId: string): Promise<Boolean> => {
	if (!isValidObjectId(userId)) return false;
	if (!(await AnonymousUser.findById(userId))) return false;
	return true;
};
