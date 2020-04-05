import { isValidObjectId } from 'mongoose';
import { Invitation } from '../schemas/Invitation';
import { IResultType } from './service-result-type';
import { addUserNewInvitation } from './anonymous-user';
import { isGroupExists } from './isGroupExists';
import { isMemberOfTheGroup } from './utils-service';
import { AnonymousUser, IAnonymousUser } from '../schemas/AnonymousUser';
import { INVITATION_STATUS } from '../../constants/server-constants';
import { addNewUserIntoTheGroup } from './group-services';

export const createAnonymousUserInvitation = async (
	inviterId: string,
	invitedUserCode: string,
	groupId: string,
	message: string = ''
): Promise<IResultType> => {
	try {
		if (!isValidObjectId(inviterId)) return { err: true, message: 'Invalid user id' };
		if (!isValidObjectId(groupId)) return { err: true, message: 'Invalid group id' };
		if (!(await isGroupExists(groupId))) return { err: true, message: 'Group is not exist' };
		if (!(await areUsersInviteThemseft(inviterId, invitedUserCode))) {
			return { err: true, message: "You can't invite yourseft" };
		}
		if (!(await isMemberOfTheGroup(inviterId, groupId))) {
			return { err: true, message: 'You are not a member of this group' };
		}

		const newInvitation = new Invitation();
		newInvitation.inviterId = inviterId;
		newInvitation.invitedUserCode = invitedUserCode;
		newInvitation.groupId = groupId;
		if (message !== '') newInvitation.message = message;
		await newInvitation.save();
		const addNewInvitationResult = await addUserNewInvitation(invitedUserCode, newInvitation._id);
		if (addNewInvitationResult.err) return { err: true, message: addNewInvitationResult.message };
		return { err: false, message: 'Invitaion is sent !!!' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const answerInvitation = async (
	invitationId: string,
	userId: string,
	status: INVITATION_STATUS.ACCEPTED_STATUS | INVITATION_STATUS.DENIED_STATUS
): Promise<IResultType> => {
	if (!isValidObjectId(invitationId)) return { err: true, message: 'Invalid invitation id' };
	if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
	if (!(await isUserInvited(userId, invitationId))) return { err: true, message: 'You are not invited' };
	try {
		switch (status) {
			case INVITATION_STATUS.ACCEPTED_STATUS: {
				const updatedInvitation = await Invitation.findOneAndUpdate(
					{ _id: invitationId },
					{ status: INVITATION_STATUS.ACCEPTED_STATUS },
					{ new: true }
				);
				if (updatedInvitation?.status === INVITATION_STATUS.ACCEPTED_STATUS) {
					await addNewUserIntoTheGroup(userId, updatedInvitation.groupId);
					return { err: false, message: 'Invitation is accepted !!' };
				}
				return { err: true, message: 'Invitation is not exist !!' };
			}

			case INVITATION_STATUS.DENIED_STATUS: {
				const updatedInvitation = await Invitation.findOneAndUpdate(
					{ _id: invitationId },
					{ status: INVITATION_STATUS.DENIED_STATUS },
					{ new: true }
				);
				if (updatedInvitation?.status === INVITATION_STATUS.DENIED_STATUS)
					return { err: false, message: 'Invitation is denied !!' };
				return { err: true, message: 'Invitation is not exist !!' };
			}

			default:
				return { err: true, message: 'Wrong status !' };
		}
	} catch (err) {
		return { err: true, message: err.message };
	}
};

async function areUsersInviteThemseft(userId: String, invitedUserCode: string): Promise<Boolean> {
	try {
		const inviterInfo = await AnonymousUser.findById(userId).lean();
		if (!inviterInfo) return false;
		const inviter: IAnonymousUser = inviterInfo;
		if (inviter.userCode === invitedUserCode) return false;
		return true;
	} catch (err) {
		throw err;
	}
}

async function isUserInvited(userId: string, invitationId: string): Promise<Boolean> {
	try {
		const user = await AnonymousUser.findOne({ _id: userId, invitationIds: invitationId });
		if (!user) return false;
		return true;
	} catch (err) {
		throw err;
	}
}
