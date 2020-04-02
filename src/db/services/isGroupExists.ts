import { isValidObjectId } from 'mongoose';
import { Group } from '../schemas/Group';

export const isGroupExists = async (groupId: string): Promise<Boolean> => {
	if (!isValidObjectId(groupId)) return false;
	console.log(await Group.findById(groupId));
	return true;
};
