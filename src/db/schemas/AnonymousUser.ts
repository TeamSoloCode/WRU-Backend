import { Schema, Document, Model, model } from 'mongoose';

export interface IAnonymousUser extends Document {
	name?: string;
	latitude: number;
	longitude: number;
	groupIds?: [string];
	imageUrl?: string;
}

const anonymousUser = new Schema({
	name: { type: String, maxlength: 24 },
	latitude: { type: Number, required: true, max: 200, min: -200 },
	longitude: { type: Number, required: true, max: 200, min: -200 },
	groupIds: { type: [String] },
	imageUrl: { type: String }
});

export const AnonymousUser: Model<IAnonymousUser> = model<IAnonymousUser>(
	'AnonymousUser',
	anonymousUser,
	'AnonymousUsers'
);
