import { updateAnonymousUserLocation } from '../db/services/anonymous-user';
import { IAnonymousUserLocation } from './socket-data-models';

export const updatetUserLocation = (location: IAnonymousUserLocation) => {
	updateAnonymousUserLocation(location.uid, location.lat, location.long);
};
