import { isValidObjectId } from 'mongoose';
import { Invitation, IInvitation } from '../schemas/Invitation';
import { IResultType } from './service-result-type';
import { addUserNewInvitation } from './anonymous-user';
import { isGroupExists } from './isGroupExists';
import { isMemberOfTheGroup, areUsersInviteThemseft, isUserInvited } from './utils-service';
import { AnonymousUser, IAnonymousUser } from '../schemas/AnonymousUser';
import { INVITATION_STATUS } from '../../constants/server-constants';
import { addNewUserIntoTheGroup } from './group-services';
import { db } from '../..';
import { Group } from '../schemas/Group';

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
	const session = await db.startSession();

	try {
		switch (status) {
			case INVITATION_STATUS.ACCEPTED_STATUS: {
				session.startTransaction();
				const updatedInvitation = await Invitation.findOneAndUpdate(
					{ _id: invitationId },
					{ status: INVITATION_STATUS.ACCEPTED_STATUS },
					{ new: true }
				);
				if (updatedInvitation?.status === INVITATION_STATUS.ACCEPTED_STATUS) {
					await addNewUserIntoTheGroup(userId, updatedInvitation.groupId, session);
					await session.commitTransaction();
					return { err: false, message: 'Invitation is accepted !!' };
				}
				session.abortTransaction();
				session.endSession();
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
		if (session) {
			session.abortTransaction();
			session.endSession();
		}
		return { err: true, message: err.message };
	}
};

export async function getGetUserInvitation(userId: string): Promise<IResultType> {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };

		const userInfo = await AnonymousUser.findById(userId).lean();
		if (!userInfo) return { err: true, message: 'User is not exists !' };
		const user: IAnonymousUser = userInfo;

		const getInvitationPromises: any[] = [];
		user.invitationIds?.map((invitationId) => getInvitationPromises.push(Invitation.findById(invitationId).lean()));
		const invitationInfo = await Promise.all<IInvitation>(getInvitationPromises);

		const getInviterPromises: any[] = [];
		invitationInfo.map((invitation) => getInviterPromises.push(AnonymousUser.findById(invitation.inviterId).lean()));
		const inviterInfo = await Promise.all<IAnonymousUser>(getInviterPromises);

		const result: any[] = [];

		for (const invitation of invitationInfo) {
			const inviter = inviterInfo.find((inviter) => invitation.inviterId == inviter._id);
			if (inviter) {
				const group = await Group.findById({ _id: invitation.groupId }).lean();
				if (group) {
					result.push({
						invitationId: invitation._id,
						createTime: invitation.createTime,
						status: invitation.status,
						message: invitation.message,
						groupName: group?.name,
						inviter: {
							name: inviter.name,
							imageUrl: inviter.imageUrl,
						},
					});
				}
			}
		}

		return { err: false, data: result };
	} catch (err) {
		return { err: true, message: err.message };
	}
}
