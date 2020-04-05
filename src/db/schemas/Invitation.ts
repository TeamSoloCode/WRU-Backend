import { Schema, Document, Model, model } from 'mongoose';
import { INVITATION_STATUS } from '../../constants/server-constants';

export interface IInvitation extends Document {
	inviterId: string;
	invitedUserCode: string;
	groupId: string;
	message?: string;
	status?: INVITATION_STATUS.DENIED_STATUS | INVITATION_STATUS.ACCEPTED_STATUS | INVITATION_STATUS.WAITING_STATUS;
	createTime?: number;
}

const invitation = new Schema({
	inviterId: { type: String, required: true, maxlength: 24 },
	invitedUserCode: { type: String, required: true, maxlength: 24 },
	groupId: { type: String, required: true, maxlength: 24 },
	message: { type: String, maxlength: 512 },
	status: { type: String, default: INVITATION_STATUS.WAITING_STATUS },
	createTime: { type: Number, default: new Date().getTime() }
});

export const Invitation: Model<IInvitation> = model<IInvitation>('Invitation', invitation, 'Invitations');
