import { isValidObjectId } from 'mongoose';
import { AnonymousUser, IAnonymousUser } from '../schemas/AnonymousUser';
import { IResultType } from './service-result-type';
import { Group } from '../schemas/Group';
import shortid from 'shortid';

export const createAnonymousUser = async (userInfo: IAnonymousUser): Promise<IResultType> => {
	try {
		const { name, latitude, longitude, imageUrl } = userInfo;
		const user = new AnonymousUser();

		user.name = name;
		user.latitude = latitude;
		user.longitude = longitude;
		user.imageUrl = imageUrl;
		user.userCode = shortid.generate();

		await user.save();
		return { err: false, message: 'Create use successful!!!', data: user._id };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const getAnonymousGroupMembers = async (userId: string, groupId: string): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
		const isUserInTheGroup = await AnonymousUser.findOne({
			_id: userId,
			groupIds: groupId,
		}).lean();

		if (isUserInTheGroup) {
			const groupInfo = await Group.findById(groupId).lean();
			return { err: false, data: groupInfo ? groupInfo?.members : [] };
		}
		return { err: true, message: 'You are not in the group' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const updateAnonymousUserLocation = async (
	userId: string,
	latitude: number,
	longitude: number
): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
		await AnonymousUser.updateOne({ _id: userId }, { latitude, longitude });
		return { err: false, message: 'Update location successful' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const getAnonymousUserByCode = async (userCode: string): Promise<IResultType> => {
	try {
		const user = await AnonymousUser.findOne({ userCode }).lean();
		if (!user) return { err: false, message: 'User is not exists !' };
		return { err: false, data: user };
	} catch (err) {
		return { err: true, message: err };
	}
};

export const addAnonymousUserGroups = async (userId: string, groupId: string): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
		if (!isValidObjectId(groupId)) return { err: true, message: 'Invalid group id' };
		const user = await AnonymousUser.findById(userId);
		if (user) {
			user.groupIds?.push(groupId);
			await user.save();
			return { err: false, message: 'Add new group successful !!!' };
		}
		return { err: true, message: 'User is not exists !' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const addUserNewInvitation = async (userCode: string, invitationId: string): Promise<IResultType> => {
	try {
		const findUserResult = await getAnonymousUserByCode(userCode);
		if (findUserResult.err) return { err: true, message: findUserResult.message };
		const user: IAnonymousUser = findUserResult.data;
		user.invitationIds?.push(invitationId);
		await user.save();
		return { err: false, message: 'Update user invitaions successful !!' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};
