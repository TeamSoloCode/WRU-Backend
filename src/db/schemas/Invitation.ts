import { Schema, Document, Model, model } from 'mongoose';

export interface IInvitation extends Document {
	userId: string;
}

export interface IInviter extends Document {
	inviterId: string;
	groupId: string;
	message: string;
}

const inviter = new Schema<IInviter>({
	inviterId: { type: String, required: true, maxlength: 24 },
	groupId: { type: String, required: true, maxlength: 24 },
	message: { type: String, maxlength: 512 },
	isResponsed: { type: Boolean, default: false }
});

const invitation = new Schema({
	userId: { type: String, maxlength: 24 },
	invitations: { type: [inviter] }
});

export const Group: Model<IInvitation> = model<IInvitation>('Invitation', invitation, 'Invitations');
