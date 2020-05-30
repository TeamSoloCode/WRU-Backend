import { Schema, Document, Model, model } from 'mongoose';

export interface IAnonymousUser extends Document {
	name: string;
	email: string;
	password: string;
	latitude: number;
	longitude: number;
	groupIds?: string[];
	imageUrl?: string;
	userCode: string;
	invitationIds?: string[];
}

const anonymousUser = new Schema({
	name: { type: String, maxlength: 40, required: true },
	email: { type: String, maxlength: 100, required: true },
	password: { type: String, maxlength: 100, required: true },
	latitude: { type: Number, required: true, max: 999, min: -999 },
	longitude: { type: Number, required: true, max: 999, min: -999 },
	groupIds: { type: [String] },
	imageUrl: { type: String },
	userCode: { type: String },
	invitationIds: { type: [String] },
});

export const AnonymousUser: Model<IAnonymousUser> = model<IAnonymousUser>(
	'AnonymousUser',
	anonymousUser,
	'AnonymousUsers'
);
